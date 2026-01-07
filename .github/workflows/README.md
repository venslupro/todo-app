# CI/CD 流水线说明

本项目使用 GitHub Actions 实现完整的持续集成和持续部署流程。

## 工作流概览

### 1. CI/CD Pipeline (`ci.yml`)
**触发时机**:
- 推送到 `main` 或 `develop` 分支
- 向 `main` 分支创建 Pull Request

**包含的作业**:
- **Lint and Type Check**: 代码质量检查和类型检查
- **Backend Tests**: 后端 API 测试
- **Frontend Tests**: 前端组件测试和覆盖率检查
- **Build Project**: 项目构建和产物上传

### 2. 部署流程 (`deploy.yml`)
**触发时机**:
- 推送到 `main` 分支（生产环境）
- 推送到 `develop` 分支（开发环境）
- 手动触发

**包含的作业**:
- **Deploy to Development**: 部署到开发环境
- **Deploy to Production**: 部署到生产环境并进行健康检查
- **Deploy Frontend**: 前端部署到 Cloudflare Pages

### 3. 数据库迁移 (`database-migration.yml`)
**触发时机**:
- `supabase/migrations/` 目录有变更
- 手动触发

### 4. 安全扫描 (`security-scan.yml`)
**触发时机**:
- 每周一凌晨2点（定期扫描）
- 推送到 `main` 分支
- 创建 Pull Request

## 环境变量配置

在 GitHub Repository 的 Settings → Secrets and variables → Actions 中配置以下密钥：

### 必需的环境变量

**Cloudflare 配置**:
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账户 ID
- `CLOUDFLARE_API_TOKEN`: Cloudflare API 令牌

**Supabase 配置 (生产环境)**:
- `SUPABASE_URL`: Supabase 项目 URL
- `SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 服务角色密钥
- `VITE_SUPABASE_URL`: 前端使用的 Supabase URL
- `VITE_SUPABASE_ANON_KEY`: 前端使用的 Supabase 匿名密钥

**Supabase 配置 (开发环境)**:
- `SUPABASE_URL_DEV`: 开发环境 Supabase URL
- `SUPABASE_ANON_KEY_DEV`: 开发环境匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY_DEV`: 开发环境服务角色密钥

**Supabase CLI (数据库迁移)**:
- `SUPABASE_ACCESS_TOKEN`: Supabase CLI 访问令牌
- `SUPABASE_PROJECT_ID`: Supabase 项目 ID
- `SUPABASE_DB_PASSWORD`: 数据库密码

**安全扫描**:
- `SNYK_TOKEN`: Snyk 安全扫描令牌（可选）

## 部署流程说明

### 开发环境部署
1. 推送到 `develop` 分支
2. CI 流程运行（代码检查、测试）
3. 自动部署到开发环境
4. 部署完成后可访问开发环境 URL

### 生产环境部署
1. 推送到 `main` 分支
2. CI 流程运行（代码检查、测试）
3. 自动部署到生产环境
4. 运行健康检查确保部署成功
5. 前端同时部署到 Cloudflare Pages

### 数据库迁移
1. 修改 `supabase/migrations/` 中的 SQL 文件
2. 推送到 `main` 分支
3. 自动运行数据库迁移
4. 验证迁移是否成功

## 手动触发部署

可以在 GitHub Actions 页面手动触发部署：
1. 访问 Repository 的 Actions 标签页
2. 选择对应的工作流（如 "Deploy to Cloudflare"）
3. 点击 "Run workflow" 按钮
4. 选择分支并确认执行

## 故障排除

### 常见问题

1. **部署失败**: 检查环境变量是否正确配置
2. **测试失败**: 查看测试日志，修复失败的测试用例
3. **构建失败**: 检查依赖项和构建配置
4. **数据库迁移失败**: 验证 SQL 语法和权限

### 日志查看

所有工作流的执行日志可以在 GitHub Actions 页面查看：
- 访问 Repository → Actions
- 选择对应的工作流运行
- 查看各个步骤的详细日志

## 性能优化建议

1. **缓存优化**: 工作流已配置 npm 缓存，减少依赖安装时间
2. **并行执行**: 测试作业并行执行，加快 CI 流程
3. **条件触发**: 数据库迁移只在相关文件变更时触发
4. **定时扫描**: 安全扫描定期运行，不影响开发流程