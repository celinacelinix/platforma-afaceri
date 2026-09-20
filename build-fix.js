const fs = require('fs');

// Fix page.tsx
let page = fs.readFileSync('app/dashboard/page.tsx', 'utf8');
if (!page.includes("type?: 'text'")) {
    page = page.replace(/label: string;/g, "label: string;\n  type?: 'text' | 'textarea' | 'number';");
}
page = page.replace(/onAssemble=\{\(\) => "Sistemul a generat automat[^\"]+"/g, 'onAssemble={() => [{ subtitlu: "", text: "Sistemul a generat automat lista de autorizații necesare din configurație." }]');
page = page.replace(/onAssemble=\{\(\) => "Sistemul a generat automat[^\"]+"/g, 'onAssemble={() => [{ subtitlu: "", text: "Sistemul a generat automat lista de autorizații necesare din configurație." }]');
// there is a chance it's single quotes or backticks, let's just do a string replacement
page = page.replace(/onAssemble=\{\(\) => "Sistemul a generat automat lista de autoriza>ii necesare din configura>ie\."\}/g, 'onAssemble={() => [{ subtitlu: "", text: "Sistemul a generat automat lista de autorizații necesare din configurație." }]}');

fs.writeFileSync('app/dashboard/page.tsx', page, 'utf8');

// Fix Capitol.tsx
let cap = fs.readFileSync('app/components/Capitol.tsx', 'utf8');
if (!cap.includes('onCompletionChange?:')) {
    cap = cap.replace(/isBlocked\?: boolean;/g, "isBlocked?: boolean;\n  onCompletionChange?: (val: boolean) => void;");
}
fs.writeFileSync('app/components/Capitol.tsx', cap, 'utf8');
