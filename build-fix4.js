const fs = require('fs');

let cap = fs.readFileSync('app/components/Capitol.tsx', 'utf8');
cap = cap.replace(/aiPrompt\?: string;/g, "aiPrompt?: string;\n  options?: string[];");
cap = cap.replace(/placeholder=\{f\.placeholder\}/g, "placeholder={f.placeholder || ''}");
fs.writeFileSync('app/components/Capitol.tsx', cap, 'utf8');
