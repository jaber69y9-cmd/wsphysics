import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/Courses.tsx',
  'src/pages/Gallery.tsx',
  'src/pages/Home.tsx',
  'src/pages/Notices.tsx',
  'src/pages/OnlineCourses.tsx',
  'src/pages/Programs.tsx',
  'src/pages/RecordedClasses.tsx',
  'src/pages/Resources.tsx',
  'src/pages/Schedule.tsx',
  'src/pages/dashboard/AllResources.tsx',
  'src/pages/dashboard/Attendance.tsx',
  'src/pages/dashboard/Chapters.tsx',
  'src/pages/dashboard/Fees.tsx',
  'src/pages/dashboard/Notices.tsx',
  'src/pages/dashboard/Profile.tsx',
  'src/pages/dashboard/Resources.tsx',
  'src/pages/dashboard/Results.tsx',
  'src/pages/dashboard/Routines.tsx',
  'src/context/SettingsContext.tsx'
];

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace await res.json() with await safeJson(res)
  content = content.replace(/await res\.json\(\)/g, 'await safeJson(res)');
  // Also handle .then(res => res.json())
  content = content.replace(/\.then\(res => res\.json\(\)\)/g, '.then(res => safeJson(res))');

  // Add import at the top
  const isDashboard = filePath.includes('dashboard');
  const importPath = isDashboard ? '../../utils/api' : '../utils/api';
  const importStatement = `import { safeJson } from '${importPath}';\n`;
  
  // Find the first import and add it after
  content = content.replace(/import/, importStatement + 'import');

  fs.writeFileSync(filePath, content);
  console.log('Replaced res.json() in ' + filePath);
}
