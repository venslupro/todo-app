// shared/supabase/database.types.ts
// 数据库类型定义 - 手动创建，因为缺少自动生成的类型定义

/**
 * 数据库表类型定义
 */
export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          due_date: string | null;
          status: 'not_started' | 'in_progress' | 'completed';
          priority: 'low' | 'medium' | 'high' | 'urgent' | null;
          tags: string[] | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          parent_id: string | null;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          due_date?: string | null;
          status?: 'not_started' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null;
          tags?: string[] | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          parent_id?: string | null;
          is_deleted?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          due_date?: string | null;
          status?: 'not_started' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent' | null;
          tags?: string[] | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          parent_id?: string | null;
          is_deleted?: boolean;
        };
      };
      todo_shares: {
        Row: {
          id: string;
          todo_id: string;
          user_id: string;
          permission: 'view' | 'edit';
          shared_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          todo_id: string;
          user_id: string;
          permission: 'view' | 'edit';
          shared_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          todo_id?: string;
          user_id?: string;
          permission?: 'view' | 'edit';
          shared_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          todo_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          media_type: 'image' | 'video';
          duration: number | null;
          width: number | null;
          height: number | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          todo_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          media_type: 'image' | 'video';
          duration?: number | null;
          width?: number | null;
          height?: number | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          todo_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          mime_type?: string;
          media_type?: 'image' | 'video';
          duration?: number | null;
          width?: number | null;
          height?: number | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          user_id: string | null;
          ip_address: string;
          endpoint: string;
          count: number;
          window_start: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          ip_address: string;
          endpoint: string;
          count?: number;
          window_start?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          ip_address?: string;
          endpoint?: string;
          count?: number;
          window_start?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

/**
 * Supabase客户端类型
 */
export type SupabaseClient = any;

/**
 * 数据库查询结果类型
 */
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
