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

#### POST /api/auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

### Todo Management

#### GET /api/todos
Get all todos for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (pending, in-progress, completed)
- `limit` (optional): Number of items per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "todos": [
    {
      "id": "todo-id",
      "title": "Todo title",
      "description": "Todo description",
      "status": "pending",
      "due_date": "2024-01-15T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "has_more": false
}
```

#### POST /api/todos
Create a new todo.

**Request Body:**
```json
{
  "title": "Todo title",
  "description": "Todo description",
  "due_date": "2024-01-15T00:00:00Z"
}
```

#### PUT /api/todos/:id
Update a todo.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed"
}
```

#### DELETE /api/todos/:id
Delete a todo.

### Team Management

#### GET /api/teams
Get all teams the user belongs to.

#### POST /api/teams
Create a new team.

**Request Body:**
```json
{
  "name": "Team Name",
  "description": "Team description"
}
```

### Media Management

#### POST /api/media/upload
Upload a file (image or video).

**Headers:**
```http
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: The file to upload
- `type` (optional): File type (image/video)

**Response:**
```json
{
  "id": "media-id",
  "url": "https://your-bucket.s3.amazonaws.com/filename.jpg",
  "type": "image/jpeg",
  "size": 1024000
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

#### Todo Updates
```json
{
  "type": "todo_updated",
  "data": {
    "id": "todo-id",
    "title": "Updated title",
    "status": "completed"
  }
}
```

#### Todo Created
```json
{
  "type": "todo_created",
  "data": {
    "id": "todo-id",
    "title": "New todo",
    "status": "pending"
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
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `INVALID_TOKEN`: Invalid or expired JWT token
- `PERMISSION_DENIED`: User doesn't have permission
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `RATE_LIMITED`: Rate limit exceeded

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