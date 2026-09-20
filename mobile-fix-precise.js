const fs = require('fs');

let page = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// Fix 2: Root padding and header margin
if (!page.includes("paddingTop: KPI_H")) {
  page = page.replace(
    /root: \{\s*minHeight: '100vh',\s*backgroundColor: '#f9fafb',\s*display: 'flex',\s*flexDirection: 'column',\s*\}/,
    `root: {\n      minHeight: '100vh',\n      backgroundColor: '#f9fafb',\n      display: 'flex',\n      flexDirection: 'column',\n      paddingTop: KPI_H,\n    }`
  );
  page = page.replace(
    /marginTop: KPI_H,/,
    `/* marginTop removed for mobile fix */`
  );
}

// Fix 3: Table min-width
page = page.replace(
  /table:(\s*)\{\s*width:\s*'100%',\s*borderCollapse:\s*'collapse'\s*as\s*const,\s*fontSize:\s*'0.875rem'\s*\}/g,
  `table:$1{ width: '100%', minWidth: 500, borderCollapse: 'collapse' as const, fontSize: '0.875rem' }`
);

fs.writeFileSync('app/dashboard/page.tsx', page, 'utf8');

let css = fs.readFileSync('app/globals.css', 'utf8');
// Fix 1: Scenario buttons
css = css.replace(
  /\.scenariu-switcher\s*\{\s*width:\s*100%;\s*flex-direction:\s*column\s*!important;\s*\}/,
  `.scenariu-switcher {
    width: 100%;
    flex-direction: row !important;
    overflow-x: auto;
    gap: 4px !important;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scenariu-switcher::-webkit-scrollbar {
    display: none;
  }`
);
css = css.replace(
  /\.scenariu-switcher button\s*\{\s*width:\s*100%;\s*min-height:\s*44px;\s*\}/,
  `.scenariu-switcher button {
    flex: 1;
    min-height: 44px;
    font-size: 0.75rem !important;
    padding: 6px 4px !important;
    white-space: nowrap;
  }`
);

fs.writeFileSync('app/globals.css', css, 'utf8');
