const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace specific bg-white classes with glassmorphism classes
content = content.replace(/className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100"/g, 'className="glass p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/60 bg-white/30 backdrop-blur-xl"');
content = content.replace(/className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-6"/g, 'className="glass p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/60 bg-white/30 backdrop-blur-xl flex flex-col gap-6"');
content = content.replace(/className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-white border border-slate-100 rounded-lg shadow-sm gap-2 sm:gap-0"/g, 'className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 glass bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm gap-2 sm:gap-0"');
content = content.replace(/className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"/g, 'className="glass rounded-[2.5rem] shadow-2xl border border-white/60 bg-white/30 backdrop-blur-xl overflow-hidden"');
content = content.replace(/className="p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-inner"/g, 'className="p-20 text-center glass rounded-[2.5rem] shadow-2xl border border-white/60 bg-white/30 backdrop-blur-xl"');
content = content.replace(/className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6"/g, 'className="glass p-8 rounded-[2.5rem] shadow-2xl border border-white/60 bg-white/30 backdrop-blur-xl space-y-6"');
content = content.replace(/className="bg-white\/20 text-white px-4 py-1 rounded-full text-sm font-bold backdrop-blur-sm"/g, 'className="glass bg-white/20 text-white px-4 py-1 rounded-full text-sm font-bold backdrop-blur-sm"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced bg-white classes in AdminDashboard.tsx');
