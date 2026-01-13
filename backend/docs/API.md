# API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#-base-url)
- [Authentication](#-authentication)
- [API Endpoints](#-api-endpoints)
- [WebSocket API](#-websocket-api)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [Security](#-security)
- [Request/Response Format](#-requestresponse-format)

## Overview

This document provides comprehensive documentation for the Todo App Backend API. The API follows RESTful principles and provides real-time WebSocket functionality.

## 🔌 Base URL

- **Development**: `http://localhost:8787`
- **Production**: `https://your-worker.your-account.workers.dev`

## 📋 Authentication

All API endpoints (except authentication endpoints) require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## 📊 API Endpoints

### Authentication

#### POST /api/v1/auth/register
Register a new user.

**Request:**
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
  "code": "OK",
  "message": "Success",
  "data": {
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "username": "johndoe",
      "full_name": "John Doe",
      "avatar_url": null,
      "role": "user",
      "created_at": "2024-01-13T10:30:00.000Z",
      "updated_at": "2024-01-13T10:30:00.000Z"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "refresh_token_123456",
      "expires_in": 3600
    }
  }
}
```

#### POST /api/v1/auth/login
Authenticate user and get JWT token.

**Request:**
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
  "code": "OK",
  "message": "Success",
  "data": {
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "username": "johndoe",
      "full_name": "John Doe",
      "avatar_url": null,
      "role": "user",
      "created_at": "2024-01-13T10:30:00.000Z",
      "updated_at": "2024-01-13T10:30:00.000Z"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "refresh_token_123456",
      "expires_in": 3600
    }
  }
}
```

#### POST /api/v1/auth/refresh
Refresh access token using refresh token.

**Request:**
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh_token_123456"
}
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "new_refresh_token_123456",
    "expires_in": 3600
  }
}
```

#### POST /api/v1/auth/logout
Logout user.

**Request:**
```http
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "success": true
  }
}
```

#### GET /api/v1/auth/me
Get current user information.

**Request:**
```http
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "username": "johndoe",
      "full_name": "John Doe",
      "avatar_url": null,
      "role": "user",
      "created_at": "2024-01-13T10:30:00.000Z",
      "updated_at": "2024-01-13T10:30:00.000Z"
    }
  }
}
```

### Todo Management

#### GET /api/v1/todos
Get all todos for the authenticated user with filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by status (`not_started`, `in_progress`, `completed`)
- `priority` (optional): Filter by priority (`low`, `medium`, `high`, `urgent`)
- `due_date_before` (optional): Filter by due date before
- `due_date_after` (optional): Filter by due date after
- `tags` (optional): Filter by tags (comma-separated)
- `search` (optional): Search in name and description
- `limit` (optional): Number of items per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `sort_by` (optional): Sort field (`due_date`, `created_at`, `updated_at`, `priority`, `name`)
- `sort_order` (optional): Sort order (`asc`, `desc`)

**Request:**
```http
GET /api/v1/todos?status=in_progress&priority=high&limit=10&offset=0&sort_by=due_date&sort_order=asc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "todos": [
      {
        "id": "todo_123456",
        "name": "完成项目报告",
        "description": "编写项目最终报告文档",
        "due_date": "2024-01-15T23:59:59.000Z",
        "status": "in_progress",
        "priority": "high",
        "tags": ["工作", "重要"],
        "created_by": "user_123456",
        "created_at": "2024-01-13T10:30:00.000Z",
        "updated_at": "2024-01-13T10:30:00.000Z",
        "completed_at": null,
        "parent_id": null,
        "is_deleted": false
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

#### POST /api/v1/todos
Create a new todo.

**Request:**
```http
POST /api/v1/todos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "学习TypeScript",
  "description": "完成TypeScript高级特性学习",
  "due_date": "2024-01-20T23:59:59.000Z",
  "status": "not_started",
  "priority": "medium",
  "tags": ["学习", "技术"],
  "parent_id": null
}
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "id": "todo_789012",
    "name": "学习TypeScript",
    "description": "完成TypeScript高级特性学习",
    "due_date": "2024-01-20T23:59:59.000Z",
    "status": "not_started",
    "priority": "medium",
    "tags": ["学习", "技术"],
    "created_by": "user_123456",
    "created_at": "2024-01-13T10:30:00.000Z",
    "updated_at": "2024-01-13T10:30:00.000Z",
    "completed_at": null,
    "parent_id": null,
    "is_deleted": false
  }
}
```

#### GET /api/v1/todos/:id
Get a specific todo by ID.

**Request:**
```http
GET /api/v1/todos/todo_123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "id": "todo_123456",
    "name": "完成项目报告",
    "description": "编写项目最终报告文档",
    "due_date": "2024-01-15T23:59:59.000Z",
    "status": "in_progress",
    "priority": "high",
    "tags": ["工作", "重要"],
    "created_by": "user_123456",
    "created_at": "2024-01-13T10:30:00.000Z",
    "updated_at": "2024-01-13T10:30:00.000Z",
    "completed_at": null,
    "parent_id": null,
    "is_deleted": false
  }
}
```

#### PUT /api/v1/todos/:id
Update a todo.

**Request:**
```http
PUT /api/v1/todos/todo_123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "完成项目报告（更新）",
  "status": "completed",
  "completed_at": "2024-01-13T11:00:00.000Z"
}
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "id": "todo_123456",
    "name": "完成项目报告（更新）",
    "description": "编写项目最终报告文档",
    "due_date": "2024-01-15T23:59:59.000Z",
    "status": "completed",
    "priority": "high",
    "tags": ["工作", "重要"],
    "created_by": "user_123456",
    "created_at": "2024-01-13T10:30:00.000Z",
    "updated_at": "2024-01-13T11:00:00.000Z",
    "completed_at": "2024-01-13T11:00:00.000Z",
    "parent_id": null,
    "is_deleted": false
  }
}
```

#### DELETE /api/v1/todos/:id
Delete a todo.

**Request:**
```http
DELETE /api/v1/todos/todo_123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "success": true
  }
}
```

### Team Collaboration

#### POST /api/v1/team/shares
Share a todo with other users.

**Request:**
```http
POST /api/v1/team/shares
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "todo_id": "todo_123456",
  "user_id": "user_789012",
  "permission": "edit"
}
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "id": "share_123456",
    "todo_id": "todo_123456",
    "user_id": "user_789012",
    "permission": "edit",
    "shared_by": "user_123456",
    "created_at": "2024-01-13T10:30:00.000Z",
    "updated_at": "2024-01-13T10:30:00.000Z"
  }
}
```

#### GET /api/v1/team/shares
Get share list with filtering.

**Query Parameters:**
- `todo_id` (optional): Filter by todo ID
- `user_id` (optional): Filter by user ID
- `permission` (optional): Filter by permission (`view`, `edit`)
- `limit` (optional): Number of items per page
- `offset` (optional): Pagination offset

**Request:**
```http
GET /api/v1/team/shares?todo_id=todo_123456&limit=10&offset=0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "shares": [
      {
        "id": "share_123456",
        "todo_id": "todo_123456",
        "user_id": "user_789012",
        "permission": "edit",
        "shared_by": "user_123456",
        "created_at": "2024-01-13T10:30:00.000Z",
        "updated_at": "2024-01-13T10:30:00.000Z"
      }
    ]
  }
}
```

#### GET /api/v1/team/shares/:id
Get a specific share by ID.

**Request:**
```http
GET /api/v1/team/shares/share_123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "id": "share_123456",
    "todo_id": "todo_123456",
    "user_id": "user_789012",
    "permission": "edit",
    "shared_by": "user_123456",
    "created_at": "2024-01-13T10:30:00.000Z",
    "updated_at": "2024-01-13T10:30:00.000Z"
  }
}
```

#### PUT /api/v1/team/shares/:id
Update share permissions.

**Request:**
```http
PUT /api/v1/team/shares/share_123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "permission": "view"
}
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "id": "share_123456",
    "todo_id": "todo_123456",
    "user_id": "user_789012",
    "permission": "view",
    "shared_by": "user_123456",
    "created_at": "2024-01-13T10:30:00.000Z",
    "updated_at": "2024-01-13T11:00:00.000Z"
  }
}
```

#### DELETE /api/v1/team/shares/:id
Delete a share.

**Request:**
```http
DELETE /api/v1/team/shares/share_123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "success": true
  }
}
```

### Media Management

#### GET /api/v1/media
Get media file list with filtering.

**Query Parameters:**
- `todo_id` (optional): Filter by todo ID
- `media_type` (optional): Filter by media type (`image`, `video`)
- `limit` (optional): Number of items per page
- `offset` (optional): Pagination offset

**Request:**
```http
GET /api/v1/media?todo_id=todo_123456&media_type=image&limit=10&offset=0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "media": [
      {
        "id": "media_123456",
        "todo_id": "todo_123456",
        "file_name": "screenshot.png",
        "file_path": "todos/todo_123456/screenshot.png",
        "file_size": 102400,
        "mime_type": "image/png",
        "media_type": "image",
        "duration": null,
        "width": 1920,
        "height": 1080,
        "thumbnail_url": "https://example.com/thumbnails/todo_123456/screenshot.png",
        "created_by": "user_123456",
        "created_at": "2024-01-13T10:30:00.000Z",
        "updated_at": "2024-01-13T10:30:00.000Z"
      }
    ]
  }
}
```

#### POST /api/v1/media/upload-url
Get upload URL for media file.

**Request:**
```http
POST /api/v1/media/upload-url
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "todoId": "todo_123456",
  "file_name": "document.pdf",
  "file_size": 2048000,
  "mime_type": "application/pdf"
}
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "media": {
      "id": "media_789012",
      "todo_id": "todo_123456",
      "file_name": "document.pdf",
      "file_path": "todos/todo_123456/document.pdf",
      "file_size": 2048000,
      "mime_type": "application/pdf",
      "media_type": "document",
      "duration": null,
      "width": null,
      "height": null,
      "thumbnail_url": null,
      "created_by": "user_123456",
      "created_at": "2024-01-13T10:30:00.000Z",
      "updated_at": "2024-01-13T10:30:00.000Z"
    },
    "upload_url": "https://bucket.s3.amazonaws.com/todos/todo_123456/document.pdf?signature=..."
  }
}
```

#### POST /api/v1/media/:id/confirm
Confirm media upload.

**Request:**
```http
POST /api/v1/media/media_123456/confirm
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "media": {
      "id": "media_123456",
      "todo_id": "todo_123456",
      "file_name": "screenshot.png",
      "file_path": "todos/todo_123456/screenshot.png",
      "file_size": 102400,
      "mime_type": "image/png",
      "media_type": "image",
      "duration": null,
      "width": 1920,
      "height": 1080,
      "thumbnail_url": "https://example.com/thumbnails/todo_123456/screenshot.png",
      "created_by": "user_123456",
      "created_at": "2024-01-13T10:30:00.000Z",
      "updated_at": "2024-01-13T10:30:00.000Z"
    }
  }
}
```

#### GET /api/v1/media/:id/url
Get media file URL.

**Request:**
```http
GET /api/v1/media/media_123456/url
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "url": "https://bucket.s3.amazonaws.com/todos/todo_123456/screenshot.png?signature=..."
  }
}
```

#### DELETE /api/v1/media/:id
Delete media file.

**Request:**
```http
DELETE /api/v1/media/media_123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "success": true
  }
}
```

### System Status

#### GET /api/v1/health
Health check endpoint.

**Request:**
```http
GET /api/v1/health
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-13T10:30:00.000Z",
    "environment": "development"
  }
}
```

#### GET /api/v1/version
Get API version information.

**Request:**
```http
GET /api/v1/version
```

**Response:**
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    "name": "TODO API",
    "version": "1.0.0",
    "description": "Real-time collaborative TODO list application",
    "documentation": "https://api.example.com/docs"
  }
}
```

## 🔄 WebSocket API

### Connection
Connect to WebSocket endpoint:

```javascript
const ws = new WebSocket('wss://your-worker.your-account.workers.dev/ws');
```

### Authentication
Send authentication message after connection:

```json
{
  "type": "auth",
  "token": "jwt-token-here"
}
```

### Message Types

#### Todo Created
```json
{
  "type": "todo_created",
  "data": {
    "id": "todo-id",
    "name": "New todo",
    "status": "pending"
  }
}
```

#### Todo Updated
```json
{
  "type": "todo_updated",
  "data": {
    "id": "todo-id",
    "name": "Updated todo",
    "status": "completed"
  }
}
```

#### Todo Deleted
```json
{
  "type": "todo_deleted",
  "data": {
    "id": "todo-id"
  }
}
```

## 🚨 Error Handling

### Standard Error Response
```json
{
  "code": "ERROR_CODE",
  "message": "Human readable error message",
  "details": "Additional error details"
}
```

### Common Error Codes
- `BAD_REQUEST`: Invalid request parameters
- `UNAUTHORIZED`: Authentication required or invalid token
- `FORBIDDEN`: User doesn't have permission
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `INTERNAL_SERVER_ERROR`: Server error

### Error Examples

#### Validation Error
**Request:**
```http
POST /api/v1/todos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "description": "缺少必要字段"
}
```

**Response:**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation Failed",
  "details": "name字段是必需的"
}
```

#### Unauthorized Error
**Request:**
```http
GET /api/v1/todos
```

**Response:**
```json
{
  "code": "UNAUTHORIZED",
  "message": "Unauthorized",
  "details": "Missing authorization header"
}
```

#### Not Found Error
**Request:**
```http
GET /api/v1/todos/nonexistent_id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "code": "NOT_FOUND",
  "message": "Not Found",
  "details": "TODO不存在"
}
```

## ⚡ Rate Limiting

API endpoints are rate limited:
- **Authentication endpoints**: 10 requests per minute
- **Todo endpoints**: 100 requests per minute
- **Media upload**: 5 requests per minute

## 🔒 Security

- All endpoints use HTTPS in production
- JWT tokens expire after 24 hours
- Row-level security in database
- CORS configured for allowed origins
- File uploads validated for type and size

## 📝 Request/Response Format

- **Content-Type**: `application/json`
- **Date Format**: ISO 8601 (e.g., `2024-01-01T00:00:00Z`)
- **Pagination**: Uses `limit` and `offset` parameters
- **Error Handling**: Consistent error response format
- **Response Structure**:
  ```json
  {
    "code": "OK",
    "message": "Success", 
    "data": {}
  }
  ```