# Todo App Backend

A serverless backend service for a Todo application built on Cloudflare Workers with Hono framework.

## Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account with Workers access
- Supabase account for database

### Installation
```bash
# Clone the repository
git clone https://github.com/venslupro/todo-app.git
cd todo-app/backend

# Install dependencies
npm install

# Configure environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your configuration

# Start development server
npm run dev
```

### Deployment
```bash
# Deploy to production
npm run deploy:prod

# Deploy to staging
npm run deploy:staging
```

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── handlers/          # API route handlers
│   │   └── middleware/        # Request middleware
│   ├── core/
│   │   ├── models/           # Data models
│   │   └── services/         # Business logic services
│   ├── database/             # Database schema and migrations
│   └── shared/
│       ├── errors/           # Error handling
│       ├── supabase/         # Database client
│       └── validation/       # Data validation
├── docs/                     # Documentation
└── tests/                     # Test files
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh

### Todo Management
- `GET /api/v1/todos` - List todos
- `POST /api/v1/todos` - Create todo
- `GET /api/v1/todos/:id` - Get todo
- `PUT /api/v1/todos/:id` - Update todo
- `DELETE /api/v1/todos/:id` - Delete todo

### Media Files
- `POST /api/v1/media/upload` - Upload file
- `GET /api/v1/media/:id` - Get file
- `DELETE /api/v1/media/:id` - Delete file

### Team Collaboration
- `POST /api/v1/team/share` - Share todo
- `GET /api/v1/team/shared` - List shared todos
- `PUT /api/v1/team/permissions/:id` - Update permissions

### WebSocket
- `GET /ws/v1/todo/:id` - Real-time todo updates

## Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build project
npm test             # Run tests
npm run type-check   # TypeScript type checking
npm run lint         # Code linting
```

### Environment Variables
Required environment variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `JWT_SECRET` - JWT signing secret

## Documentation

- [Developer Guide](docs/DEVELOPER_GUIDE.md) - API documentation and usage
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment instructions
- [Testing Guide](docs/TESTING.md) - Testing framework and practices

## License

MIT License - see [LICENSE](LICENSE) file for details.