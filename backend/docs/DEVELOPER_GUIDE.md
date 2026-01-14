# Developer Guide

This guide provides comprehensive API documentation and development instructions for the Todo App Backend.

## API Overview

### Base URL
- **Development**: `http://localhost:8787`
- **Production**: `https://your-worker.your-account.workers.dev`

### Authentication
All API endpoints (except authentication and system endpoints) require JWT Bearer token:
```http
Authorization: Bearer <jwt-token>
```

### Response Format
All successful responses follow this format:
```json
{
  "data": {
    // Response data
  }
}
```

### Error Format
All errors follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## System API

### Health Check
```http
GET /
GET /health
```

**Response:**
```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-13T10:00:00Z",
    "environment": "development"
  }
}
```

### Version Information
```http
GET /version
```

**Response:**
```json
{
  "data": {
    "name": "TODO API",
    "version": "1.0.0",
    "environment": "development"
  }
}
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

### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh-token"
}
```

**Response:**
```json
{
  "data": {
    "token": "new-jwt-token"
  }
}
```

### Logout User
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
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
    }
  }
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
- `due_date_before`: Filter by due date before
- `due_date_after`: Filter by due date after
- `sort_by`: Field to sort by
- `sort_order`: `asc` or `desc`

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
        "created_by": "user-uuid",
        "created_at": "2024-01-10T10:00:00Z",
        "updated_at": "2024-01-13T10:00:00Z"
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

**Response:**
```json
{
  "data": {
    "id": "todo-uuid",
    "name": "New Todo",
    "description": "Todo description",
    "status": "not_started",
    "priority": "medium",
    "due_date": "2024-01-20T00:00:00Z",
    "tags": ["work"],
    "created_by": "user-uuid",
    "created_at": "2024-01-13T10:00:00Z",
    "updated_at": "2024-01-13T10:00:00Z"
  }
}
```

### Get Single Todo
```http
GET /api/v1/todos/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "todo-uuid",
    "name": "Complete project",
    "description": "Finish the backend implementation",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2024-01-15T00:00:00Z",
    "tags": ["work", "urgent"],
    "created_by": "user-uuid",
    "created_at": "2024-01-10T10:00:00Z",
    "updated_at": "2024-01-13T10:00:00Z"
  }
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

**Response:**
```json
{
  "data": {
    "id": "todo-uuid",
    "name": "Updated Todo",
    "description": "Finish the backend implementation",
    "status": "completed",
    "priority": "high",
    "due_date": "2024-01-15T00:00:00Z",
    "tags": ["work", "urgent"],
    "created_by": "user-uuid",
    "created_at": "2024-01-10T10:00:00Z",
    "updated_at": "2024-01-13T10:00:00Z"
  }
}
```

### Delete Todo
```http
DELETE /api/v1/todos/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

## Media API

### Get Media List
```http
GET /api/v1/media?todo_id=todo-uuid&media_type=image&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `todo_id`: Filter by todo ID
- `media_type`: `image`, `video`, `document`, `audio`
- `limit`: Number of items (default: 20)
- `offset`: Pagination offset

**Response:**
```json
{
  "data": {
    "media": [
      {
        "id": "media-uuid",
        "todo_id": "todo-uuid",
        "filename": "document.pdf",
        "size": 102400,
        "mime_type": "application/pdf",
        "media_type": "document",
        "created_at": "2024-01-13T10:00:00Z"
      }
    ]
  }
}
```

### Get Upload URL
```http
POST /api/v1/media/upload-url
Content-Type: application/json
Authorization: Bearer <token>

{
  "todoId": "todo-uuid",
  "filename": "document.pdf",
  "mime_type": "application/pdf"
}
```

**Response:**
```json
{
  "data": {
    "upload_url": "https://storage.supabase.co/upload-url",
    "media_id": "media-uuid"
  }
}
```

### Confirm Upload
```http
POST /api/v1/media/:id/confirm
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "media": {
      "id": "media-uuid",
      "todo_id": "todo-uuid",
      "filename": "document.pdf",
      "size": 102400,
      "mime_type": "application/pdf",
      "media_type": "document",
      "url": "https://storage.supabase.co/files/media-uuid",
      "created_at": "2024-01-13T10:00:00Z"
    }
  }
}
```

### Get Media URL
```http
GET /api/v1/media/:id/url
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "url": "https://storage.supabase.co/files/media-uuid"
  }
}
```

### Delete Media
```http
DELETE /api/v1/media/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

## Team Collaboration API

### Share Todo
```http
POST /api/v1/team/shares
Content-Type: application/json
Authorization: Bearer <token>

{
  "todo_id": "todo-uuid",
  "user_id": "target-user-uuid",
  "permission": "read"
}
```

**Permissions:** `read`, `write`, `admin`

**Response:**
```json
{
  "data": {
    "id": "share-uuid",
    "todo_id": "todo-uuid",
    "user_id": "target-user-uuid",
    "permission": "read",
    "shared_by": "user-uuid",
    "created_at": "2024-01-13T10:00:00Z"
  }
}
```

### Get Share List
```http
GET /api/v1/team/shares?todo_id=todo-uuid&user_id=user-uuid&permission=read
Authorization: Bearer <token>
```

**Query Parameters:**
- `todo_id`: Filter by todo ID
- `user_id`: Filter by user ID
- `permission`: `read`, `write`, `admin`
- `limit`: Number of items (default: 20)
- `offset`: Pagination offset

**Response:**
```json
{
  "data": {
    "shares": [
      {
        "id": "share-uuid",
        "todo_id": "todo-uuid",
        "user_id": "target-user-uuid",
        "permission": "read",
        "shared_by": "user-uuid",
        "created_at": "2024-01-13T10:00:00Z"
      }
    ]
  }
}
```

### Get Single Share
```http
GET /api/v1/team/shares/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "id": "share-uuid",
    "todo_id": "todo-uuid",
    "user_id": "target-user-uuid",
    "permission": "read",
    "shared_by": "user-uuid",
    "created_at": "2024-01-13T10:00:00Z"
  }
}
```

### Update Share Permission
```http
PUT /api/v1/team/shares/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "permission": "write"
}
```

**Response:**
```json
{
  "data": {
    "id": "share-uuid",
    "todo_id": "todo-uuid",
    "user_id": "target-user-uuid",
    "permission": "write",
    "shared_by": "user-uuid",
    "created_at": "2024-01-13T10:00:00Z"
  }
}
```

### Delete Share
```http
DELETE /api/v1/team/shares/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

## WebSocket API

### Connect to Todo Updates
```http
GET /ws/v1/todo/:id
Authorization: Bearer <token>
```

**Response (Placeholder):**
```json
{
  "message": "WebSocket endpoint",
  "todo_id": "todo-uuid",
  "user_id": "user-uuid",
  "note": "In production, this would upgrade to a WebSocket connection"
}
```

**WebSocket Events (Production):**
- `todo_updated` - Todo modified
- `comment_added` - New comment
- `user_joined` - User viewing todo
- `user_left` - User stopped viewing

## Error Handling

### Common Error Codes
- `UNAUTHORIZED` - Invalid or missing authentication
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `FORBIDDEN` - Insufficient permissions
- `INTERNAL_SERVER_ERROR` - Server error

### Example Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required"
  }
}
```

## Development

### Code Structure
```
src/
├── api/handlers/          # Route handlers
│   ├── auth.ts           # Authentication endpoints
│   ├── todo.ts           # Todo CRUD operations
│   ├── media.ts          # File upload/download
│   ├── team.ts           # Sharing and collaboration
│   ├── websocket.ts      # Real-time connections
│   └── system.ts         # System endpoints
├── core/services/        # Business logic
│   ├── auth-service.ts   # User authentication
│   ├── todo-service.ts   # Todo operations
│   ├── media-service.ts  # Media file management
│   ├── share-service.ts  # Sharing functionality
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

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- Authentication endpoints: 10 requests per minute
- Todo management endpoints: 100 requests per minute
- Media upload endpoints: 20 requests per minute

## Security

- JWT tokens expire after 24 hours
- Refresh tokens expire after 30 days
- All passwords are hashed using bcrypt
- Database uses row-level security (RLS)
- CORS is properly configured

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.