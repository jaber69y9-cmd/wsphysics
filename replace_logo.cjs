const fs = require('fs');
const content = fs.readFileSync('src/components/DashboardLayout.tsx', 'utf8');
const updated = content.replace(/src="https:\/\/yt3\.googleusercontent\.com\/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj"/g, 'src={settings.logo_url || "https://yt3.googleusercontent.com/yCls-kXn7hDbzhR5VDN487vOkUQfVyKXpDnh09EscXdOq6mOdDhxfkTnJ4kKQ85K4RaXwhv70A=s160-c-k-c0x00ffffff-no-rj"} referrerPolicy="no-referrer"');
fs.writeFileSync('src/components/DashboardLayout.tsx', updated);
console.log('Replaced logo URL in DashboardLayout');
