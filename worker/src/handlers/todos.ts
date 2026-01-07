import { Context } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { 
  CreateTodoRequest, 
  UpdateTodoRequest, 
  ListTodosResponse
} from '@/shared/types';

export async function listTodosHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  
  const searchParams = c.req.query();
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
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
  
  // Apply sorting
  const sortField = searchParams.sort_field || 'created_at';
  const sortOrder = searchParams.sort_order === 'asc' ? 'asc' : 'desc';
  query = query.order(sortField, { ascending: sortOrder === 'asc' });
  
  // Pagination
  const page = parseInt(searchParams.page || '1');
  const pageSize = parseInt(searchParams.page_size || '20');
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  query = query.range(from, to);
  
  const { data: todos, error, count } = await query;
  
  if (error) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to fetch todos'
    }, 500);
  }
  
  const response: ListTodosResponse = {
    todos: todos || [],
    total_count: count || 0,
    page,
    page_size: pageSize
  };
  
  return c.json(response);
}

export async function createTodoHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const todoData = c.get('validatedData') as CreateTodoRequest;
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: todo, error } = await supabase
    .from('todos')
    .insert([{
      ...todoData,
      created_by: user.id
    }])
    .select('*, assignee:users(name, email)')
    .single();
  
  if (error) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to create todo'
    }, 500);
  }
  
  return c.json(todo, 201);
}

export async function getTodoHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const { id } = c.req.param();
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: todo, error } = await supabase
    .from('todos')
    .select('*, assignee:users(name, email)')
    .eq('id', id)
    .or(`created_by.eq.${user.id},team_id.is.null,team_id.in.(select team_id from team_members where user_id.eq.${user.id})`)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return c.json({
        error: 'Not Found',
        message: 'Todo not found'
      }, 404);
    }
    
    return c.json({
      error: 'Database Error',
      message: 'Failed to fetch todo'
    }, 500);
  }
  
  return c.json(todo);
}

export async function updateTodoHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const { id } = c.req.param();
  const updateData = c.get('validatedData') as UpdateTodoRequest;
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Check if user has permission to update
  const { data: existingTodo } = await supabase
    .from('todos')
    .select('created_by, team_id, status')
    .eq('id', id)
    .single();
  
  if (!existingTodo) {
    return c.json({
      error: 'Not Found',
      message: 'Todo not found'
    }, 404);
  }
  
  // Check ownership or team admin permission
  if (existingTodo.created_by !== user.id) {
    if (existingTodo.team_id) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', existingTodo.team_id)
        .eq('user_id', user.id)
        .single();
      
      if (!teamMember || !['OWNER', 'ADMIN'].includes(teamMember.role)) {
        return c.json({
          error: 'Forbidden',
          message: 'Insufficient permissions'
        }, 403);
      }
    } else {
      return c.json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      }, 403);
    }
  }
  
  // Handle status change to completed
  const updatePayload: any = { ...updateData };
  if (updateData.status === 'COMPLETED' && existingTodo.status !== 'COMPLETED') {
    updatePayload.completed_at = new Date().toISOString();
  }
  
  const { data: todo, error } = await supabase
    .from('todos')
    .update(updatePayload)
    .eq('id', id)
    .select('*, assignee:users(name, email)')
    .single();
  
  if (error) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to update todo'
    }, 500);
  }
  
  return c.json(todo);
}

export async function deleteTodoHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const { id } = c.req.param();
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Check if user has permission to delete
  const { data: existingTodo } = await supabase
    .from('todos')
    .select('created_by, team_id')
    .eq('id', id)
    .single();
  
  if (!existingTodo) {
    return c.json({
      error: 'Not Found',
      message: 'Todo not found'
    }, 404);
  }
  
  // Check ownership or team admin permission
  if (existingTodo.created_by !== user.id) {
    if (existingTodo.team_id) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', existingTodo.team_id)
        .eq('user_id', user.id)
        .single();
      
      if (!teamMember || !['OWNER', 'ADMIN'].includes(teamMember.role)) {
        return c.json({
          error: 'Forbidden',
          message: 'Insufficient permissions'
        }, 403);
      }
    } else {
      return c.json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      }, 403);
    }
  }
  
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);
  
  if (error) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to delete todo'
    }, 500);
  }
  
  return c.body(null, 204);
}