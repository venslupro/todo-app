# Todo App Backend Implementation Plan

## Project Structure

### 1. Core Architecture
- **API Layer**: Handles HTTP requests, validation, and response formatting
- **Services Layer**: Implements business logic, uses Result type for error handling
- **Driver Layer**: Encapsulates Supabase database operations

### 2. Implementation Steps

#### 2.1 Data Types and Schemas
- Create `src/types` directory for TypeScript type definitions
- Create `src/schemas` directory for Zod validation schemas
- Define types for all database models (Todo, Media, TodoShare, User)
- Create Zod schemas for request validation

#### 2.2 Driver Layer Implementation
- Create `src/drivers` directory
- Implement `SupabaseDriver` class for database operations
- Create module-specific drivers:
  - `TodoDriver` for todo-related operations
  - `MediaDriver` for media-related operations
  - `TeamDriver` for team sharing operations
  - `AuthDriver` for authentication operations

#### 2.3 Services Layer Implementation
- Create `src/services` directory
- Implement business logic services:
  - `SystemService` for health check and version info
  - `AuthService` for authentication operations
  - `TodoService` for todo management
  - `MediaService` for media management
  - `TeamService` for team sharing
- Use `neverthrow` Result type for error handling

#### 2.4 API Layer Implementation
- Update existing handler files in `src/api/handlers`
- Implement RESTful API endpoints according to DEVELOPER_GUIDE.md
- Add Zod validation to all endpoints
- Implement unified error handling using HTTPException
- Ensure response format matches documentation

#### 2.5 Middleware and Utils
- Create `src/middleware` directory
- Implement authentication middleware
- Implement error handling middleware
- Create `src/utils` directory for helper functions

#### 2.6 Configuration
- Update `src/index.ts` to set up routes and middleware
- Configure Supabase clients with anon key and service role key
- Ensure environment variables are properly handled

## Implementation Details

### 1. Data Types
- **Todo**: Based on todos table schema
- **Media**: Based on media table schema
- **TodoShare**: Based on todo_shares table schema
- **User**: Based on Supabase auth.users table

### 2. Zod Schemas
- Request validation schemas for all API endpoints
- Response schemas to ensure consistent output
- Error schemas for standardized error responses

### 3. Driver Layer
- **SupabaseDriver**: Singleton class managing Supabase clients
- **AuthDriver**: Uses service role key for profile operations
- **TodoDriver**: CRUD operations for todos with filtering and sorting
- **MediaDriver**: Media metadata management
- **TeamDriver**: Todo sharing operations

### 4. Services Layer
- **SystemService**: Health check and version info
- **AuthService**: Register, login, refresh token, logout, get profile
- **TodoService**: Create, read, update, delete todos with filtering
- **MediaService**: Generate upload URLs, confirm uploads, list media
- **TeamService**: Share todos, update permissions, remove shares

### 5. API Endpoints

#### System API
- `GET /` - Health check
- `GET /health` - Health check
- `GET /version` - Version information

#### Authentication API
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get current user

#### Todo API
- `GET /api/v1/todos` - Get all todos with filtering
- `POST /api/v1/todos` - Create todo
- `GET /api/v1/todos/{id}` - Get todo by ID
- `PUT /api/v1/todos/{id}` - Update todo
- `DELETE /api/v1/todos/{id}` - Delete todo

#### Media API
- `GET /api/v1/media` - Get all media
- `POST /api/v1/media/upload-url` - Generate upload URL
- `POST /api/v1/media/{id}/confirm` - Confirm upload

#### Team API
- `GET /api/v1/team/members` - Get team members
- `POST /api/v1/team/share` - Share todo with team member
- `PUT /api/v1/team/share/{id}` - Update share permission
- `DELETE /api/v1/team/share/{id}` - Remove share

## Technical Requirements

### 1. Dependencies
- **hono**: Web framework
- **zod**: Validation library
- **supabase-js**: Supabase client
- **neverthrow**: Result type for error handling
- **jose**: JWT handling

### 2. Code Style
- Google code style
- TypeScript strict mode
- SOLID principles
- Encapsulation and modularity

### 3. Error Handling
- Services layer: Use `neverthrow` Result type
- API layer: Use Hono HTTPException with custom error codes
- Unified error response format: `{ code, message, details }`

### 4. Authentication
- JWT Bearer token authentication
- Supabase auth integration
- Service role key only for profile operations
- Anon key for all other operations

## Implementation Timeline

1. **Data Types and Schemas**: 1 hour
2. **Driver Layer**: 2 hours
3. **Services Layer**: 3 hours
4. **API Layer**: 3 hours
5. **Middleware and Utils**: 1 hour
6. **Configuration and Testing**: 1 hour

## Expected Output

- Complete implementation of all API endpoints as per DEVELOPER_GUIDE.md
- Type-safe code with Zod validation
- Proper error handling with Result type and HTTPException
- Clean, modular architecture following SOLID principles
- Ready for deployment on Cloudflare Workers

## Testing Strategy

- Unit tests for services and drivers
- Integration tests for API endpoints
- Validation tests for request schemas
- Error handling tests
- Authentication flow tests