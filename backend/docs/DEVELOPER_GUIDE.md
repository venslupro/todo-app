# Developer Guide

This guide provides comprehensive API documentation and development instructions for the Todo App Backend.

## API Overview

### Base URL
- **Development**: `http://localhost:8787`
- **Staging**: `https://stg-todo-worker.venslu-pro.workers.dev`
- **Production**: `https://prod-todo-worker.venslu-pro.workers.dev`

### Authentication
All API endpoints (except authentication and system endpoints) require JWT Bearer token:
```http
Authorization: Bearer <jwt-token>
```

### Response Format
All successful responses follow this format:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    // Response data
  }
}
```

### Error Format
All errors follow this format:
```json
{
  "code": 401,
  "message": "Unauthorized",
  "details": "auth invalid credentials"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Failed
- `429` - Too Many Requests
- `500` - Internal Server Error

## System API

### Health Check
```http
GET /
GET /health
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
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
  "code": 200,
  "message": "Success",
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
  "username": "johndoe"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "full_name": "John Doe",
      "avatar_url": null,
      "role": "user",
      "created_at": "2024-01-13T10:00:00Z",
      "updated_at": "2024-01-13T10:00:00Z"
    },
    "session": {
      "access_token": "jwt-access-token",
      "refresh_token": "jwt-refresh-token",
      "expires_in": 3600
    }
  }
}
```

**Error Response (Invalid Credentials):**
```json
{
  "code": 401,
  "message": "Unauthorized",
  "details": "auth invalid credentials"
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
  "code": 200,
  "message": "Success",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "full_name": "John Doe",
      "avatar_url": null,
      "role": "user",
      "created_at": "2024-01-13T10:00:00Z",
      "updated_at": "2024-01-13T10:00:00Z"
    },
    "session": {
      "access_token": "jwt-access-token",
      "refresh_token": "jwt-refresh-token",
      "expires_in": 3600
    }
  }
}
```

**Error Response (Invalid Credentials):**
```json
{
  "code": 401,
  "message": "Unauthorized",
  "details": "auth invalid credentials"
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "current-refresh-token"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "full_name": "John Doe",
      "avatar_url": null,
      "role": "user",
      "created_at": "2024-01-13T10:00:00Z",
      "updated_at": "2024-01-13T10:00:00Z"
    },
    "session": {
      "access_token": "new-jwt-access-token",
      "refresh_token": "new-jwt-refresh-token",
      "expires_in": 3600
    }
  }
}
```

**Error Response (Invalid Token):**
```json
{
  "code": 401,
  "message": "Unauthorized",
  "details": "auth token invalid"
}
```

**Technical Details:**
- This endpoint uses standard Supabase client for user session continuity
- User authentication flows require session context, not suitable for service role client
- Maintains user session state for seamless authentication experience

### Logout User
```http
POST /api/v1/auth/logout
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Get Current User
```http
GET /api/v1/auth/profile
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "avatar_url": null,
    "role": "user",
    "created_at": "2024-01-13T10:00:00Z",
    "updated_at": "2024-01-13T10:00:00Z"
  }
}
```

**Technical Details:**
- This endpoint uses Supabase Service Role Key for enhanced permission handling
- Service Role Key provides higher permissions for backend operations
- Suitable for reading user information with better security

## TODO API

### Get All TODOs
```http
GET /api/v1/todos
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "todos": [
      {
        "id": "todo-uuid",
        "name": "Complete project",
        "description": "Finish the backend API",
        "status": "in_progress",
        "priority": "medium",
        "due_date": null,
        "tags": ["backend", "api"],
        "created_by": "user-uuid",
        "created_at": "2024-01-13T10:00:00Z",
        "updated_at": "2024-01-13T10:00:00Z",
        "completed_at": null,
        "parent_id": null,
        "is_deleted": false
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

### Create TODO
```http
POST /api/v1/todos
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "New TODO",
  "description": "TODO description",
  "status": "not_started"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "todo-uuid",
    "name": "New TODO",
    "description": "TODO description",
    "status": "not_started",
    "priority": "medium",
    "due_date": null,
    "tags": null,
    "created_by": "user-uuid",
    "created_at": "2024-01-13T10:00:00Z",
    "updated_at": "2024-01-13T10:00:00Z",
    "completed_at": null,
    "parent_id": null,
    "is_deleted": false
  }
}
```

### Get TODO by ID
```http
GET /api/v1/todos/{id}
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "todo-uuid",
    "name": "Complete project",
    "description": "Finish the backend API",
    "status": "in_progress",
    "priority": "medium",
    "due_date": null,
    "tags": ["backend", "api"],
    "created_by": "user-uuid",
    "created_at": "2024-01-13T10:00:00Z",
    "updated_at": "2024-01-13T10:00:00Z",
    "completed_at": null,
    "parent_id": null,
    "is_deleted": false
  }
}
```

### Update TODO
```http
PUT /api/v1/todos/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Updated TODO",
  "description": "Updated description",
  "status": "completed"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "todo-uuid",
    "name": "Updated TODO",
    "description": "Updated description",
    "status": "completed",
    "priority": "medium",
    "due_date": null,
    "tags": ["updated"],
    "created_by": "user-uuid",
    "created_at": "2024-01-13T10:00:00Z",
    "updated_at": "2024-01-13T11:00:00Z",
    "completed_at": "2024-01-13T11:00:00Z",
    "parent_id": null,
    "is_deleted": false
  }
}
```

### Delete TODO
```http
DELETE /api/v1/todos/{id}
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "message": "TODO deleted successfully"
  }
}
```

## Media API

### Get All Media
```http
GET /api/v1/media
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "data": {
    "media": [
      {
        "id": "media-uuid",
        "filename": "image.jpg",
        "mime_type": "image/jpeg",
        "size": 1024000,
        "created_at": "2024-01-13T10:00:00Z"
      }
    ]
  }
}
```

### Generate Upload URL
```http
POST /api/v1/media/upload-url
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "filename": "image.jpg",
  "mime_type": "image/jpeg"
}
```

**Response:**
```json
{
  "data": {
    "upload_url": "https://storage.example.com/upload-url",
    "media_id": "media-uuid"
  }
}
```

### Confirm Upload
```http
POST /api/v1/media/{id}/confirm
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "upload_success": true
}
```

**Response:**
```json
{
  "data": {
    "media": {
      "id": "media-uuid",
      "filename": "image.jpg",
      "mime_type": "image/jpeg",
      "size": 1024000,
      "created_at": "2024-01-13T10:00:00Z"
    }
  }
}
```

### Get Media URL
```http
GET /api/v1/media/{id}/url
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "data": {
    "url": "https://storage.example.com/media-uuid"
  }
}
```

### Delete Media
```http
DELETE /api/v1/media/{id}
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "data": {
    "message": "Media deleted successfully"
  }
}
```

## Team API

### Share TODO
```http
POST /api/v1/team/shares
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "todo_id": "todo-uuid",
  "user_id": "user-uuid",
  "permission": "read"
}
```

**Response:**
```json
{
  "data": {
    "share": {
      "id": "share-uuid",
      "todo_id": "todo-uuid",
      "user_id": "user-uuid",
      "permission": "read",
      "created_at": "2024-01-13T10:00:00Z"
    }
  }
}
```

### Get Shared TODOs
```http
GET /api/v1/team/shares
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "data": {
    "shares": [
      {
        "id": "share-uuid",
        "todo_id": "todo-uuid",
        "user_id": "user-uuid",
        "permission": "read",
        "created_at": "2024-01-13T10:00:00Z"
      }
    ]
  }
}
```

### Get Share by ID
```http
GET /api/v1/team/shares/{id}
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "data": {
    "share": {
      "id": "share-uuid",
      "todo_id": "todo-uuid",
      "user_id": "user-uuid",
      "permission": "read",
      "created_at": "2024-01-13T10:00:00Z"
    }
  }
}
```

### Update Share Permission
```http
PUT /api/v1/team/shares/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "permission": "write"
}
```

**Response:**
```json
{
  "data": {
    "share": {
      "id": "share-uuid",
      "todo_id": "todo-uuid",
      "user_id": "user-uuid",
      "permission": "write",
      "created_at": "2024-01-13T10:00:00Z"
    }
  }
}
```

### Delete Share
```http
DELETE /api/v1/team/shares/{id}
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "data": {
    "message": "Share deleted successfully"
  }
}
```

## WebSocket API (Temporarily Disabled)

> **Note**: WebSocket functionality is currently disabled to simplify deployment. It can be re-enabled when needed.

### TODO Statistics
```http
GET /ws/v1/todo/{id}/stats
Authorization: Bearer <jwt-token>
```

### TODO Users
```http
GET /ws/v1/todo/{id}/users
Authorization: Bearer <jwt-token>
```

### TODO Cleanup
```http
POST /ws/v1/todo/{id}/cleanup
Authorization: Bearer <jwt-token>
```

### TODO Connect
```http
GET /ws/v1/todo/{id}/connect
Authorization: Bearer <jwt-token>
```

### TODO Update
```http
POST /ws/v1/todo/{id}/update
Authorization: Bearer <jwt-token>
```

### TODO WebSocket
```http
GET /ws/v1/todo/{id}/ws
Authorization: Bearer <jwt-token>
```

## Error Codes

### Authentication Errors
- `auth invalid credentials` - Invalid email or password
- `auth token invalid` - Invalid or expired JWT token
- `auth user not found` - User does not exist
- `auth email exists` - Email already registered

### Validation Errors
- `validation invalid email` - Invalid email format
- `validation invalid password` - Password does not meet requirements
- `validation required field` - Required field is missing

### Database Errors
- `database query failed` - Database query execution failed
- `database unique constraint` - Unique constraint violation

### Business Logic Errors
- `business resource not found` - Requested resource not found
- `business operation not allowed` - Operation not permitted

### System Errors
- `system internal error` - Internal server error

## Development Setup

### Prerequisites
- Node.js 20+
- npm or yarn
- Cloudflare account
- Supabase account

### Installation
```bash
cd backend
npm install
```

### Environment Configuration
Create a `.dev.vars` file in the backend directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

ENVIRONMENT=development
```

### Development
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

## Deployment

### Manual Deployment
```bash
npm run deploy
```

### CI/CD Deployment
This project uses GitHub Actions for automated CI/CD:
- Push to `dev` branch → Deploy to staging
- Push to `main` branch → Deploy to production

### Environment Variables
Configure the following secrets in your deployment environment:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Architecture

### Tech Stack
- **Framework**: Hono.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT
- **Deployment**: Cloudflare Workers
- **Testing**: Jest
- **Linting**: ESLint + Google Code Style

### Project Structure
```
backend/src/
├── api/
│   ├── handlers/          # API route handlers
│   ├── middleware/        # Authentication and rate limiting
├── core/
│   ├── services/          # Business logic services
│   ├── models/            # Data models
│   ├── durable-objects/   # WebSocket Durable Objects
├── shared/
│   ├── errors/           # Error handling
│   ├── validation/        # Input validation
│   ├── config/           # Configuration
└── __tests__/            # Test files
```

### Error Handling
The project uses the `neverthrow` library for functional error handling:
- Services return `Result<T, ErrorCode>`
- Handlers convert service results to HTTP responses
- Consistent error codes and messages

## Contributing

### Code Style
- Follow Google TypeScript Style Guide
- Use ESLint for code quality
- Write tests for new functionality
- Use meaningful commit messages

### Testing
- Write unit tests for services
- Test error scenarios
- Maintain test coverage

### Documentation
- Update this guide when adding new features
- Document API changes
- Include examples for new endpoints