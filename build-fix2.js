const fs = require('fs');

// Fix Capitol.tsx
let cap = fs.readFileSync('app/components/Capitol.tsx', 'utf8');
cap = cap.replace(/label: string;/g, "label: string;\n  type?: 'text' | 'textarea' | 'number';");
fs.writeFileSync('app/components/Capitol.tsx', cap, 'utf8');

// Fix page.tsx ParagrafText
let page = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
page = page.replace(/subtitlu:/g, 'titlu:');
fs.writeFileSync('app/dashboard/page.tsx', page, 'utf8');
