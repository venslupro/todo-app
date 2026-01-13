# Developer Guide

This guide provides API documentation and development instructions for the Todo App Backend.

## API Overview

### Base URL
- **Development**: `http://localhost:8787`
- **Production**: `https://your-worker.your-account.workers.dev`

### Authentication
All API endpoints (except authentication) require JWT Bearer token:
```http
Authorization: Bearer <jwt-token>
```

## Authentication API

### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "johndoe",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "full_name": "John Doe"
    },
    "token": "jwt-token"
  }
}
```

### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

## Todo Management API

### Get Todo List
```http
GET /api/v1/todos?status=in_progress&priority=high&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: `not_started`, `in_progress`, `completed`
- `priority`: `low`, `medium`, `high`, `urgent`
- `limit`: Number of items (default: 20)
- `offset`: Pagination offset
- `search`: Text search
- `tags`: Comma-separated tag list

**Response:**
```json
{
  "data": {
    "todos": [
      {
        "id": "todo-uuid",
        "name": "Complete project",
        "description": "Finish the backend implementation",
        "status": "in_progress",
        "priority": "high",
        "due_date": "2024-01-15T00:00:00Z",
        "tags": ["work", "urgent"],
        "created_at": "2024-01-10T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

### Create Todo
```http
POST /api/v1/todos
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "New Todo",
  "description": "Todo description",
  "status": "not_started",
  "priority": "medium",
  "due_date": "2024-01-20T00:00:00Z",
  "tags": ["work"]
}
```

### Update Todo
```http
PUT /api/v1/todos/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Todo",
  "status": "completed"
}
```

## Media API

### Upload File
```http
POST /api/v1/media/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file-binary>
```

**Response:**
```json
{
  "data": {
    "id": "file-uuid",
    "filename": "document.pdf",
    "size": 102400,
    "mime_type": "application/pdf",
    "url": "https://storage.supabase.co/files/file-uuid"
  }
}
```

## Team Collaboration API

### Share Todo
```http
POST /api/v1/team/share
Content-Type: application/json
Authorization: Bearer <token>

{
  "todo_id": "todo-uuid",
  "user_id": "target-user-uuid",
  "permission": "read"
}
```

**Permissions:** `read`, `write`, `admin`

## WebSocket API

### Connect to Todo Updates
```http
GET /ws/v1/todo/:id
Authorization: Bearer <token>
```

**Connection Events:**
- `todo_updated` - Todo modified
- `comment_added` - New comment
- `user_joined` - User viewing todo
- `user_left` - User stopped viewing

## Error Handling

All errors follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - Invalid or missing authentication
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Development

### Code Structure
```
src/
├── api/handlers/          # Route handlers
│   ├── auth.ts           # Authentication endpoints
│   ├── todo.ts           # Todo CRUD operations
│   ├── media.ts          # File upload/download
│   ├── team.ts           # Sharing and collaboration
│   └── websocket.ts      # Real-time connections
├── core/services/        # Business logic
│   ├── auth-service.ts   # User authentication
│   ├── todo-service.ts   # Todo operations
│   └── websocket-service.ts # Real-time management
└── shared/errors/        # Error classes
```

### Adding New Endpoints
1. Create handler in `src/api/handlers/`
2. Add service logic in `src/core/services/`
3. Define data models in `src/core/models/`
4. Add validation in `src/shared/validation/`

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/__tests__/todo.test.ts
```

### Environment Variables
Set in `.dev.vars` for development:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.