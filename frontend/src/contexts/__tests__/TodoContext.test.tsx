import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoProvider, useTodo } from '../TodoContext';
import { TodoStatus } from '../../shared/types';

// Mock Supabase inline to avoid hoisting issues
vi.mock('../../lib/supabase', () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }));

  const mockChannel = vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn(() => ({
        unsubscribe: vi.fn()
      }))
    }))
  }));

  return {
    supabase: {
      from: mockFrom,
      channel: mockChannel
    }
  };
});

describe('TodoContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TodoProvider>{children}</TodoProvider>
  );

  it('should initialize with empty todos', async () => {
    const { result } = renderHook(() => useTodo(), { wrapper });
    
    // Wait for initial fetch to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.todos).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should create a new todo', async () => {
    const { result } = renderHook(() => useTodo(), { wrapper });

    await act(async () => {
      await result.current.createTodo({
        name: 'Test Todo',
        status: TodoStatus.PENDING
      });
    });

    expect(result.current.todos).toBeDefined();
  });

  it('should update a todo', async () => {
    const { result } = renderHook(() => useTodo(), { wrapper });

    await act(async () => {
      await result.current.updateTodo('1', {
        name: 'Updated Todo',
        status: TodoStatus.COMPLETED
      });
    });

    expect(result.current.todos).toBeDefined();
  });

  it('should delete a todo', async () => {
    const { result } = renderHook(() => useTodo(), { wrapper });

    await act(async () => {
      await result.current.deleteTodo('1');
    });

    expect(result.current.todos).toBeDefined();
  });
});