const fs = require('fs');

let page = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// Header wrapper
page = page.replace(
  /<header style=\{lay\.pageHeader\}>/,
  '<header style={lay.pageHeader} className="page-header">'
);

// Header inner
page = page.replace(
  /<div style=\{lay\.pageHeaderInner\}>/,
  '<div style={lay.pageHeaderInner} className="page-header-inner">'
);

// Header actions
page = page.replace(
  /<div style=\{\{ display: 'flex', alignItems: 'center', gap: 16 \}\}>/,
  '<div style={{ display: \'flex\', alignItems: \'center\', gap: 16 }} className="header-actions">'
);

// ScenariuSwitcher wrapper
page = page.replace(
  /<div style=\{\{ display: 'flex', backgroundColor: '#f3f4f6', padding: 4, borderRadius: 8, gap: 4 \}\}>/,
  '<div style={{ display: \'flex\', backgroundColor: \'#f3f4f6\', padding: 4, borderRadius: 8, gap: 4 }} className="scenariu-switcher">'
);

// Make sure buttons in ScenariuSwitcher shrink or wrap
// But we can just handle it via globals.css

fs.writeFileSync('app/dashboard/page.tsx', page, 'utf8');

let css = fs.readFileSync('app/globals.css', 'utf8');

const additionalCss = `
@media (max-width: 767px) {
  .page-header {
    height: auto !important;
  }
  .page-header-inner {
    flex-direction: column !important;
    align-items: flex-start !important;
    height: auto !important;
    padding: 16px;
    gap: 16px !important;
  }
  .header-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch !important;
    gap: 12px !important;
  }
  .scenariu-switcher {
    width: 100%;
    flex-direction: column !important;
  }
  .scenariu-switcher button {
    width: 100%;
    min-height: 44px;
  }
}
`;

if (!css.includes('.page-header')) {
    css += additionalCss;
    fs.writeFileSync('app/globals.css', css, 'utf8');
}
