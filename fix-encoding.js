const fs = require('fs');
const path = require('path');

const file = 'app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// I'll re-read it as latin1 and write it as utf8 to see if it fixes the main chunk.
// The user said: "PiaÃ^â€ºa" în loc de "Piața", "Ã¢â€" în loc de litere normale
// This string "Ã¢â€" is actually "â€" etc.
// Let's do a programmatic buffer conversion first to reverse the UTF-8 to Latin-1 misinterpretation.

function fixDoubleUTF8(str) {
  try {
    // If the string was read as Latin1 but was actually UTF8:
    return Buffer.from(str, 'latin1').toString('utf8');
  } catch (e) {
    return str;
  }
}

let attempt1 = fixDoubleUTF8(content);
if (attempt1.includes('Piața') || attempt1.includes('Înapoi')) {
  fs.writeFileSync(file, attempt1, 'utf8');
  console.log("Fixed via latin1 -> utf8");
  process.exit(0);
}

// Manual regex replacements based on Romanian words used in the app
const manualFixes = [
  [/Pia\w+a/g, 'Piața'],
  [/Pia\^\?a/g, 'Piața'],
  [/PiaÃ\^â€ºa/g, 'Piața'],
  [/Ã¢â€ ÂÃfÅ½napoi/g, '← Înapoi'],
  [/Ã¢â€/g, 'ă'],
  [/Ã\^â€º/g, 'ț'],
  
  // Specific words from the snippets
  [/m\w+ncare/g, 'mâncare'],
  [/proasp\w+t\w+/g, 'proaspătă'],
  [/atmosfer\w+ cald\w+/g, 'atmosferă caldă'],
  [/diferen\w+iezi/g, 'diferențiezi'],
  [/concuren\w+\w+\w+/g, 'concurență'],
  [/Strad\w+ comercial\w+ central\w+/g, 'Stradă comercială centrală'],
  [/op\w+iuni/g, 'opțiuni'],
  [/Listeaz\w+/g, 'Listează'],
  [/pre\w+ mediu/g, 'preț mediu'],
  [/\?o\?z/g, '📄'],
  [/ǽ\?\? ǟnapoi/g, '← Înapoi'],
  [/ǟn/g, 'în'],
  [/Zn/g, 'În'],
  [/Znapoi/g, 'Înapoi'],
  [/Znfiin.are/g, 'Înființare'],
  [/func.ionare/g, 'funcționare'],
  [/autoriza.ie/g, 'autorizație'],
  [/Autoriza.ie/g, 'Autorizație'],
  [/Ob.inut/g, 'Obținut'],
  [/Neǩnceput/g, 'Neînceput'],
  [/\?o/g, '✓'],
  [/\^\?/g, 'ț'],
  [/\^"/g, 'ș'],
  [/"'/g, 'ă'],
  [/ǟ/g, 'î'],
  [/ǽ'/g, '...'],
  [/'/g, '–'],
  [/\?"/g, '-'],
  [/\?/g, '←'],
  [/Ti/g, 'și'],
  [/s\w+rb\w+tori/g, 'sărbători'],
  [/v\w+rf/g, 'vârf'],
  [/f\w+r\w+/g, 'fără'],
  [/p\w+n\w+/g, 'până'],
  [/pia\w+a/g, 'piața'],
  [/ac\w+iune/g, 'acțiune']
];

for (const [regex, replacement] of manualFixes) {
  content = content.replace(regex, replacement);
}

// Try one more aggressive pass over common Romanian words based on known text
content = content.replace(/func.ionare/g, 'funcționare');
content = content.replace(/Pia..a .i loca..ia/g, 'Piața și locația');
content = content.replace(/Analiza concuren..ei/g, 'Analiza concurenței');
content = content.replace(/Plan opera..ional/g, 'Plan operațional');
content = content.replace(/Autoriza..ii/g, 'Autorizații');
content = content.replace(/Generare PDF/g, 'Generare PDF');
content = content.replace(/Asambleaz. capitolul/g, 'Asamblează capitolul');
content = content.replace(/Verific. misiunile/g, 'Verifică misiunile');
content = content.replace(/Fundamentat./g, 'Fundamentată');
content = content.replace(/Par.ial validat./g, 'Parțial validată');
content = content.replace(/Estimare .mbun.t..it./g, 'Estimare îmbunătățită');
content = content.replace(/Estimare orientativ./g, 'Estimare orientativă');
content = content.replace(/Zncurǽnd/g, 'În curând');

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed via regex");
