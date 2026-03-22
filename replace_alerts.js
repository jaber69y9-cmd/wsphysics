import fs from 'fs';

const filePath = 'src/pages/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace alert(...) with showAlert(...)
content = content.replace(/\balert\(/g, 'showAlert(');

// Replace window.confirm(...) with await showConfirm(...)
content = content.replace(/window\.confirm\(/g, 'await showConfirm(');

// Replace confirm(...) with await showConfirm(...)
content = content.replace(/(?<!\w)confirm\(/g, 'await showConfirm(');

// Add imports at the top
const importStatement = `import { showAlert, showConfirm } from '../utils/alert';\n`;
content = content.replace(/import React/, importStatement + 'import React');

fs.writeFileSync(filePath, content);
console.log('Replaced alerts and confirms in AdminDashboard.tsx');
