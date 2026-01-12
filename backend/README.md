# Todo App Backend API

A modern Todo application backend service built with Cloudflare Workers + Hono + Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare Wrangler CLI
- Supabase account

### Installation and Running

```bash
# Install dependencies
npm install

# Set up environment variables
cp docs/.dev.vars.example .dev.vars
# Edit .dev.vars file with actual values

# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test
```

## 📚 Documentation

- [📖 Project Overview](docs/PROJECT_SUMMARY.md) - Architecture and tech stack
- [⚙️ Environment Configuration](docs/ENVIRONMENT.md) - Environment variables setup
- [🔧 API Documentation](docs/API.md) - API endpoints and usage
- [🧪 Testing Guide](docs/TESTING.md) - Testing framework usage
- [🚀 Deployment Guide](docs/DEPLOYMENT.md) - Deployment to Cloudflare Workers

## 🏗️ Technology Stack

- **Framework**: Hono (RESTful API) + Durable Objects (WebSocket)
- **Runtime**: Cloudflare Workers
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **Testing**: Jest + TypeScript
- **Code Quality**: ESLint + Google Code Style

## 📁 Project Structure

```
src/
├── api/           # API routes and handlers
├── core/          # Core business logic
├── shared/        # Shared utilities and types
├── scripts/       # Database scripts
├── types/         # Type definitions
└── __tests__/     # Test files

docs/              # Project documentation
.github/          # CI/CD configuration
```

## 🔄 Development Workflow

### Code Standards
- Follow Google TypeScript code style
- Use ESLint for code quality checking
- Run `npm run lint` and `npm test` before committing

### Branch Strategy
- `main`: Production branch
- `dev`: Development branch
- Feature branches: `feature/feature-name`
- Fix branches: `fix/issue-description`

### Commit Convention
- feat: New feature
- fix: Bug fix
- docs: Documentation update
- style: Code formatting
- refactor: Code refactoring
- test: Test related

## 🛠️ Available Scripts

```bash
npm run dev        # Development server
npm run build      # Build project
npm run type-check # TypeScript type checking
npm run lint       # Code quality check
npm test           # Run tests
npm run deploy     # Deploy to Cloudflare Workers
```

## 🤝 Contributing Guide

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For questions or suggestions, please contact us through:
- Project Issues: [GitHub Issues](https://github.com/venslupro/todo-app/issues)
- Email: [Project maintainer email]

---

**Note**: Before deployment, ensure all environment variables are properly configured. For detailed instructions, see [Environment Configuration Documentation](docs/ENVIRONMENT.md).