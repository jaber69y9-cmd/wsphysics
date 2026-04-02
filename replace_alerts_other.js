import fs from 'fs';

const files = [
  'src/pages/dashboard/Profile.tsx',
  'src/pages/Contact.tsx',
  'src/pages/Results.tsx'
];

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace alert(...) with showAlert(...)
  content = content.replace(/\balert\(/g, 'showAlert(');

  // Replace window.confirm(...) with await showConfirm(...)
  content = content.replace(/window\.confirm\(/g, 'await showConfirm(');

  // Replace confirm(...) with await showConfirm(...)
  content = content.replace(/(?<!\w)confirm\(/g, 'await showConfirm(');

  // Add imports at the top
  const importPath = filePath.includes('dashboard') ? '../../utils/alert' : '../utils/alert';
  const importStatement = `import { showAlert, showConfirm } from '${importPath}';\n`;
  content = content.replace(/import React/, importStatement + 'import React');

  fs.writeFileSync(filePath, content);
  console.log('Replaced alerts and confirms in ' + filePath);
}
