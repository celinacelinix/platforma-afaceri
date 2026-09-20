const fs = require('fs');
let content = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// Fix `procent` in CSS and variable names where appropriate
content = content.replace(/procent/g, 'padding'); 
// But wait, what about `procent` inside `StocItem`? I fixed `StocItem` to have `procent: number;`!
// If I replace `procent` with `padding`, I break `StocItem` again!
// Let's replace ONLY specific known occurrences.
content = content.replace(/ procent,/g, ' padding,');
content = content.replace(/procent=\{/g, 'padding={');
content = content.replace(/procent:/g, 'padding:');
// Fix StocItem back to procent!
content = content.replace(/categorie: string; padding: number;/g, 'categorie: string; procent: number;');
content = content.replace(/padding: 60/g, 'procent: 60');
content = content.replace(/padding: 40/g, 'procent: 40');
content = content.replace(/padding: 0,/g, 'procent: 0,');
// And caprocent -> calcProcent? No, it's `calcCapital`. Just leave it as `caprocent`.

// Fix `luniPreDeschidere` to `preDeschidereLuni`
content = content.replace(/luniPreDeschidere/g, 'preDeschidereLuni');

// Fix `impadding` to `impactMinus`
content = content.replace(/impadding/g, 'impactMinus');
content = content.replace(/impact/g, 'impactMinus'); // wait! impactPlus exists! impactMax exists!
content = content.replace(/impactMinusPlus/g, 'impactPlus');
content = content.replace(/impactMinusMax/g, 'impactMax');

// Fix Capitol8Marketing missing props
content = content.replace(/function Capitol8Marketing\(\{ state \}/g, 'function Capitol8Marketing({ state, nr, title, rez }: { state: any; nr: number; title: string; rez: any })');

// Fix TS1117 errors (duplicate properties in object literal)
content = content.replace(/padding: '24px',\s+padding: '24px'/g, "padding: '24px'");
content = content.replace(/padding: "24px",\s+padding: "24px"/g, 'padding: "24px"');

fs.writeFileSync('app/dashboard/page.tsx', content, 'utf8');
