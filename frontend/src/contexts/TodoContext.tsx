import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/shared/types';

interface TodoContextType {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  createTodo: (todoData: CreateTodoRequest) => Promise<void>;
  updateTodo: (todoId: string, todoData: UpdateTodoRequest) => Promise<void>;
  deleteTodo: (todoId: string) => Promise<void>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: todosData, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      setTodos(todosData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTodo = useCallback(async (todoData: CreateTodoRequest) => {
    setError(null);
    
    try {
      const { data: newTodo, error: createError } = await supabase
        .from('todos')
        .insert([todoData])
        .select()
        .single();
      
      if (createError) {
        throw new Error(createError.message);
      }
      
      setTodos(prev => [newTodo, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
      throw err;
    }
  }, []);

  const updateTodo = useCallback(async (todoId: string, todoData: UpdateTodoRequest) => {
    setError(null);
    
    try {
      const { data: updatedTodo, error: updateError } = await supabase
        .from('todos')
        .update(todoData)
        .eq('id', todoId)
        .select()
        .single();
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      setTodos(prev => prev.map(todo => todo.id === todoId ? updatedTodo : todo));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
      throw err;
    }
  }, []);

  const deleteTodo = useCallback(async (todoId: string) => {
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);
      
      if (deleteError) {
        throw new Error(deleteError.message);
      }
      
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
      throw err;
    }
  }, []);

  // Real-time subscription for todos
  useEffect(() => {
    const subscription = supabase
      .channel('todos')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'todos' 
        }, 
        (payload: RealtimePostgresChangesPayload<Todo>) => {
          if (payload.eventType === 'INSERT') {
            setTodos(prev => [...prev, payload.new as Todo]);
          } else if (payload.eventType === 'UPDATE') {
            setTodos(prev => prev.map(todo => 
              todo.id === payload.new.id ? { ...todo, ...payload.new } : todo
            ));
          } else if (payload.eventType === 'DELETE') {
            setTodos(prev => prev.filter(todo => todo.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const value = {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
}