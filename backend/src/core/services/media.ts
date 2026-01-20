// src/services/media.ts
// Media service for handling media-related business logic

import {Result, err, ok} from 'neverthrow';
import {MediaDriver} from '../drivers/media';
import {TeamDriver} from '../drivers/team';
import {Media, MediaFilterOptions} from '../models/types';

interface MediaServiceOptions {
  mediaDriver: MediaDriver;
  teamDriver: TeamDriver;
}

export class MediaService {
  private readonly mediaDriver: MediaDriver;
  private readonly teamDriver: TeamDriver;

  constructor(options: MediaServiceOptions) {
    this.mediaDriver = options.mediaDriver;
    this.teamDriver = options.teamDriver;
  }

  /**
   * Get all media items with filtering options
   */
  async getMedia(
    userId: string,
    filters: MediaFilterOptions = {},
  ): Promise<Result<Media[], Error>> {
    try {
      // If todo_id is provided, check if the user has permission to access it
      if (filters.todo_id) {
        const permissionResult = await this.teamDriver.checkTodoPermission(
          filters.todo_id,
          userId,
        );

        if (permissionResult.isErr() || !permissionResult.value) {
          return err(new Error('Permission denied: Cannot access media for this todo'));
        }
      }

      // Call driver to get media
      const result = await this.mediaDriver.getMedia(userId, filters);

      if (result.isErr()) {
        return err(new Error(`Get media failed: ${result.error.message}`));
      }

      return ok(result.value);
    } catch (error) {
      return err(new Error(`Get media error: ${(error as Error).message}`));
    }
  }

  /**
   * Generate a presigned upload URL for media
   */
  async generateUploadUrl(
    userId: string,
    todoId: string,
    fileName: string,
    mimeType: string,
    fileSize: number,
  ): Promise<Result<{ uploadUrl: string; mediaId: string }, Error>> {
    try {
      // Check if user has permission to add media to the todo
      const permissionResult = await this.teamDriver.checkTodoPermission(
        todoId,
        userId,
        'edit',
      );

      if (permissionResult.isErr() || !permissionResult.value) {
        return err(new Error('Permission denied: Cannot add media to this todo'));
      }

      // Call driver to generate upload URL
      const result = await this.mediaDriver.generateUploadUrl(
        userId,
        todoId,
        fileName,
        mimeType,
        fileSize,
      );

      if (result.isErr()) {
        return err(new Error(`Generate upload URL failed: ${result.error.message}`));
      }

      return ok(result.value);
    } catch (error) {
      return err(new Error(`Generate upload URL error: ${(error as Error).message}`));
    }
  }

  /**
   * Confirm upload completion
   */
  async confirmUpload(
    mediaId: string,
    userId: string,
    uploadSuccess: boolean,
  ): Promise<Result<Media, Error>> {
    try {
      // Check if the media exists and the user has permission
      const mediaListResult = await this.mediaDriver.getMedia(userId, {});

      if (mediaListResult.isErr()) {
        return err(new Error(`Failed to get media list: ${mediaListResult.error.message}`));
      }

      const media = mediaListResult.value.find((m: Media) => m.id === mediaId);

      if (!media) {
        return err(new Error('Media not found or permission denied'));
      }

      // Call driver to confirm upload
      const result = await this.mediaDriver.confirmUpload(mediaId, uploadSuccess);

      if (result.isErr()) {
        return err(new Error(`Confirm upload failed: ${result.error.message}`));
      }

      return ok(result.value);
    } catch (error) {
      return err(new Error(`Confirm upload error: ${(error as Error).message}`));
    }
  }
}

export const createMediaService = (options: MediaServiceOptions): MediaService => {
  return new MediaService(options);
};
