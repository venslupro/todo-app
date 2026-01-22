## 问题分析
当前的CI/CD流水线配置中，只有`dev`分支和手动触发可以部署到staging环境，而`feature/*`分支无法自动部署。

## 解决方案
修改`.github/workflows/backend.yml`文件，将`deploy-staging`作业的触发条件扩展到所有非main分支。

## 具体修改点

### 1. 修改deploy-staging作业的触发条件
将当前的：
```yaml
if: |
  (github.ref == 'refs/heads/dev' && github.event_name == 'push' && needs.build.result == 'success') ||
  (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'staging')
```

修改为：
```yaml
if: |
  ((github.ref == 'refs/heads/dev' || startsWith(github.ref, 'refs/heads/feature/')) && 
   github.event_name == 'push' && needs.build.result == 'success') ||
  (github.event_name == 'workflow_dispatch' && github.event.inputs.environment == 'staging')
```

## 预期效果
- ✅ `main`分支：保持不变，不自动部署
- ✅ `dev`分支：推送时自动部署到staging
- ✅ `feature/*`分支：推送时自动部署到staging
- ✅ 手动触发：保持不变，可选择部署到staging或production

## 注意事项
- 只修改`deploy-staging`作业的触发条件，不影响production部署
- 确保只有成功构建的分支才会被部署
- 保持现有的环境变量和部署逻辑不变

## 验证方法
1. 修改后提交到`feature/*`分支
2. 查看GitHub Actions流水线是否自动运行部署作业
3. 确认部署成功