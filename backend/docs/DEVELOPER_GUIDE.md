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
  "username": "johndoe",
  "full_name": "John Doe"
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `email` | string | **Required** | User's email address | Valid email format |
| `password` | string | **Required** | User's password | Minimum 8 characters, must contain uppercase, lowercase letters and numbers |
| `username` | string | Optional | User's display name | - |
| `full_name` | string | Optional | User's full name | - |

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

**Response Body Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `user` | object | User information |
| `user.id` | string | Unique user identifier |
| `user.email` | string | User's email address |
| `user.username` | string | User's display name |
| `user.full_name` | string | User's full name |
| `user.avatar_url` | string\|null | URL to user's avatar image |
| `user.role` | string | User role ("user" or "admin") |
| `user.created_at` | string | ISO 8601 timestamp of user creation |
| `user.updated_at` | string | ISO 8601 timestamp of last update |
| `session` | object | Authentication session |
| `session.access_token` | string | JWT access token for API authentication |
| `session.refresh_token` | string | JWT refresh token for token renewal |
| `session.expires_in` | number | Token expiration time in seconds |

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

**Request Body Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `email` | string | **Required** | User's email address | Valid email format |
| `password` | string | **Required** | User's password | - |

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

**Request Body Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `refresh_token` | string | **Required** | Current refresh token | - |

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

**Response Body Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique user identifier |
| `email` | string | User's email address |
| `username` | string | User's display name |
| `full_name` | string | User's full name |
| `avatar_url` | string\|null | URL to user's avatar image |
| `role` | string | User role ("user" or "admin") |
| `created_at` | string | ISO 8601 timestamp of user creation |
| `updated_at` | string | ISO 8601 timestamp of last update |

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

**Query Parameters:**

| Parameter | Type | Required | Description | Allowed Values |
|-----------|------|----------|-------------|----------------|
| `status` | string | Optional | Filter by status | "not_started", "in_progress", "completed" |
| `priority` | string | Optional | Filter by priority | "low", "medium", "high", "urgent" |
| `due_date_before` | string | Optional | Filter by due date before | ISO 8601 format |
| `due_date_after` | string | Optional | Filter by due date after | ISO 8601 format |
| `tags` | string | Optional | Filter by tags | Comma-separated |
| `search` | string | Optional | Search in name and description | - |
| `limit` | number | Optional | Pagination limit | Default: 50 |
| `offset` | number | Optional | Pagination offset | Default: 0 |
| `sort_by` | string | Optional | Sort field | "name", "priority", "due_date", "created_at", "updated_at" |
| `sort_order` | string | Optional | Sort order | "asc", "desc" (default: "desc") |

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

**Response Body Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `todos` | array | List of TODO items |
| `todos[].id` | string | Unique TODO identifier |
| `todos[].name` | string | TODO title |
| `todos[].description` | string\|null | TODO description |
| `todos[].status` | string | Current status |
| `todos[].priority` | string\|null | Priority level |
| `todos[].due_date` | string\|null | Due date in ISO 8601 format |
| `todos[].tags` | array\|null | Array of tag strings |
| `todos[].created_by` | string | User ID of TODO creator |
| `todos[].created_at` | string | ISO 8601 timestamp of creation |
| `todos[].updated_at` | string | ISO 8601 timestamp of last update |
| `todos[].completed_at` | string\|null | ISO 8601 timestamp of completion |
| `todos[].parent_id` | string\|null | Parent TODO ID for subtasks |
| `todos[].is_deleted` | boolean | Soft delete flag |
| `total` | number | Total number of TODOs matching filters |
| `limit` | number | Pagination limit used |
| `offset` | number | Pagination offset used |

### Create TODO
```http
POST /api/v1/todos
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "New TODO",
  "description": "TODO description",
  "status": "not_started",
  "priority": "medium",
  "due_date": "2024-12-31T23:59:59Z",
  "tags": ["important", "backend"],
  "parent_id": "parent-todo-uuid"
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `name` | string | **Required** | TODO title | Max 200 characters |
| `description` | string | Optional | TODO description | Max 1000 characters |
| `status` | string | Optional | Initial status | "not_started", "in_progress", "completed" (default: "not_started") |
| `priority` | string | Optional | Priority level | "low", "medium", "high", "urgent" (default: "medium") |
| `due_date` | string | Optional | Due date | ISO 8601 format |
| `tags` | array | Optional | Array of tag strings | - |
| `parent_id` | string | Optional | Parent TODO ID for creating subtasks | Must be valid TODO ID |

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

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Required** | TODO identifier |

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
  "status": "completed",
  "priority": "high",
  "due_date": "2024-12-31T23:59:59Z",
  "tags": ["updated"],
  "parent_id": "new-parent-uuid"
}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Required** | TODO identifier |

**Request Body Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `name` | string | Optional | Updated TODO title | Max 200 characters |
| `description` | string | Optional | Updated TODO description | Max 1000 characters |
| `status` | string | Optional | Updated status | "not_started", "in_progress", "completed" |
| `priority` | string | Optional | Updated priority level | "low", "medium", "high", "urgent" |
| `due_date` | string | Optional | Updated due date | ISO 8601 format |
| `tags` | array | Optional | Updated array of tag strings | - |
| `parent_id` | string | Optional | Updated parent TODO ID | Must be valid TODO ID |

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

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Required** | TODO identifier |

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

**Query Parameters:**

| Parameter | Type | Required | Description | Allowed Values |
|-----------|------|----------|-------------|----------------|
| `todo_id` | string | Optional | Filter by TODO ID | - |
| `media_type` | string | Optional | Filter by media type | "image", "video" |
| `limit` | number | Optional | Pagination limit | - |
| `offset` | number | Optional | Pagination offset | - |

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "media": [
      {
        "id": "media-uuid",
        "todo_id": "todo-uuid",
        "file_name": "image.jpg",
        "file_path": "media/todo-uuid/image.jpg",
        "file_size": 1024000,
        "mime_type": "image/jpeg",
        "media_type": "image",
        "duration": null,
        "width": 1920,
        "height": 1080,
        "created_by": "user-uuid",
        "created_at": "2024-01-13T10:00:00Z",
        "updated_at": "2024-01-13T10:00:00Z"
      }
    ]
  }
}
```

**Response Body Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `media` | array | List of media items |
| `media[].id` | string | Unique media identifier |
| `media[].todo_id` | string | Associated TODO ID |
| `media[].file_name` | string | Original filename |
| `media[].file_path` | string | Storage path |
| `media[].file_size` | number | File size in bytes |
| `media[].mime_type` | string | MIME type |
| `media[].media_type` | string | Media type: "image", "video" |
| `media[].duration` | number\|null | Video duration in seconds |
| `media[].width` | number\|null | Image/video width in pixels |
| `media[].height` | number\|null | Image/video height in pixels |
| `media[].created_by` | string | User ID of uploader |
| `media[].created_at` | string | ISO 8601 timestamp of upload |
| `media[].updated_at` | string | ISO 8601 timestamp of last update |

### Generate Upload URL
```http
POST /api/v1/media/upload-url
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "todo_id": "todo-uuid",
  "file_name": "image.jpg",
  "mime_type": "image/jpeg",
  "file_size": 1024000
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `todo_id` | string | **Required** | TODO ID to associate with the media | - |
| `file_name` | string | **Required** | Original filename | - |
| `mime_type` | string | **Required** | MIME type of the file | - |
| `file_size` | number | Optional | File size in bytes | - |

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "upload_url": "https://storage.example.com/upload-url",
    "media_id": "media-uuid"
  }
}
```

**Response Body Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `upload_url` | string | Pre-signed URL for file upload |
| `media_id` | string | Media identifier for confirmation |

### Confirm Upload
```http
POST /api/v1/media/{id}/confirm
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "upload_success": true
}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Required** | Media identifier |

**Request Body Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `upload_success` | boolean | **Required** | Upload completion status | true or false |

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "media": {
      "id": "media-uuid",
      "todo_id": "todo-uuid",
      "file_name": "image.jpg",
      "mime_type": "image/jpeg",
      "file_size": 1024000,
      "media_type": "image",
      "created_at": "2024-01-13T10:00:00Z"
    }
  }
}
```

## Team API

### Get Team Members
```http
GET /api/v1/team/members
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `todo_id` | string | Optional | Filter by TODO ID |
| `limit` | number | Optional | Pagination limit |
| `offset` | number | Optional | Pagination offset |

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "members": [
      {
        "id": "user-uuid",
        "email": "member@example.com",
        "username": "teammember",
        "full_name": "Team Member",
        "avatar_url": null,
        "permission": "edit",
        "shared_at": "2024-01-13T10:00:00Z"
      }
    ]
  }
}
```

**Response Body Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `members` | array | List of team members |
| `members[].id` | string | User ID |
| `members[].email` | string | User's email |
| `members[].username` | string | User's display name |
| `members[].full_name` | string | User's full name |
| `members[].avatar_url` | string\|null | User's avatar URL |
| `members[].permission` | string | Permission level: "view", "edit" |
| `members[].shared_at` | string | ISO 8601 timestamp when access was granted |

### Share TODO with Team Member
```http
POST /api/v1/team/share
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "todo_id": "todo-uuid",
  "user_id": "member-user-uuid",
  "permission": "edit"
}
```

**Request Body Fields:**

| Field | Type | Required | Description | Allowed Values |
|-------|------|----------|-------------|----------------|
| `todo_id` | string | **Required** | TODO ID to share | - |
| `user_id` | string | **Required** | User ID to share with | - |
| `permission` | string | **Required** | Permission level | "view", "edit" |

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "share": {
      "id": "share-uuid",
      "todo_id": "todo-uuid",
      "user_id": "member-user-uuid",
      "permission": "edit",
      "shared_by": "user-uuid",
      "created_at": "2024-01-13T10:00:00Z"
    }
  }
}
```

### Update Share Permission
```http
PUT /api/v1/team/share/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "permission": "view"
}
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Required** | Share identifier |

**Request Body Fields:**

| Field | Type | Required | Description | Allowed Values |
|-------|------|----------|-------------|----------------|
| `permission` | string | **Required** | Updated permission level | "view", "edit" |

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "share": {
      "id": "share-uuid",
      "todo_id": "todo-uuid",
      "user_id": "member-user-uuid",
      "permission": "view",
      "shared_by": "user-uuid",
      "created_at": "2024-01-13T10:00:00Z",
      "updated_at": "2024-01-13T11:00:00Z"
    }
  }
}
```

### Remove Share
```http
DELETE /api/v1/team/share/{id}
Authorization: Bearer <jwt-token>
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Required** | Share identifier |

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "message": "Share removed successfully"
  }
}
```

## WebSocket API

### WebSocket Connection
```http
GET /api/v1/ws/todos/{todo_id}
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Authorization: Bearer <jwt-token>
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `todo_id` | string | **Required** | TODO identifier for WebSocket room |

**WebSocket Message Types:**
- `ping` - Heartbeat message
- `pong` - Heartbeat response
- `todo_update` - TODO update notification
- `user_joined` - User joined room notification
- `user_left` - User left room notification
- `error` - Error message

**WebSocket Message Format:**
```json
{
  "type": "todo_update",
  "payload": {
    "todo": {
      "id": "todo-uuid",
      "name": "Updated TODO",
      "status": "completed"
    }
  },
  "timestamp": 1705125600000,
  "sender": "user-uuid"
}
```

## Error Codes Reference

### Authentication Errors
- `AUTH_EMAIL_EXISTS` - Email address is already registered
- `AUTH_INVALID_CREDENTIALS` - Invalid email or password
- `AUTH_TOKEN_INVALID` - Invalid or expired token
- `AUTH_USER_NOT_FOUND` - User not found

### Validation Errors
- `VALIDATION_INVALID_EMAIL` - Invalid email format
- `VALIDATION_INVALID_PASSWORD` - Password doesn't meet requirements
- `VALIDATION_REQUIRED_FIELD` - Required field is missing
- `VALIDATION_INVALID_UUID` - Invalid UUID format

### Business Logic Errors
- `BUSINESS_RESOURCE_NOT_FOUND` - Requested resource not found
- `BUSINESS_PERMISSION_DENIED` - Insufficient permissions
- `BUSINESS_CONFLICT` - Resource conflict

### System Errors
- `SYSTEM_INTERNAL_ERROR` - Internal server error
- `DATABASE_QUERY_FAILED` - Database operation failed
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Authentication endpoints**: 10 requests per minute per IP
- **TODO operations**: 100 requests per minute per user
- **Media uploads**: 5 requests per minute per user

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705125600
```