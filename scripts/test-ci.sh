#!/bin/bash

# CI/CD 测试脚本
# 用于验证 GitHub Actions 工作流的基本功能

echo "🚀 开始 CI/CD 测试..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node --version
npm --version

# 安装依赖
echo "📦 安装项目依赖..."
npm ci

# 运行代码检查
echo "🔍 运行 ESLint..."
npm run lint

# 运行类型检查
echo "🔍 运行 TypeScript 类型检查..."
npm run typecheck

# 运行测试
echo "🧪 运行测试..."
npm test

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建产物
echo "📁 检查构建产物..."
if [ -d "dist" ]; then
    echo "✅ 构建产物存在"
    ls -la dist/
else
    echo "❌ 构建产物不存在"
    exit 1
fi

# 前端测试
echo "🎨 前端测试..."
cd frontend
npm ci
npm run test:run
npm run typecheck
npm run build
cd ..

# Worker 测试
echo "⚙️ Worker 测试..."
cd worker
npm ci
npm test
cd ..

echo "✅ CI/CD 测试完成！所有检查通过。"
echo ""
echo "📋 下一步："
echo "1. 将代码推送到 GitHub"
echo "2. 在 GitHub 仓库设置中配置环境变量"
echo "3. 查看 GitHub Actions 运行结果"
echo "4. 验证部署是否成功"