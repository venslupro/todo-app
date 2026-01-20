// src/drivers/media.ts
// Media driver for handling media-related database operations

import {Result, err, ok} from 'neverthrow';
import {SupabaseDriver} from './supabase/supabase';
import {Media, MediaFilterOptions} from '../models/types';
import {Logger} from '../../shared/utils/logger';

interface MediaDriverOptions {
  supabase: SupabaseDriver;
  storageBucket: string;
  logger: Logger;
}

export class MediaDriver {
  private readonly supabase: SupabaseDriver;
  private readonly storageBucket: string;
  private readonly logger: Logger;

  constructor(options: MediaDriverOptions) {
    this.supabase = options.supabase;
    this.storageBucket = options.storageBucket;
    this.logger = options.logger;
  }

  /**
   * Get all media items with filtering options
   */
  async getMedia(
    userId: string,
    filters: MediaFilterOptions = {},
  ): Promise<Result<Media[], Error>> {
    try {
      this.logger.debug('MediaDriver: Getting media for user', {userId, filters});
      let query = this.supabase
        .getAnonClient()
        .from('media')
        .select()
        .or(`created_by.eq.${userId},todo_id.in.(${this.getSharedTodosQuery(userId)})`);

      // Apply filters
      if (filters.todo_id) {
        query = query.eq('todo_id', filters.todo_id);
      }

      if (filters.media_type) {
        query = query.eq('media_type', filters.media_type);
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      // Sort by created_at descending
      query = query.order('created_at', {ascending: false});

      const {data: media, error} = await query;

      if (error) {
        this.logger.error('MediaDriver: Get media failed', {userId, error: error.message});
        return err(new Error(`Get media failed: ${error.message}`));
      }

      this.logger.debug('MediaDriver: Got media successfully', {userId, count: media.length});
      return ok(media as Media[]);
    } catch (error) {
      this.logger.error('MediaDriver: Get media error', {userId, error: (error as Error).message});
      return err(new Error(`Get media error: ${(error as Error).message}`));
    }
  }

  /**
   * Create a media record and generate upload URL
   */
  async generateUploadUrl(
    userId: string,
    todoId: string,
    fileName: string,
    mimeType: string,
    fileSize: number,
  ): Promise<Result<{ uploadUrl: string; mediaId: string }, Error>> {
    try {
      this.logger.debug('MediaDriver: Generating upload URL', {userId, todoId, fileName});
      // Determine media type from mime type
      let mediaType: 'image' | 'video' = 'image';
      if (mimeType.startsWith('video/')) {
        mediaType = 'video';
      }

      // Create media record first
      const {data: media, error: insertError} = await this.supabase
        .getAnonClient()
        .from('media')
        .insert({
          todo_id: todoId,
          file_name: fileName,
          file_path: `${todoId}/${fileName}`,
          file_size: fileSize,
          mime_type: mimeType,
          media_type: mediaType,
          created_by: userId,
        })
        .select()
        .single();

      if (insertError) {
        this.logger.error('MediaDriver: Create media record failed', {userId, todoId, error: insertError.message});
        return err(new Error(`Create media record failed: ${insertError.message}`));
      }

      // Generate presigned upload URL
      const {data: uploadUrl, error: urlError} = await this.supabase
        .getAnonClient()
        .storage
        .from(this.storageBucket)
        .createSignedUrl(`${todoId}/${fileName}`, 3600); // 1 hour expiration

      if (urlError || !uploadUrl.signedUrl) {
        this.logger.error('MediaDriver: Generate upload URL failed', {userId, todoId, error: urlError?.message});
        return err(
          new Error(`Generate upload URL failed: ${urlError?.message || 'Unknown error'}`),
        );
      }

      this.logger.debug('MediaDriver: Generated upload URL successfully', {userId, mediaId: media.id});
      return ok({
        uploadUrl: uploadUrl.signedUrl,
        mediaId: media.id,
      });
    } catch (error) {
      this.logger.error('MediaDriver: Generate upload URL error', {userId, todoId, error: (error as Error).message});
      return err(new Error(`Generate upload URL error: ${(error as Error).message}`));
    }
  }

  /**
   * Confirm upload completion
   */
  async confirmUpload(
    mediaId: string,
    uploadSuccess: boolean,
  ): Promise<Result<Media, Error>> {
    try {
      this.logger.debug('MediaDriver: Confirming upload', {mediaId, uploadSuccess});
      if (!uploadSuccess) {
        // If upload failed, delete the media record
        await this.supabase
          .getAnonClient()
          .from('media')
          .delete()
          .eq('id', mediaId);

        this.logger.debug('MediaDriver: Upload failed, deleted media record', {mediaId});
        return err(new Error('Upload confirmation failed: Upload was not successful'));
      }

      // Get the media record
      const {data: media, error} = await this.supabase
        .getAnonClient()
        .from('media')
        .select()
        .eq('id', mediaId)
        .single();

      if (error) {
        this.logger.error('MediaDriver: Confirm upload failed', {mediaId, error: error.message});
        return err(new Error(`Confirm upload failed: ${error.message}`));
      }

      this.logger.debug('MediaDriver: Upload confirmed successfully', {mediaId, todoId: media.todo_id});
      return ok(media as Media);
    } catch (error) {
      this.logger.error('MediaDriver: Confirm upload error', {mediaId, error: (error as Error).message});
      return err(new Error(`Confirm upload error: ${(error as Error).message}`));
    }
  }

  /**
   * Get shared todos subquery for the user
   */
  private getSharedTodosQuery(userId: string): string {
    return `(SELECT todo_id FROM todo_shares WHERE user_id = '${userId}')`;
  }
}

export const createMediaDriver = (options: MediaDriverOptions): MediaDriver => {
  return new MediaDriver(options);
};
