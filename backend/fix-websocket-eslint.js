#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/api/handlers/websocket.ts');

// 读取文件内容
let content = fs.readFileSync(filePath, 'utf8');

console.log('开始修复websocket.ts文件中的ESLint错误...');

// 1. 修复尾随空格
content = content.replace(/\s+$/gm, '');

// 2. 修复object-curly-spacing错误（第198行）
content = content.replace(/\{ success: true \}/g, '{success: true}');

// 3. 修复缺失的尾随逗号（第240行附近）
// 查找包含WebSocketCloseCode.INTERNAL_ERROR的行并添加逗号
content = content.replace(/(WebSocketCloseCode\.INTERNAL_ERROR)(\s*\n)/g, '$1,$2');

// 4. 修复文件末尾换行符
if (!content.endsWith('\n')) {
  content += '\n';
}

// 5. 修复padded-blocks错误
// 这些错误需要手动修复，因为涉及代码块的空行
// 这里先标记需要手动修复的位置

// 写入修复后的内容
fs.writeFileSync(filePath, content, 'utf8');

console.log('批量修复完成！');
console.log('请手动检查以下需要修复的padded-blocks错误：');
console.log('- 第116行附近的块');
console.log('- 第157行附近的块');
console.log('- 第199行附近的块');
console.log('- 第264行附近的块');
console.log('- 第312行附近的块');
console.log('- 第356行附近的块');

console.log('运行ESLint检查以验证修复结果...');