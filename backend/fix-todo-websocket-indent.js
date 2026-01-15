const fs = require('fs');
const path = require('path');

// 修复 todo-websocket.ts 文件中的缩进问题
const filePath = path.join(__dirname, 'src/core/durable-objects/todo-websocket.ts');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. 修复构造函数中的缩进问题
  content = content.replace(
    /constructor\(ctx: DurableObjectState, env: Env\) {\s*super\(ctx, env\);\s*\/\/ Initialize room state from storage\s*ctx\.blockConcurrencyWhile\(async \(\) => {\s*const storedRoom = await ctx\.storage\.get<TodoRoom>\('room'\);\s*if \(storedRoom\) {\s*this\.room = {\s*\.\.\.storedRoom,\s*connections: new Map\(storedRoom\.connections\),\s*};\s*}\s*}\);\s*}/,
    `constructor(ctx: DurableObjectState, env: Env) {\n    super(ctx, env);\n\n    // Initialize room state from storage\n    ctx.blockConcurrencyWhile(async () => {\n      const storedRoom = await ctx.storage.get<TodoRoom>('room');\n      if (storedRoom) {\n        this.room = {\n          ...storedRoom,\n          connections: new Map(storedRoom.connections),\n        };\n      }\n    });\n  }`
  );
  
  // 2. 修复方法中的缩进问题（4空格缩进改为2空格）
  content = content.replace(/^ {4}/gm, '  ');
  content = content.replace(/^ {6}/gm, '    ');
  content = content.replace(/^ {8}/gm, '      ');
  content = content.replace(/^ {10}/gm, '        ');
  content = content.replace(/^ {12}/gm, '          ');
  
  // 3. 修复逗号问题
  content = content.replace(/,\s*}/g, '}');
  content = content.replace(/,\s*\n\s*}/g, '\n  }');
  
  // 4. 添加 DurableObjectState 导入
  content = content.replace(
    /import \{DurableObject\} from 'cloudflare:workers';/,
    "import {DurableObject, DurableObjectState} from 'cloudflare:workers';"
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ todo-websocket.ts 缩进问题修复完成');
} else {
  console.log('❌ 文件不存在:', filePath);
}