const fs = require('fs');
let content = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// Reverse n -> În
content = content.replace(/În/g, 'n');

// Reverse ' -> –
content = content.replace(/–/g, "'");

// Reverse ? -> ←
content = content.replace(/←/g, '?');

// Fix specific Romanian words that got mangled by reverting `n` -> `În`
content = content.replace(/n curând/g, 'În curând');
content = content.replace(/n curs/g, 'În curs');
content = content.replace(/nființare/g, 'Înființare');
content = content.replace(/nfiin.are/g, 'Înființare');
content = content.replace(/napoi/g, 'Înapoi');
content = content.replace(/ncredere/g, 'Încredere');
content = content.replace(/ntr-o/g, 'într-o');
content = content.replace(/nainte/g, 'înainte');
content = content.replace(/nchide/g, 'Închide');
content = content.replace(/ntre/g, 'între');
content = content.replace(/nceput/g, 'început');
content = content.replace(/mbunătățită/g, 'îmbunătățită');
content = content.replace(/mâncare/g, 'mâncare');

// Other specific fixes for known broken words
content = content.replace(/Piața /g, 'Piața ');
content = content.replace(/Pia..a/g, 'Piața');
content = content.replace(/op.iuni/g, 'opțiuni');
content = content.replace(/func.ionare/g, 'funcționare');
content = content.replace(/autoriza.ie/g, 'autorizație');

// In my script I had `[/\?o\?z/g, '📄']`, wait, I replaced `?o?z` with `📄`.
// Let's make sure the emoji is fine.

fs.writeFileSync('app/dashboard/page.tsx', content, 'utf8');
console.log("Reverted basic breakage");
