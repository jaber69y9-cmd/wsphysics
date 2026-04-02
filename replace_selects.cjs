const fs = require('fs');
const content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
const updated = content.replace(/<select\s+className="glass-input/g, '<select className="glass-select');
fs.writeFileSync('src/pages/AdminDashboard.tsx', updated);
console.log('Replaced glass-input with glass-select for select tags');
