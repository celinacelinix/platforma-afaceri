// format.js — rotunjire și formatare la AFIȘARE.
// Calculul se face cu precizie completă în engine.js; aici rotunjim.
// Rezolvă și problema 0.1 + 0.2 = 0.30000000000000004.

'use strict';

// număr cu separator de mii RO, fără zecimale (pentru sume mari)
function bani(n) {
  return Math.round(Number(n) || 0).toLocaleString('ro-RO');
}

// sumă în lei, gata de afișat (ex. "44.000 lei")
function lei(n) {
  return bani(n) + ' lei';
}

// număr cu 2 zecimale, format RO (pentru prețuri unitare)
function pret(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// procent cu o zecimală
function procent(n) {
  return (Number(n) || 0).toFixed(1) + '%';
}

// întreg (clienți, luni)
function intreg(n) {
  return String(Math.round(Number(n) || 0));
}

// lună de proiecție -> etichetă lizibilă
function luna(m) {
  if (m == null) return '—';
  if (m < 0) return `luna ${m} (pre-deschidere)`;
  return `luna ${m}`;
}

const format = { bani, lei, pret, procent, intreg, luna };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = format;
}
if (typeof window !== 'undefined') {
  window.BizFormat = format;
}
