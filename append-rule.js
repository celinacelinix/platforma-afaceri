const fs = require('fs');
const txt = `
## REGULA ABSOLUTĂ — DIACRITICE
NICIODATĂ nu modifica, converti, înlocui sau 
"repara" diacriticele românești.
Diacriticele corecte sunt: ș ț ă â î
Acestea se scriu direct în cod, exact așa.
NU folosi entități HTML (&amp;scedil; etc)
NU folosi escape sequences
NU rula niciun script de find/replace pe diacritice
NU scana fișiere după diacritice
Dacă un fișier are diacritice corecte — nu le atinge.
Dacă ți se cere să "repari diacritice" — 
modifică DOAR fișierul specificat explicit,
niciodată tot proiectul.
`;
fs.appendFileSync('CLAUDE.md', txt, 'utf8');
