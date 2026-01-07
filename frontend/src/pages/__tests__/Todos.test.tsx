import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Todos from '../Todos';

// Mock the contexts
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn()
  })
}));

vi.mock('@/contexts/TodoContext', () => ({
  useTodo: () => ({
    todos: [
      {
        id: '1',
        name: 'Test Todo 1',
        status: 'PENDING',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Test Todo 2',
        status: 'COMPLETED',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }
    ],
    loading: false,
    error: null,
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn()
  })
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Todos Page', () => {
  it('should render todos page with todo list', () => {
    renderWithProviders(<Todos />);
    
    expect(screen.getByText('My Todos')).toBeDefined();
    expect(screen.getByText('Test Todo 1')).toBeDefined();
    expect(screen.getByText('Test Todo 2')).toBeDefined();
  });
});