const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/core/services/auth-service.ts',
  'src/core/services/media-service.ts',
  'src/core/services/share-service.ts',
  'src/core/services/todo-service.ts',
  'src/core/services/websocket-service.ts'
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 修复导入语句
    content = content.replace(
      /import\s*{\s*ErrorCode,\s*Result,\s*Ok,\s*Err\s*}\s*from\s*['"][^'"]+['"]/g,
      'import {ErrorCode, Result, okResult, errResult} from \'../../shared/errors/error-codes\''
    );
    
    // 修复 Ok 调用
    content = content.replace(/return Ok\(/g, 'return okResult(');
    content = content.replace(/Ok\(/g, 'okResult(');
    
    // 修复 Err 调用
    content = content.replace(/return Err\(/g, 'return errResult(');
    content = content.replace(/Err\(/g, 'errResult(');
    
    // 修复 Validator.validateUUID 调用（移除第二个参数）
    content = content.replace(/Validator\.validateUUID\(([^,]+),\s*[^)]+\)/g, 'Validator.validateUUID($1)');
    
    // 修复 Validator.validateDate 调用（移除第二个参数）
    content = content.replace(/Validator\.validateDate\(([^,]+),\s*[^)]+\)/g, 'Validator.validateDate($1)');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 修复完成: ${filePath}`);
  } else {
    console.log(`❌ 文件不存在: ${filePath}`);
  }
});

console.log('\n🎉 所有文件修复完成！');