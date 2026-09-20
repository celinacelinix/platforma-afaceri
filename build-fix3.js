const fs = require('fs');

let cap = fs.readFileSync('app/components/Capitol.tsx', 'utf8');
cap = cap.replace(/placeholder: string;/g, "placeholder?: string;");
cap = cap.replace(/type\?: 'text' \| 'textarea' \| 'number';/g, "type?: 'text' | 'textarea' | 'number' | 'checkboxes' | 'list';\n  aiPrompt?: string;");
fs.writeFileSync('app/components/Capitol.tsx', cap, 'utf8');
