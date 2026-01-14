const fs = require('fs');
const path = require('path');

// 修复 todo-websocket.ts 文件
const filePath = path.join(__dirname, 'src/core/durable-objects/todo-websocket.ts');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. 修复箭头函数参数括号
  content = content.replace(/\(conn\) =>/g, '(conn) =>');
  content = content.replace(/conn =>/g, '(conn) =>');
  
  // 2. 修复对象花括号间距
  content = content.replace(/\{ ([^}]+) \}/g, '{$1}');
  content = content.replace(/\{([^}]+) \}/g, '{$1}');
  content = content.replace(/\{ ([^}]+)\}/g, '{$1}');
  
  // 3. 移除未使用的参数
  content = content.replace(/_excludeUserId\?: string/g, '');
  
  // 4. 修复尾随空格
  content = content.replace(/\s+\n/g, '\n');
  
  // 5. 修复缩进问题（将8空格缩进改为6空格）
  content = content.replace(/^ {8}/gm, '      ');
  content = content.replace(/^ {10}/gm, '        ');
  content = content.replace(/^ {12}/gm, '          ');
  
  // 6. 添加文件末尾换行符
  content = content.replace(/\n*$/, '\n');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ todo-websocket.ts 文件修复完成');
} else {
  console.log('❌ 文件不存在:', filePath);
}