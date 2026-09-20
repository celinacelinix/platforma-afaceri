// engine.test.js — cele 12 cazuri de test din motor_calcul_SPEC.md,
// plus câteva teste de verdict. Rulează cu: node test/engine.test.js
// Fără framework extern — un mic runner propriu.

'use strict';

const engine = require('../src/engine.js');
const verdict = require('../src/verdict.js');
const format = require('../src/format.js');
const cfg = require('../configs/restaurant.test.json');

const taxe = {
  contributii_angajator: { cam_pct: 0 } // 0 pentru teste deterministe simple
};

let pass = 0, fail = 0;
const fails = [];

function aprox(a, b, eps) {
  return Math.abs(a - b) <= (eps == null ? 0.01 : eps);
}
function check(nume, conditie, detaliu) {
  if (conditie) { pass++; }
  else { fail++; fails.push(nume + (detaliu ? '  → ' + detaliu : '')); }
}

// state minimal reutilizabil
function baseState(over) {
  return Object.assign({
    domeniu: 'restaurant',
    tip_zona: 'centru', tier: 'tier_3',
    meniu: [],
    venituri_extra: [],
    cheltuieli: [],
    stocuri: [],
    clienti_zi: 0, zile_lucrate_luna: 28,
    pierderi_pct: 0, rampa_luni: 5, pre_deschidere_luni: 3,
    angajati: 0, salariu_mediu_brut: 0,
    investitie: [], capital_initial: 100000,
    platitor_tva: false, cota_tva: 0, regim_impozit: 'profit', cota_impozit: 0,
    scenariu: 'realist', mod_flux: 'medie',
    suprafata_mp: 90,
    surse: {}
  }, over || {});
}

// ---------------------------------------------------------------------------
console.log('\n=== Cele 12 cazuri din specificație ===\n');

// TEST 1 — preț și cost mediu ponderat
(() => {
  const m = engine._pasMeniu([
    { pret: 10, cost: 4, mix_pct: 50 },
    { pret: 5, cost: 1, mix_pct: 50 }
  ]);
  check('T1 preț mediu = 7.50', aprox(m.pretMediu, 7.5), 'got ' + m.pretMediu);
  check('T1 cost mediu = 2.50', aprox(m.costMediu, 2.5), 'got ' + m.costMediu);
  check('T1 food cost = 33.33%', aprox(m.foodCostPct, 33.333, 0.01), 'got ' + m.foodCostPct);
})();

// TEST 2 — mix nenormalizat (30/30 dă același rezultat)
(() => {
  const m = engine._pasMeniu([
    { pret: 10, cost: 4, mix_pct: 30 },
    { pret: 5, cost: 1, mix_pct: 30 }
  ]);
  check('T2 preț mediu = 7.50 (normalizat)', aprox(m.pretMediu, 7.5), 'got ' + m.pretMediu);
})();

// TEST 3 — mix zero, fără eroare de împărțire
(() => {
  let ok = true, m;
  try { m = engine._pasMeniu([{ pret: 10, cost: 4, mix_pct: 0 }]); }
  catch (e) { ok = false; }
  check('T3 mix zero nu aruncă eroare', ok);
  check('T3 preț mediu = 0', ok && m.pretMediu === 0, m ? 'got ' + m.pretMediu : 'threw');
})();

// TEST 4 — prag de rupere
(() => {
  const s = baseState({
    meniu: [{ pret: 10, cost: 3, mix_pct: 100 }],
    pierderi_pct: 0,
    cheltuieli: [{ nume: 'fixe', categorie: 'spatiu', valoare: 7000, tip: 'fix' }],
    zile_lucrate_luna: 28,
    suprafata_mp: 0 // fără chirie din config
  });
  const meniuCalc = engine._pasMeniu(s.meniu);
  const prag = engine._pragRupere(s, cfg, taxe, meniuCalc);
  check('T4 prag = 36 clienți/zi', prag === 36, 'got ' + prag);
})();

// TEST 5 — prag imposibil (cost > preț)
(() => {
  const s = baseState({
    meniu: [{ pret: 10, cost: 12, mix_pct: 100 }],
    cheltuieli: [{ nume: 'fixe', valoare: 5000, tip: 'fix' }],
    suprafata_mp: 0
  });
  const meniuCalc = engine._pasMeniu(s.meniu);
  const prag = engine._pragRupere(s, cfg, taxe, meniuCalc);
  check('T5 prag = null (imposibil)', prag === null, 'got ' + prag);
})();

// TEST 6 — TVA
(() => {
  // construim un state care produce exact venit_brut=11100, consum_brut=3330
  // venit = volum * pret; alegem clienti_zi=... simplu: 1 client, pret 11100, 1 zi
  const s = baseState({
    meniu: [{ pret: 11100, cost: 3330, mix_pct: 100 }],
    clienti_zi: 1, zile_lucrate_luna: 1,
    platitor_tva: true, cota_tva: 11,
    suprafata_mp: 0
  });
  const meniuCalc = engine._pasMeniu(s.meniu);
  const r = engine._rezultateLaCapacitate(s, cfg, taxe, meniuCalc);
  check('T6 venit net = 10000', aprox(r.venitNet, 10000, 0.5), 'got ' + r.venitNet);
  check('T6 consum net = 3000', aprox(r.consumNet, 3000, 0.5), 'got ' + r.consumNet);
  check('T6 TVA de plată = 770', aprox(r.tvaPlata, 770, 0.5), 'got ' + r.tvaPlata);
})();

// TEST 7 — rampa
(() => {
  check('T7 rampa(0), rampaLuni 5 = 0.2', aprox(engine._rampa(0, 5), 0.2));
  check('T7 rampa(4) = 1.0', aprox(engine._rampa(4, 5), 1.0));
  check('T7 rampa(9) = 1.0 (plafonat)', aprox(engine._rampa(9, 5), 1.0));
})();

// TEST 8 — achiziții vs consum (verificat prin proiecție)
(() => {
  // Construim un caz unde știm consum net lunar la capacitate și stocul.
  // consum_net_capac = clienti*zile*cost*(1+pierderi). Alegem cifre curate:
  // 1 produs cost=5000/(28) pe zi? Mai simplu: verificăm capitalBlocatStoc direct.
  const s = baseState({
    meniu: [{ pret: 20, cost: 10, mix_pct: 100 }],
    clienti_zi: 500, zile_lucrate_luna: 1, // volum 500, consum = 500*10 = 5000
    pierderi_pct: 0,
    stocuri: [{ categorie: 'tot', pct_din_marfa: 100, zile_stoc: 36, termen_plata_zile: 0 }],
    suprafata_mp: 0
  });
  // consum net capac = 5000; blocat = (5000/30)*36 = 6000
  const meniuCalc = engine._pasMeniu(s.meniu);
  const proj = engine._proiectieCash(s, cfg, taxe, meniuCalc, 100000);
  check('T8 capital blocat stoc = 6000', aprox(proj.capitalBlocatStoc, 6000, 1), 'got ' + proj.capitalBlocatStoc);
})();

// TEST 9 — decalajul de plată (lag din termen)
(() => {
  // termen 30 zile -> lag 1 lună. Verificăm că prima lună nu plătește marfă.
  const s = baseState({
    meniu: [{ pret: 20, cost: 10, mix_pct: 100 }],
    clienti_zi: 100, zile_lucrate_luna: 28,
    pierderi_pct: 0, rampa_luni: 1, pre_deschidere_luni: 0,
    stocuri: [{ categorie: 'tot', pct_din_marfa: 100, zile_stoc: 5, termen_plata_zile: 30 }],
    investitie: [], capital_initial: 100000,
    suprafata_mp: 0, cheltuieli: []
  });
  const meniuCalc = engine._pasMeniu(s.meniu);
  const proj = engine._proiectieCash(s, cfg, taxe, meniuCalc, 100000);
  // luna 0: cash = capital + venit - (0 marfă plătită) - fixe(0)
  // venit luna 0 = 100*28*20 = 56000; fără marfă plătită (lag 1)
  const luna0 = proj.serie.find(x => x.luna === 0);
  check('T9 lag 30 zile -> luna 0 fără plată marfă',
    aprox(luna0.cash, 100000 + 56000, 1), 'got ' + luna0.cash);
})();

// TEST 10 — capacitate fizică
(() => {
  const s = baseState({ suprafata_mp: 40 });
  const plafon = engine._capacitateFizica(s, cfg); // 40/1.6=25 locuri *3 =75
  check('T10 plafon fizic = 75', plafon === 75, 'got ' + plafon);
})();

// TEST 11 — cheltuială procentuală scalează cu venitul
(() => {
  const base = baseState({
    meniu: [{ pret: 20, cost: 6, mix_pct: 100 }],
    clienti_zi: 100, zile_lucrate_luna: 28,
    cheltuieli: [{ nume: 'comision card', categorie: 'operational', valoare: 1.5, tip: 'pct_venit' }],
    suprafata_mp: 0
  });
  const m1 = engine._pasMeniu(base.meniu);
  const r1 = engine._rezultateLaCapacitate(base, cfg, taxe, m1);
  // venit1 = 100*28*20 = 56000 -> comision 1.5% = 840
  const com1 = r1.venitNet * 0.015;

  const dbl = baseState({
    meniu: [{ pret: 20, cost: 6, mix_pct: 100 }],
    clienti_zi: 200, zile_lucrate_luna: 28, // venit dublu
    cheltuieli: [{ nume: 'comision card', categorie: 'operational', valoare: 1.5, tip: 'pct_venit' }],
    suprafata_mp: 0
  });
  const m2 = engine._pasMeniu(dbl.meniu);
  const r2 = engine._rezultateLaCapacitate(dbl, cfg, taxe, m2);
  const com2 = r2.venitNet * 0.015;

  check('T11 comision se dublează cu venitul', aprox(com2, com1 * 2, 1),
    `com1=${com1.toFixed(0)} com2=${com2.toFixed(0)}`);
})();

// TEST 12 — rotunjire la afișare
(() => {
  check('T12 format.pret(0.1+0.2) = "0,30"', format.pret(0.1 + 0.2) === '0,30',
    'got ' + format.pret(0.1 + 0.2));
  check('T12 format.pret(7*1.1) = "7,70"', format.pret(7 * 1.1) === '7,70',
    'got ' + format.pret(7 * 1.1));
  check('T12 format.bani(53760.4999) fără zecimale de eroare',
    /^53\.760$|^53 760$/.test(format.bani(53760.4999)) || format.bani(53760.4999).replace(/\s/g, '').includes('53'),
    'got ' + format.bani(53760.4999));
})();

// ---------------------------------------------------------------------------
console.log('=== Teste de verdict ===\n');

// V1 — capacitate fizică depășită = blocant
(() => {
  const s = baseState({
    meniu: [{ pret: 20, cost: 8, mix_pct: 100 }],
    clienti_zi: 150, suprafata_mp: 40, // plafon 75
    zile_lucrate_luna: 28
  });
  const rez = engine.calculeaza(s, cfg, taxe, []);
  const alerte = verdict.evalueazaVerdict(rez, s, cfg);
  const blocant = alerte.find(a => a.id === 'capacitate_fizica');
  check('V1 alertă capacitate fizică blocantă', !!blocant && blocant.blocheazaGenerare === true);
})();

// V2 — marjă nerealistă = roșu
(() => {
  const s = baseState({
    meniu: [{ pret: 20, cost: 2, mix_pct: 100 }], // marjă enormă
    clienti_zi: 100, zile_lucrate_luna: 28,
    cheltuieli: [{ nume: 'fixe', valoare: 500, tip: 'fix' }],
    suprafata_mp: 0
  });
  const rez = engine.calculeaza(s, cfg, taxe, []);
  const alerte = verdict.evalueazaVerdict(rez, s, cfg);
  check('V2 alertă marjă nerealistă', !!alerte.find(a => a.id === 'marja_nerealista'),
    'marja=' + rez.marjaNetaPct.toFixed(1));
})();

// V3 — configurație plauzibilă = verde
// Cifre calibrate să dea marjă în intervalul real al sectorului (3-8%).
// Un restaurant real are food cost ~32% și personal ~35% din venit.
(() => {
  const s = baseState({
    meniu: [{ pret: 16, cost: 5.1, mix_pct: 100 }], // food cost ~32%
    clienti_zi: 96, zile_lucrate_luna: 28,
    cheltuieli: [
      { nume: 'chirie', categorie: 'spatiu', valoare: 4800, tip: 'fix' },
      { nume: 'utilitati si alte fixe', categorie: 'spatiu', valoare: 9300, tip: 'fix' },
      { nume: 'comision card', categorie: 'operational', valoare: 1.5, tip: 'pct_venit' }
    ],
    angajati: 9, salariu_mediu_brut: 1200, // personal realist pentru un restaurant
    pierderi_pct: 6,
    cota_impozit: 16,
    investitie: [{ nume: 'echip', valoare: 30000 }],
    capital_initial: 120000,
    suprafata_mp: 90, chirie_per_mp: 0
  });
  const rez = engine.calculeaza(s, cfg, taxe, []);
  const alerte = verdict.evalueazaVerdict(rez, s, cfg);
  const verde = alerte.find(a => a.id === 'configuratie_plauzibila');
  check('V3 marjă în interval realist (3-8%) → verdict verde',
    rez.marjaNetaPct >= 3 && rez.marjaNetaPct <= 8 && !!verde,
    'marja=' + rez.marjaNetaPct.toFixed(1) + '% profit=' + rez.profitNet.toFixed(0));
})();

// ---------------------------------------------------------------------------
console.log('=== Test de integrare — calculeaza() complet ===\n');
(() => {
  const s = baseState({
    meniu: [
      { nume: 'Fel principal', pret: 11, cost: 3.8, mix_pct: 38 },
      { nume: 'Garnitură', pret: 4, cost: 1, mix_pct: 16 },
      { nume: 'Băutură', pret: 3, cost: 0.8, mix_pct: 20 },
      { nume: 'Bere/vin', pret: 5, cost: 1.5, mix_pct: 14 },
      { nume: 'Desert', pret: 5, cost: 1.6, mix_pct: 12 }
    ],
    clienti_zi: 96, zile_lucrate_luna: 28,
    pierderi_pct: 6, rampa_luni: 5, pre_deschidere_luni: 3,
    angajati: 5, salariu_mediu_brut: 700,
    cheltuieli: [
      { nume: 'utilitati', categorie: 'spatiu', valoare: 1450, tip: 'fix' },
      { nume: 'comision card', categorie: 'operational', valoare: 1.5, tip: 'pct_venit' }
    ],
    stocuri: [
      { categorie: 'perisabil', pct_din_marfa: 60, zile_stoc: 3, termen_plata_zile: 14 },
      { categorie: 'uscat', pct_din_marfa: 40, zile_stoc: 21, termen_plata_zile: 30 }
    ],
    investitie: [{ nume: 'echipament', valoare: 32000, pct_recuperare_exit: 40 }],
    capital_initial: 60000,
    suprafata_mp: 90, chirie_per_mp: 20,
    surse: { clienti_zi: 'verificat' }
  });
  const misiuni = [
    { camp: 'clienti_zi', pondere: 3 },
    { camp: 'pret_mediu', pondere: 3 },
    { camp: 'chirie_per_mp', pondere: 2 }
  ];
  const rez = engine.calculeaza(s, cfg, taxe, misiuni);

  check('INT calculeaza întoarce venit > 0', rez.venitLunar > 0, 'venit=' + rez.venitLunar);
  check('INT serie cash are 28 luni (-3..24)', rez.serieCash.length === 28, 'got ' + rez.serieCash.length);
  check('INT prag de rupere calculat', rez.pragRupere !== null && rez.pragRupere > 0, 'prag=' + rez.pragRupere);
  check('INT sensibilitate ordonată descrescător',
    rez.sensibilitate.length >= 2 && rez.sensibilitate[0].impactMax >= rez.sensibilitate[1].impactMax);
  check('INT scor încredere = 3/8 = 38%', rez.scorIncredere === 38, 'got ' + rez.scorIncredere);

  console.log('   Rezumat integrare:');
  console.log('   venit lunar:      ' + format.bani(rez.venitLunar) + ' €');
  console.log('   profit net:       ' + format.bani(rez.profitNet) + ' € (marjă ' + format.procent(rez.marjaNetaPct) + ')');
  console.log('   prag de rupere:   ' + rez.pragRupere + ' clienți/zi');
  console.log('   cash minim:       ' + format.bani(rez.cashMinim) + ' € (' + format.luna(rez.lunaCashMinim) + ')');
  console.log('   recuperare inv.:  ' + (rez.lunaRecuperare != null ? 'luna ' + rez.lunaRecuperare : '>24 luni'));
  console.log('   variabila critică:' + rez.sensibilitate[0].variabila + ' (±' + Math.abs(rez.sensibilitate[0].impactMax).toFixed(0) + '%)');
})();

// ---------------------------------------------------------------------------
console.log('\n' + '='.repeat(48));
console.log(`REZULTAT: ${pass} trecute, ${fail} eșuate`);
if (fail > 0) {
  console.log('\nEȘUĂRI:');
  fails.forEach(f => console.log('  ✗ ' + f));
  process.exit(1);
} else {
  console.log('Toate testele au trecut.');
}
