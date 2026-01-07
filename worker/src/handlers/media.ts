import { Context } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type { FileUploadResponse } from '@/shared/types';

export async function uploadMediaHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const { todoId } = c.req.param();
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Check if todo exists and user has access
  const { error: todoError } = await supabase
    .from('todos')
    .select('id, created_by')
    .eq('id', todoId)
    .eq('created_by', user.id)
    .single();
    
  if (todoError) {
    return c.json({
      error: 'Not Found',
      message: 'Todo not found or access denied'
    }, 404);
  }
  
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return c.json({
      error: 'Bad Request',
      message: 'No file provided'
    }, 400);
  }
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return c.json({
      error: 'Bad Request',
      message: 'File size exceeds 10MB limit'
    }, 400);
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
  if (!allowedTypes.includes(file.type)) {
    return c.json({
      error: 'Bad Request',
      message: 'Unsupported file type'
    }, 400);
  }
  
  // Generate unique filename
  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  
  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(`todos/${todoId}/${fileName}`, file);
  
  if (uploadError) {
    return c.json({
      error: 'Upload Error',
      message: 'Failed to upload file'
    }, 500);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(`todos/${todoId}/${fileName}`);
  
  // Save metadata to database
  const { data: media, error: dbError } = await supabase
    .from('media_attachments')
    .insert([{
      todo_id: todoId,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      url: publicUrl,
      created_by: user.id
    }])
    .select()
    .single();
  
  if (dbError) {
    // Clean up uploaded file if database insert fails
    await supabase.storage
      .from('media')
      .remove([`todos/${todoId}/${fileName}`]);
      
    return c.json({
      error: 'Database Error',
      message: 'Failed to save file metadata'
    }, 500);
  }
  
  const response: FileUploadResponse = {
    id: media.id,
    filename: media.filename,
    mimetype: media.mimetype,
    size: media.size,
    url: media.url,
    created_at: media.created_at
  };
  
  return c.json(response, 201);
}

export async function listMediaHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const { todoId } = c.req.param();
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Check if user has access to the todo
  const { data: todo } = await supabase
    .from('todos')
    .select('id')
    .eq('id', todoId)
    .or(`created_by.eq.${user.id},team_id.is.null,team_id.in.(select team_id from team_members where user_id.eq.${user.id})`)
    .single();
    
  if (!todo) {
    return c.json({
      error: 'Not Found',
      message: 'Todo not found or access denied'
    }, 404);
  }
  
  const { data: media, error } = await supabase
    .from('media_attachments')
    .select('*')
    .eq('todo_id', todoId)
    .order('created_at', { ascending: false });
  
  if (error) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to fetch media'
    }, 500);
  }
  
  return c.json({ media: media || [] });
}

export async function deleteMediaHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const { mediaId } = c.req.param();
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Get media metadata
  const { data: media, error: mediaError } = await supabase
    .from('media_attachments')
    .select('*, todos!inner(created_by)')
    .eq('id', mediaId)
    .single();
    
  if (mediaError) {
    return c.json({
      error: 'Not Found',
      message: 'Media not found'
    }, 404);
  }
  
  // Check if user owns the todo
  if (media.todos.created_by !== user.id) {
    return c.json({
      error: 'Forbidden',
      message: 'Insufficient permissions'
    }, 403);
  }
  
  // Extract file path from URL
  const urlParts = media.url.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const filePath = `todos/${media.todo_id}/${fileName}`;
  
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('media')
    .remove([filePath]);
    
  if (storageError) {
    return c.json({
      error: 'Storage Error',
      message: 'Failed to delete file from storage'
    }, 500);
  }
  
  // Delete from database
  const { error: dbError } = await supabase
    .from('media_attachments')
    .delete()
    .eq('id', mediaId);
    
  if (dbError) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to delete file metadata'
    }, 500);
  }
  
  return c.body(null, 204);
}