import { Hono } from 'hono';
import { cors } from './middleware/cors';
import { auth } from './middleware/auth';
import { errorHandler } from './middleware/error';
import { validate } from './middleware/validation';
import {
  registerHandler,
  loginHandler,
  refreshTokenHandler,
  logoutHandler
} from './handlers/auth';
import {
  createTodoHandler,
  getTodoHandler,
  listTodosHandler,
  updateTodoHandler,
  deleteTodoHandler
} from './handlers/todos';
import {
  createTeamHandler,
  getTeamHandler,
  listTeamsHandler,
  updateTeamHandler,
  deleteTeamHandler,
  addTeamMemberHandler,
  removeTeamMemberHandler
} from './handlers/teams';
import {
  uploadMediaHandler,
  deleteMediaHandler,
  listMediaHandler
} from './handlers/media';

const app = new Hono();

// Apply middleware
app.use('*', cors);
app.use('*', errorHandler);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Auth routes
app.post('/api/v1/auth/register', validate('register'), registerHandler);
app.post('/api/v1/auth/login', validate('login'), loginHandler);
app.post('/api/v1/auth/refresh', validate('refresh'), refreshTokenHandler);
app.post('/api/v1/auth/logout', auth, logoutHandler);

// TODO routes
app.get('/api/v1/todos', auth, listTodosHandler);
app.post('/api/v1/todos', auth, validate('createTodo'), createTodoHandler);
app.get('/api/v1/todos/:id', auth, getTodoHandler);
app.put('/api/v1/todos/:id', auth, validate('updateTodo'), updateTodoHandler);
app.delete('/api/v1/todos/:id', auth, deleteTodoHandler);

// Team routes
app.get('/api/v1/teams', auth, listTeamsHandler);
app.post('/api/v1/teams', auth, validate('createTeam'), createTeamHandler);
app.get('/api/v1/teams/:id', auth, getTeamHandler);
app.put('/api/v1/teams/:id', auth, validate('updateTeam'), updateTeamHandler);
app.delete('/api/v1/teams/:id', auth, deleteTeamHandler);
app.post('/api/v1/teams/:id/members', auth, validate('addTeamMember'), addTeamMemberHandler);
app.delete('/api/v1/teams/:id/members/:userId', auth, removeTeamMemberHandler);

// Media routes
app.post('/api/v1/todos/:todoId/media', auth, uploadMediaHandler);
app.get('/api/v1/todos/:todoId/media', auth, listMediaHandler);
app.delete('/api/v1/media/:mediaId', auth, deleteMediaHandler);

// 404 handler
app.notFound((c) => {
  return c.text('Not Found', 404);
});

export default app;