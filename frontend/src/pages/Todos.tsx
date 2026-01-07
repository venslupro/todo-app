import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTodo } from '../contexts/TodoContext';
import FileUpload from '../components/FileUpload';
import type { CreateTodoRequest } from '@/shared/types';
import { TodoStatus } from '@/shared/types';

export default function Todos() {
  const { user: _user } = useAuth();
  const { todos, loading, error, createTodo, updateTodo, deleteTodo } = useTodo();
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    setIsCreating(true);
    try {
      const todoData: CreateTodoRequest = {
        name: newTodoTitle.trim(),
        status: TodoStatus.PENDING
      };
      await createTodo(todoData);
      setNewTodoTitle('');
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleComplete = async (todoId: string, currentStatus: TodoStatus) => {
    const newStatus = currentStatus === TodoStatus.COMPLETED ? TodoStatus.PENDING : TodoStatus.COMPLETED;
    try {
      await updateTodo(todoId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(todoId);
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
  };

  const handleUploadStart = (todoId: string) => {
    setUploadingFiles(prev => new Set(prev).add(todoId));
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[todoId];
      return newErrors;
    });
  };

  const handleUploadComplete = (todoId: string, fileUrl: string) => {
    setUploadingFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(todoId);
      return newSet;
    });
    console.log('File uploaded successfully:', fileUrl);
  };

  const handleUploadError = (todoId: string, error: string) => {
    setUploadingFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(todoId);
      return newSet;
    });
    setUploadErrors(prev => ({
      ...prev,
      [todoId]: error
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Todos</h1>
        <p className="mt-2 text-gray-600">Manage your tasks and stay organized</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating || !newTodoTitle.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isCreating ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No todos yet. Add your first todo above!
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li key={todo.id} className="border border-gray-200 rounded-lg last:border-b">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={todo.status === 'COMPLETED'}
                        onChange={() => handleToggleComplete(todo.id, todo.status)}
                        className="h-5 w-5 text-indigo-600 rounded"
                      />
                      <span
                        className={`${
                          todo.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {todo.name}
                      </span>
                      {todo.description && (
                        <span className="text-sm text-gray-500">{todo.description}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-red-600 hover:text-red-800 text-sm p-1"
                    >
                      Delete
                    </button>
                  </div>
                  
                  {/* File Upload Section */}
                  <div className="mt-3 border-t pt-3">
                    {uploadErrors[todo.id] && (
                      <div className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        {uploadErrors[todo.id]}
                      </div>
                    )}
                    
                    {uploadingFiles.has(todo.id) ? (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        Uploading file...
                      </div>
                    ) : (
                      <FileUpload
                        todoId={todo.id}
                        onUploadStart={() => handleUploadStart(todo.id)}
                        onUploadComplete={(fileUrl) => handleUploadComplete(todo.id, fileUrl)}
                        onUploadError={(error) => handleUploadError(todo.id, error)}
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}