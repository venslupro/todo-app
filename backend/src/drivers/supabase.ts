import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppConfig } from '../shared/types/common';

export class SupabaseDriver {
  private client: SupabaseClient;
  private serviceRoleClient: SupabaseClient;

  constructor(config: AppConfig) {
    this.client = createClient(config.supabaseUrl, config.supabaseAnonKey);
    this.serviceRoleClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getServiceRoleClient(): SupabaseClient {
    return this.serviceRoleClient;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client.from('todos').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

export class AuthDriver {
  constructor(private supabase: SupabaseDriver) {}

  async register(email: string, password: string, userData?: { username?: string; fullName?: string }) {
    const { data, error } = await this.supabase.getClient().auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;
    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.getClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.getClient().auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) throw error;
    return data;
  }

  async logout(accessToken: string) {
    const { error } = await this.supabase.getClient().auth.signOut();
    if (error) throw error;
  }

  async getUser(accessToken: string) {
    const { data: { user }, error } = await this.supabase.getServiceRoleClient().auth.getUser(accessToken);
    if (error) throw error;
    return user;
  }
}

export class TodoDriver {
  constructor(private supabase: SupabaseDriver) {}

  async getAllTodos(userId: string, filters?: any, pagination?: any) {
    let query = this.supabase.getClient()
      .from('todos')
      .select('*', { count: 'exact' })
      .eq('created_by', userId)
      .eq('is_deleted', false);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters?.dueDateBefore) {
      query = query.lte('due_date', filters.dueDateBefore);
    }

    if (filters?.dueDateAfter) {
      query = query.gte('due_date', filters.dueDateAfter);
    }

    if (filters?.tags) {
      query = query.contains('tags', filters.tags);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (pagination?.sortBy) {
      query = query.order(pagination.sortBy, { ascending: pagination.sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (pagination?.limit) {
      query = query.limit(pagination.limit);
    }

    if (pagination?.offset) {
      query = query.range(pagination.offset, pagination.offset + (pagination.limit || 50) - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      todos: data || [],
      total: count || 0,
      limit: pagination?.limit || 50,
      offset: pagination?.offset || 0,
    };
  }

  async getTodoById(id: string, userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('todos')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;
    return data;
  }

  async createTodo(todoData: any, userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('todos')
      .insert({
        ...todoData,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTodo(id: string, todoData: any, userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('todos')
      .update({
        ...todoData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTodo(id: string, userId: string) {
    const { error } = await this.supabase.getClient()
      .from('todos')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('created_by', userId);

    if (error) throw error;
  }
}

export class MediaDriver {
  constructor(private supabase: SupabaseDriver) {}

  async getAllMedia(userId: string, filters?: any) {
    let query = this.supabase.getClient()
      .from('media')
      .select('*')
      .eq('created_by', userId);

    if (filters?.todoId) {
      query = query.eq('todo_id', filters.todoId);
    }

    if (filters?.mediaType) {
      query = query.eq('media_type', filters.mediaType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { media: data || [] };
  }

  async createMedia(mediaData: any, userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('media')
      .insert({
        ...mediaData,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMedia(id: string, mediaData: any, userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('media')
      .update({
        ...mediaData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMedia(id: string, userId: string) {
    const { error } = await this.supabase.getClient()
      .from('media')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (error) throw error;
  }
}