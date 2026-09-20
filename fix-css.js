const fs = require('fs');
let content = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// Quick fixes for the regex disasters
content = content.replace(/p\w+n\w+:/g, 'padding:');
content = content.replace(/f\w+r\w+:/g, 'flexDirection:');
content = content.replace(/ov\w+rflow:/g, 'overflow:');
content = content.replace(/gridTemp\w+n\w+:/g, 'gridTemplateColumns:');
content = content.replace(/letterSp\w+n\w+:/g, 'letterSpacing:');

content = content.replace(/până:/g, 'padding:');
content = content.replace(/fără:/g, 'flexDirection:');
content = content.replace(/fără: "column"/g, 'flexDirection: "column"');

content = content.replace(/function Cap\w+na/g, 'function Capitol8Marketing');
content = content.replace(/disp\w+na .n cur.nd/g, 'disponibil în curând');
content = content.replace(/Znfiinre fara/g, 'Înființare firmă');
content = content.replace(/afara:/g, 'afacere:');
content = content.replace(/nfiinre fara/g, 'Înființare firmă');
content = content.replace(/n/g, 'În');
content = content.replace(/Zn/g, 'În');
content = content.replace(/nceput/g, 'început');
content = content.replace(/Nenceput/g, 'Neînceput');
content = content.replace(/Ne.nceput/g, 'Neînceput');
content = content.replace(/.n curs/g, 'În curs');

// A function to search and fix properties like `padding`
// Let's just write the output
fs.writeFileSync('app/dashboard/page.tsx', content, 'utf8');
