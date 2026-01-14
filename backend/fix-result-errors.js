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
    
    // 修复 iserrResult() 为 isErr()
    content = content.replace(/iserrResult\(\)/g, 'isErr()');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 修复完成: ${filePath}`);
  } else {
    console.log(`❌ 文件不存在: ${filePath}`);
  }
});

console.log('\n🎉 所有文件修复完成！');