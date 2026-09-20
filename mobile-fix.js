const fs = require('fs');

let page = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// 1. Bara fixată sus 2x2 pe mobil
page = page.replace(
  /kpiInner: \{[\s\S]*?paddingLeft: SIDE_W \+ 24,/,
  `kpiInner: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    alignItems: 'center',
    gap: 0,
    paddingLeft: SIDE_W + 24,`
);
// Add class "kpi-inner" to kpiInner div
page = page.replace(
  /<div style=\{lay\.kpiInner\}>/,
  '<div style={lay.kpiInner} className="kpi-inner">'
);
// Mobile strip button flexShrink
page = page.replace(
  /<button\s+key=\{ch\.id\}\s+onClick=\{\(\) => onSelect\(ch\.id\)\}\s+style=\{\{\s+padding:/,
  `<button
            key={ch.id}
            onClick={() => onSelect(ch.id)}
            style={{
              flexShrink: 0,
              padding:`
);

// Form buttons min-height
page = page.replace(/minHeight: 40,/g, 'minHeight: 44,'); // just in case

// Write page.tsx
fs.writeFileSync('app/dashboard/page.tsx', page, 'utf8');

// 2. globals.css updates
let css = fs.readFileSync('app/globals.css', 'utf8');

const additionalCss = `

@media (max-width: 767px) {
  .kpi-inner {
    grid-template-columns: repeat(2, 1fr) !important;
    padding-left: 16px !important;
  }
  .kpi-inner > div {
    padding: 12px 16px !important;
    border-bottom: 1px solid #e5e7eb;
  }
  /* Remove border right from 2nd and 4th column */
  .kpi-inner > div:nth-child(2n) {
    border-right: none !important;
  }
}

button {
  min-height: 44px;
}

input[type="text"], input[type="number"], textarea, select {
  width: 100% !important;
  min-height: 44px;
}

/* Ensure body doesn't overflow horizontally */
html, body {
  overflow-x: hidden;
}
`;

if (!css.includes('.kpi-inner')) {
    css += additionalCss;
    fs.writeFileSync('app/globals.css', css, 'utf8');
}

// 3. Sliders in app/dashboard/page.tsx
page = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
page = page.replace(
  /sliderRow: \{[\s\S]*?marginBottom: 20,\n  \},/,
  `sliderRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
    minHeight: 44,
    justifyContent: 'center',
  },`
);
fs.writeFileSync('app/dashboard/page.tsx', page, 'utf8');

// 4. Buttons in CampGhidat and Capitol
let cap = fs.readFileSync('app/components/Capitol.tsx', 'utf8');
cap = cap.replace(/padding: '12px 24px',/g, "padding: '12px 24px',\n    minHeight: 44,");
fs.writeFileSync('app/components/Capitol.tsx', cap, 'utf8');

let cg = fs.readFileSync('app/components/CampGhidat.tsx', 'utf8');
cg = cg.replace(/padding: '8px 16px',/g, "padding: '8px 16px',\n    minHeight: 44,");
fs.writeFileSync('app/components/CampGhidat.tsx', cg, 'utf8');

