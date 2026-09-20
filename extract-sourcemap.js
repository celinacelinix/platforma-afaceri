const fs = require('fs');
const mapPath = '.next/server/app/dashboard/page.js.map';
if (fs.existsSync(mapPath)) {
    const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    // Look for dashboard/page.tsx
    const index = map.sources.findIndex(s => s.includes('app/dashboard/page.tsx'));
    if (index !== -1) {
        const originalContent = map.sourcesContent[index];
        fs.writeFileSync('app/dashboard/page.tsx', originalContent, 'utf8');
        console.log('Recovered successfully!');
    } else {
        console.log('Not found in source map.');
    }
} else {
    console.log('Map file not found');
}
