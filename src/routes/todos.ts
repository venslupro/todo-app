import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, ApiResponse, CreateTodoRequest, UpdateTodoRequest } from '../types';
import type { Todo, ListTodosResponse } from '../../shared/types';

const todoRoutes = new Hono<{ Bindings: Env }>();

// Validation schemas
const createTodoSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  due_date: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  tags: z.array(z.string()).default([]),
  assignee_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional()
});

const updateTodoSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  due_date: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  tags: z.array(z.string()).optional(),
  assignee_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional()
});

const listTodosSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
  tags: z.string().optional(),
  assignee_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
  sort_field: z.string().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().transform(Number).default('1'),
  page_size: z.string().transform(Number).default('20')
});

// Get all todos for user
todoRoutes.get('/', zValidator('query', listTodosSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  const searchParams = c.req.valid('query');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json<ApiResponse>({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization header'
    }, 401);
  }

  const token = authHeader.slice(7);
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return c.json<ApiResponse>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token'
      }, 401);
    }

    // Build base query
    let query = supabase
      .from('todos')
      .select('*, assignee:users(name, email)', { count: 'exact' })
      .or(`created_by.eq.${user.id},team_id.is.null,team_id.in.(select team_id from team_members where user_id.eq.${user.id})`);

    // Apply filters
    if (searchParams.status) {
      const statuses = searchParams.status.split(',');
      query = query.in('status', statuses);
    }
    
    if (searchParams.priority) {
      const priorities = searchParams.priority.split(',');
      query = query.in('priority', priorities);
    }
    
    if (searchParams.due_date_from) {
      query = query.gte('due_date', searchParams.due_date_from);
    }
    
    if (searchParams.due_date_to) {
      query = query.lte('due_date', searchParams.due_date_to);
    }
    
    if (searchParams.tags) {
      const tags = searchParams.tags.split(',');
      query = query.overlaps('tags', tags);
    }
    
    if (searchParams.assignee_id) {
      query = query.eq('assignee_id', searchParams.assignee_id);
    }
    
    if (searchParams.team_id) {
      query = query.eq('team_id', searchParams.team_id);
    }

    // Apply sorting
    query = query.order(searchParams.sort_field, { ascending: searchParams.sort_order === 'asc' });

    // Pagination
    const from = (searchParams.page - 1) * searchParams.page_size;
    const to = from + searchParams.page_size - 1;
    query = query.range(from, to);

    const { data: todos, error, count } = await query;

    if (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch todos'
      }, 500);
    }

    const response: ListTodosResponse = {
      todos: todos || [],
      total_count: count || 0,
      page: searchParams.page,
      page_size: searchParams.page_size
    };

    return c.json<ApiResponse<ListTodosResponse>>({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('List todos error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Create a new todo
todoRoutes.post('/', zValidator('json', createTodoSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  const todoData = c.req.valid('json');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json<ApiResponse>({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization header'
    }, 401);
  }

  const token = authHeader.slice(7);
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return c.json<ApiResponse>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token'
      }, 401);
    }

    // Validate team access if team_id is provided
    if (todoData.team_id) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', todoData.team_id)
        .eq('user_id', user.id)
        .single();

      if (!teamMember) {
        return c.json<ApiResponse>({
          success: false,
          error: 'FORBIDDEN',
          message: 'You are not a member of this team'
        }, 403);
      }
    }

    const { data: todo, error } = await supabase
      .from('todos')
      .insert([{
        ...todoData,
        created_by: user.id
      }])
      .select('*, assignee:users(name, email)')
      .single();

    if (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to create todo'
      }, 500);
    }

    return c.json<ApiResponse<Todo>>({
      success: true,
      data: todo,
      message: 'Todo created successfully'
    }, 201);
  } catch (error) {
    console.error('Create todo error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Get a single todo
todoRoutes.get('/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const todoId = c.req.param('id');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json<ApiResponse>({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization header'
    }, 401);
  }

  const token = authHeader.slice(7);
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return c.json<ApiResponse>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token'
      }, 401);
    }

    const { data: todo, error } = await supabase
      .from('todos')
      .select('*, assignee:users(name, email)')
      .eq('id', todoId)
      .or(`created_by.eq.${user.id},team_id.is.null,team_id.in.(select team_id from team_members where user_id.eq.${user.id})`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json<ApiResponse>({
          success: false,
          error: 'NOT_FOUND',
          message: 'Todo not found'
        }, 404);
      }
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch todo'
      }, 500);
    }

    return c.json<ApiResponse<Todo>>({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Get todo error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Update a todo
todoRoutes.put('/:id', zValidator('json', updateTodoSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  const todoId = c.req.param('id');
  const todoData = c.req.valid('json');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json<ApiResponse>({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization header'
    }, 401);
  }

  const token = authHeader.slice(7);
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return c.json<ApiResponse>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token'
      }, 401);
    }

    // Check if todo exists and user has access
    const { data: existingTodo, error: checkError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', todoId)
      .or(`created_by.eq.${user.id},team_id.in.(select team_id from team_members where user_id.eq.${user.id})`)
      .single();

    if (checkError || !existingTodo) {
      return c.json<ApiResponse>({
        success: false,
        error: 'NOT_FOUND',
        message: 'Todo not found or access denied'
      }, 404);
    }

    // Validate team access if changing team_id
    if (todoData.team_id && todoData.team_id !== existingTodo.team_id) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', todoData.team_id)
        .eq('user_id', user.id)
        .single();

      if (!teamMember) {
        return c.json<ApiResponse>({
          success: false,
          error: 'FORBIDDEN',
          message: 'You are not a member of this team'
        }, 403);
      }
    }

    const { data: todo, error } = await supabase
      .from('todos')
      .update(todoData)
      .eq('id', todoId)
      .select('*, assignee:users(name, email)')
      .single();

    if (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to update todo'
      }, 500);
    }

    return c.json<ApiResponse<Todo>>({
      success: true,
      data: todo,
      message: 'Todo updated successfully'
    });
  } catch (error) {
    console.error('Update todo error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Delete a todo
todoRoutes.delete('/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const todoId = c.req.param('id');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json<ApiResponse>({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization header'
    }, 401);
  }

  const token = authHeader.slice(7);
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return c.json<ApiResponse>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token'
      }, 401);
    }

    // Check if todo exists and user has access
    const { data: existingTodo, error: checkError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', todoId)
      .eq('created_by', user.id)
      .single();

    if (checkError || !existingTodo) {
      return c.json<ApiResponse>({
        success: false,
        error: 'NOT_FOUND',
        message: 'Todo not found or access denied'
      }, 404);
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId);

    if (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to delete todo'
      }, 500);
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

export default todoRoutes;