import fs from 'fs';

const filePath = 'src/pages/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace await res.json() with await safeJson(res)
content = content.replace(/await res\.json\(\)/g, 'await safeJson(res)');

// Add import at the top
const importStatement = `import { safeJson } from '../utils/api';\n`;
content = content.replace(/import React/, importStatement + 'import React');

fs.writeFileSync(filePath, content);
console.log('Replaced res.json() in AdminDashboard.tsx');
