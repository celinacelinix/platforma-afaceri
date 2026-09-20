// engine.js — motorul de calcul al platformei de simulare afaceri
//
// PRINCIPIU: funcție pură. calculeaza(state, config, taxe) -> rezultate.
// Fără efecte secundare, fără DOM, fără I/O. Rulează identic în Node și browser.
// Ordinea celor 12 pași urmează motor_calcul_SPEC.md exact.
//
// Toate cifrele sunt calculate cu precizie completă. Rotunjirea se face DOAR
// la afișare (vezi format.js), niciodată în calcul.

'use strict';

// ---------------------------------------------------------------------------
// Utilitare interne
// ---------------------------------------------------------------------------

const SCENARIU_MULT = { pesimist: 0.68, realist: 1.0, optimist: 1.25 };

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

// Alege un multiplicator de scenariu, cu fallback pe realist.
function scenariuMult(scenariu) {
  return SCENARIU_MULT[scenariu] != null ? SCENARIU_MULT[scenariu] : 1.0;
}

// ---------------------------------------------------------------------------
// Pas 1 — Preț și cost mediu ponderat din meniu
// ---------------------------------------------------------------------------
// meniu: [{ nume, pret, cost, mix_pct }]
// Mixul se normalizează la 100 automat (userul nu trebuie să nimerească exact).
// Caz limită: mix_total = 0 -> preț și cost = 0, fără împărțire la zero.

function pasMeniu(meniu) {
  const items = meniu || [];
  const mixTotal = sum(items.map(i => Number(i.mix_pct) || 0));

  if (mixTotal <= 0) {
    return { pretMediu: 0, costMediu: 0, foodCostPct: 0, mixTotal: 0 };
  }

  let pretMediu = 0;
  let costMediu = 0;
  for (const it of items) {
    const w = (Number(it.mix_pct) || 0) / mixTotal;
    pretMediu += (Number(it.pret) || 0) * w;
    costMediu += (Number(it.cost) || 0) * w;
  }

  const foodCostPct = pretMediu > 0 ? (costMediu / pretMediu) * 100 : 0;
  return { pretMediu, costMediu, foodCostPct, mixTotal };
}

// ---------------------------------------------------------------------------
// Pas 2 — Volum lunar (cu rampă și sezonalitate), pentru o lună dată
// ---------------------------------------------------------------------------
// m = 0 la deschidere. rampa(m) = min(1, (m+1)/rampa_luni).
// luna calendaristică pentru sezonalitate: presupunem deschidere în ianuarie
// (index 0) dacă nu e specificat altfel; e o simplificare rezonabilă pentru MVP.

function rampa(m, rampaLuni) {
  if (rampaLuni <= 0) return 1;
  return Math.min(1, (m + 1) / rampaLuni);
}

function clientiZiFinal(state) {
  const mult = scenariuMult(state.scenariu);
  let baza;
  if (state.mod_flux === 'detaliat' && Array.isArray(state.distributie_zile)) {
    baza = sum(state.distributie_zile) / 7;
  } else {
    baza = Number(state.clienti_zi) || 0;
  }
  return baza * mult;
}

function sezonCoef(state, m) {
  const sez = state.sezonalitate_luni;
  if (!Array.isArray(sez) || sez.length !== 12) return 1;
  // luna_calendaristica(m): deschidere presupusă la indexul luna_start (default 0)
  const start = Number(state.luna_start) || 0;
  const idx = ((start + m) % 12 + 12) % 12;
  const c = Number(sez[idx]);
  return c > 0 ? c : 1;
}

function volumLunar(state, cfg, m) {
  const czf = clientiZiFinal(state);
  const zile = Number(state.zile_lucrate_luna) || 0;
  return czf * zile * rampa(m, Number(state.rampa_luni) || 1) * sezonCoef(state, m);
}

// ---------------------------------------------------------------------------
// Pas 6 (parțial) — cheltuieli fixe și variabile, pentru un venit net dat
// ---------------------------------------------------------------------------
// Fiecare linie: { nume, categorie, valoare, tip } cu tip "fix" | "pct_venit".
// Personalul și chiria se calculează separat și NU trebuie dublate ca linii.

function cheltuieliFixe(state) {
  const linii = state.cheltuieli || [];
  return sum(linii.filter(l => l.tip !== 'pct_venit').map(l => Number(l.valoare) || 0));
}

function cheltuieliVariabilePct(state) {
  // suma procentelor (ex. comision card 1.5) — se aplică pe venit net
  const linii = state.cheltuieli || [];
  return sum(linii.filter(l => l.tip === 'pct_venit').map(l => Number(l.valoare) || 0));
}

function costPersonal(state, taxe) {
  const ang = Number(state.angajati) || 0;
  const sal = Number(state.salariu_mediu_brut) || 0;
  const cam = taxe && taxe.contributii_angajator && taxe.contributii_angajator.cam_pct != null
    ? Number(taxe.contributii_angajator.cam_pct) / 100
    : 0;
  return ang * sal * (1 + cam);
}

function chirie(state, cfg) {
  // dacă state.chirie_per_mp e dat, îl folosim; altfel căutăm în config pe tier+zonă.
  const mp = Number(state.suprafata_mp) || 0;
  let perMp = Number(state.chirie_per_mp);
  if (!(perMp > 0) && cfg && cfg.chirie_per_mp_eur) {
    const tier = state.tier || 'tier_3';
    const zona = state.tip_zona || 'centru';
    const tbl = cfg.chirie_per_mp_eur[tier];
    if (tbl && Array.isArray(tbl[zona])) {
      const [lo, hi] = tbl[zona];
      perMp = (Number(lo) + Number(hi)) / 2;
    }
  }
  return mp * (perMp || 0);
}

// Totalul cheltuielilor fixe "reale" (linii fixe + personal + chirie).
function cheltuieliFixeTotale(state, cfg, taxe) {
  return cheltuieliFixe(state) + costPersonal(state, taxe) + chirie(state, cfg);
}

// Pierderea efectivă: dacă stocurile au pierderi per categorie, calculăm media
// ponderată; altfel folosim procentul global din state.pierderi_pct.
// Întoarce o fracție (ex. 0.06 pentru 6%).
function pierderiEfective(state) {
  const stocuri = state.stocuri || [];
  const auPierderiCat = stocuri.some(s => s.pierderi_pct != null && !isNaN(Number(s.pierderi_pct)));

  if (auPierderiCat && stocuri.length > 0) {
    const totalPct = sum(stocuri.map(s => Number(s.pct_din_marfa) || 0));
    if (totalPct > 0) {
      let ponderat = 0;
      for (const s of stocuri) {
        const pondere = (Number(s.pct_din_marfa) || 0) / totalPct;
        ponderat += pondere * (Number(s.pierderi_pct) || 0);
      }
      return ponderat / 100;
    }
  }
  // fallback: procent global
  return (Number(state.pierderi_pct) || 0) / 100;
}

function rezultateLaCapacitate(state, cfg, taxe, meniuCalc) {
  const { pretMediu, costMediu } = meniuCalc;
  const pierderi = pierderiEfective(state);
  const czf = clientiZiFinal(state);
  const zile = Number(state.zile_lucrate_luna) || 0;

  const volum = czf * zile; // rampă = 1, sezon = 1
  let venitBrut = volum * pretMediu + sum((state.venituri_extra || []).map(v => {
    const tot = Number(v.pret_unitar) > 0 ? (Number(v.unitati) || 0) * Number(v.pret_unitar) : (Number(v.unitati) || 0);
    return tot;
  }));
  let consumBrut = volum * costMediu * (1 + pierderi);

  const platitorTva = !!state.platitor_tva;
  const cotaTva = (Number(state.cota_tva) || 0) / 100;
  let venitNet = venitBrut;
  let consumNet = consumBrut;
  let tvaPlata = 0;
  if (platitorTva && cotaTva > 0) {
    venitNet = venitBrut / (1 + cotaTva);
    consumNet = consumBrut / (1 + cotaTva);
    tvaPlata = (venitBrut - venitNet) - (consumBrut - consumNet);
  }

  const fixe = cheltuieliFixeTotale(state, cfg, taxe);
  const varPct = cheltuieliVariabilePct(state) / 100;
  const variabile = venitNet * varPct;

  const profitOperational = venitNet - consumNet - fixe - variabile;

  const cotaImpozit = (Number(state.cota_impozit) || 0) / 100;
  let impozit = 0;
  if (state.regim_impozit === 'micro') {
    // micro: impozit pe cifra de afaceri (venit net), indiferent de profit
    impozit = venitNet * cotaImpozit;
  } else {
    impozit = profitOperational > 0 ? profitOperational * cotaImpozit : 0;
  }
  const profitNet = profitOperational - impozit;
  const marjaNetaPct = venitNet > 0 ? (profitNet / venitNet) * 100 : 0;

  return {
    volum, venitBrut, consumBrut, venitNet, consumNet, tvaPlata,
    fixe, variabile, profitOperational, impozit, profitNet, marjaNetaPct,
    pretMediu, costMediu
  };
}

// ---------------------------------------------------------------------------
// Pas 5 + 8 — stocuri, achiziții și proiecția de cash lună cu lună
// ---------------------------------------------------------------------------

function capitalBlocatStoc(state, consumNetLunar, meniuCalc) {
  // consumNetLunar la capacitate; îl repartizăm pe categorii dacă avem stocuri.
  const stocuri = state.stocuri || [];
  if (stocuri.length === 0) return { blocat: 0, credit: 0, lag: 0 };

  // dacă stocurile au pct_din_marfa, folosim; altfel repartizăm egal.
  const totalPct = sum(stocuri.map(s => Number(s.pct_din_marfa) || 0));
  let blocat = 0;
  let credit = 0;
  let sumTermene = 0;
  for (const s of stocuri) {
    const pct = totalPct > 0 ? (Number(s.pct_din_marfa) || 0) / totalPct : 1 / stocuri.length;
    const consumCat = consumNetLunar * pct;
    const zilnic = consumCat / 30;
    blocat += zilnic * (Number(s.zile_stoc) || 0);
    credit += zilnic * (Number(s.termen_plata_zile) || 0);
    sumTermene += Number(s.termen_plata_zile) || 0;
  }
  const termenMediu = stocuri.length > 0 ? sumTermene / stocuri.length : 0;
  return { blocat, credit, lag: Math.round(termenMediu / 30) };
}

function investitieTotala(state, cfg) {
  const linii = state.investitie || [];
  return sum(linii.map(l => Number(l.valoare) || 0));
}

// Proiecția de cash de la -pre_deschidere la +orizont (default 24).
function proiectieCash(state, cfg, taxe, meniuCalc, cap) {
  const orizont = Number(state.orizont_luni) || 24;
  const pre = Number(state.pre_deschidere_luni) || 0;
  const rampaLuni = Number(state.rampa_luni) || 1;
  const { pretMediu, costMediu } = meniuCalc;
  const pierderi = pierderiEfective(state);
  const czf = clientiZiFinal(state);
  const zile = Number(state.zile_lucrate_luna) || 0;

  const platitorTva = !!state.platitor_tva;
  const cotaTva = (Number(state.cota_tva) || 0) / 100;
  const cotaImpozit = (Number(state.cota_impozit) || 0) / 100;

  const fixe = cheltuieliFixeTotale(state, cfg, taxe);
  const varPct = cheltuieliVariabilePct(state) / 100;
  const invTot = investitieTotala(state, cfg);

  // capital blocat pe baza consumului la capacitate
  const consumCapac = czf * zile * costMediu * (1 + pierderi);
  const consumNetCapac = platitorTva && cotaTva > 0 ? consumCapac / (1 + cotaTva) : consumCapac;
  const stocInfo = capitalBlocatStoc(state, consumNetCapac, meniuCalc);
  const lag = stocInfo.lag;

  const serie = [];
  let cash = Number(cap != null ? cap : state.capital_initial) || 0;
  let minCash = cash;
  let minLuna = -pre;
  let beLuna = null;
  let pbLuna = null;
  let profitCumulat = 0;
  const coadaAchizitii = [];

  for (let m = -pre; m <= orizont; m++) {
    let intrari = 0;
    let iesiri = 0;

    if (m < 0) {
      // pre-deschidere: chirie + o parte din fixe, fără venit
      iesiri = chirie(state, cfg) + (cheltuieliFixe(state)) * 0.4;
    } else {
      if (m === 0) iesiri += invTot;

      const r = rampa(m, rampaLuni);
      const sez = sezonCoef(state, m);
      const volum = czf * zile * r * sez;

      let venitBrut = volum * pretMediu + sum((state.venituri_extra || []).map(v => {
        const tot = Number(v.pret_unitar) > 0 ? (Number(v.unitati) || 0) * Number(v.pret_unitar) : (Number(v.unitati) || 0);
        return tot * r;
      }));
      let consumBrut = volum * costMediu * (1 + pierderi);

      let venitNet = venitBrut;
      let consumNet = consumBrut;
      let tvaPlata = 0;
      if (platitorTva && cotaTva > 0) {
        venitNet = venitBrut / (1 + cotaTva);
        consumNet = consumBrut / (1 + cotaTva);
        tvaPlata = (venitBrut - venitNet) - (consumBrut - consumNet);
      }

      // achiziții = consum net + variație stoc (în faza de rampă)
      const variatieStoc = m < rampaLuni ? stocInfo.blocat * 0.08 : 0;
      const achizitii = consumNet + variatieStoc;
      coadaAchizitii.push(achizitii);

      const plataMarfa = coadaAchizitii.length > lag
        ? coadaAchizitii[coadaAchizitii.length - 1 - lag]
        : 0;

      const variabile = venitNet * varPct;
      const profitOp = venitNet - consumNet - fixe - variabile;

      let impozit = 0;
      if (state.regim_impozit === 'micro') {
        impozit = venitNet * cotaImpozit;
      } else {
        impozit = profitOp > 0 ? profitOp * cotaImpozit : 0;
      }

      intrari = venitBrut;
      iesiri += plataMarfa + fixe + variabile + impozit + tvaPlata;

      if (profitOp > 0 && beLuna === null) beLuna = m;

      const profitNetLuna = profitOp - impozit;
      profitCumulat += profitNetLuna;
      if (profitCumulat >= invTot && pbLuna === null) pbLuna = m;
    }

    cash += intrari - iesiri;
    if (cash < minCash) { minCash = cash; minLuna = m; }
    serie.push({ luna: m, cash, preDeschidere: m < 0 });
  }

  return {
    serie, cashMinim: minCash, lunaCashMinim: minLuna,
    lunaBreakeven: beLuna, lunaRecuperare: pbLuna,
    investitieTotala: invTot,
    capitalBlocatStoc: stocInfo.blocat, creditFurnizor: stocInfo.credit
  };
}

// ---------------------------------------------------------------------------
// Pas 9 — indicatori derivați
// ---------------------------------------------------------------------------

function pragRupere(state, cfg, taxe, meniuCalc) {
  const { pretMediu, costMediu } = meniuCalc;
  const pierderi = pierderiEfective(state);
  const zile = Number(state.zile_lucrate_luna) || 0;
  const fixe = cheltuieliFixeTotale(state, cfg, taxe);
  const marjaContributie = pretMediu - costMediu * (1 + pierderi);
  if (marjaContributie <= 0 || zile <= 0) return null;
  return Math.ceil(fixe / (marjaContributie * zile));
}

function capacitateFizica(state, cfg) {
  const mp = Number(state.suprafata_mp) || 0;
  const mpPerLoc = cfg && cfg.capacitate && Number(cfg.capacitate.mp_per_loc) > 0
    ? Number(cfg.capacitate.mp_per_loc) : null;
  const rotatii = cfg && cfg.capacitate && Number(cfg.capacitate.rotatii_max_zi) > 0
    ? Number(cfg.capacitate.rotatii_max_zi) : null;
  if (!mpPerLoc || !rotatii || mp <= 0) return null;
  const locuri = Math.floor(mp / mpPerLoc);
  return locuri * rotatii;
}

// ---------------------------------------------------------------------------
// Pas 12 — scorul de încredere
// ---------------------------------------------------------------------------

function scorIncredere(state, misiuni) {
  if (!Array.isArray(misiuni) || misiuni.length === 0) return 0;
  const surse = state.surse || {};
  let total = 0;
  let verificat = 0;
  for (const m of misiuni) {
    const w = Number(m.pondere) || 1;
    total += w;
    if (surse[m.camp] === 'verificat') verificat += w;
  }
  return total > 0 ? Math.round((verificat / total) * 100) : 0;
}

// ---------------------------------------------------------------------------
// Pas 10 — sensibilitate (recalculează cu ±10% pe fiecare variabilă cheie)
// ---------------------------------------------------------------------------
// Folosește funcția pură: clonează state, aplică factorul, recalculează profitNet.

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function aplicaFactor(state, variabila, factor) {
  const s = clone(state);
  switch (variabila) {
    case 'pret_mediu':
      (s.meniu || []).forEach(i => { i.pret = (Number(i.pret) || 0) * factor; });
      break;
    case 'clienti_zi':
      s.clienti_zi = (Number(s.clienti_zi) || 0) * factor;
      if (Array.isArray(s.distributie_zile)) {
        s.distributie_zile = s.distributie_zile.map(x => (Number(x) || 0) * factor);
      }
      break;
    case 'cost_mediu':
      (s.meniu || []).forEach(i => { i.cost = (Number(i.cost) || 0) * factor; });
      break;
    case 'cost_personal':
      s.salariu_mediu_brut = (Number(s.salariu_mediu_brut) || 0) * factor;
      break;
    case 'chirie':
      if (Number(s.chirie_per_mp) > 0) s.chirie_per_mp = Number(s.chirie_per_mp) * factor;
      else s.suprafata_mp = (Number(s.suprafata_mp) || 0) * factor; // proxy dacă chiria vine din config
      break;
    case 'pierderi_pct':
      s.pierderi_pct = (Number(s.pierderi_pct) || 0) * factor;
      break;
    default:
      break;
  }
  return s;
}

function sensibilitate(state, cfg, taxe, variabile) {
  const bazaMeniu = pasMeniu(state.meniu);
  const baza = rezultateLaCapacitate(state, cfg, taxe, bazaMeniu).profitNet;
  const vars = variabile && variabile.length ? variabile
    : ['pret_mediu', 'clienti_zi', 'cost_mediu', 'cost_personal', 'chirie', 'pierderi_pct'];

  const rezultate = vars.map(v => {
    const sPlus = aplicaFactor(state, v, 1.1);
    const sMinus = aplicaFactor(state, v, 0.9);
    const pPlus = rezultateLaCapacitate(sPlus, cfg, taxe, pasMeniu(sPlus.meniu)).profitNet;
    const pMinus = rezultateLaCapacitate(sMinus, cfg, taxe, pasMeniu(sMinus.meniu)).profitNet;
    const denom = Math.abs(baza) > 1e-9 ? Math.abs(baza) : 1;
    const impactPlus = ((pPlus - baza) / denom) * 100;
    const impactMinus = ((pMinus - baza) / denom) * 100;
    const impactMax = Math.max(Math.abs(impactPlus), Math.abs(impactMinus));
    let eticheta = 'mic';
    if (impactMax > 40) eticheta = 'critic';
    else if (impactMax > 20) eticheta = 'mare';
    return { variabila: v, impactPlus, impactMinus, impactMax, eticheta };
  });

  rezultate.sort((a, b) => b.impactMax - a.impactMax);
  return rezultate;
}

// ---------------------------------------------------------------------------
// FUNCȚIA PRINCIPALĂ — calculeaza(state, config, taxe, misiuni)
// ---------------------------------------------------------------------------

function calculeaza(state, config, taxe, misiuni) {
  const cfg = config || {};
  const tx = taxe || {};

  const meniuCalc = pasMeniu(state.meniu);
  const cap = rezultateLaCapacitate(state, cfg, tx, meniuCalc);
  const cash = proiectieCash(state, cfg, tx, meniuCalc, state.capital_initial);
  const prag = pragRupere(state, cfg, tx, meniuCalc);
  const plafonFizic = capacitateFizica(state, cfg);
  const czf = clientiZiFinal(state);
  const marjaSiguranta = (prag && czf > 0) ? ((czf - prag) / czf) * 100 : null;

  return {
    meniu: meniuCalc,
    // rezultate la capacitate
    venitLunar: cap.venitNet,
    venitBrut: cap.venitBrut,
    consumLunar: cap.consumNet,
    profitOperational: cap.profitOperational,
    profitNet: cap.profitNet,
    marjaNetaPct: cap.marjaNetaPct,
    tvaPlataLunar: cap.tvaPlata,
    cheltuieliFixe: cap.fixe,
    // cash-flow
    serieCash: cash.serie,
    cashMinim: cash.cashMinim,
    lunaCashMinim: cash.lunaCashMinim,
    lunaBreakeven: cash.lunaBreakeven,
    lunaRecuperare: cash.lunaRecuperare,
    investitieTotala: cash.investitieTotala,
    capitalBlocatStoc: cash.capitalBlocatStoc,
    creditFurnizor: cash.creditFurnizor,
    // indicatori
    pragRupere: prag,
    plafonFizic: plafonFizic,
    clientiZiFinal: czf,
    marjaSigurantaPct: marjaSiguranta,
    // sensibilitate și încredere
    sensibilitate: sensibilitate(state, cfg, tx),
    scorIncredere: scorIncredere(state, misiuni)
  };
}

// export atât pentru Node (CommonJS) cât și pentru browser (ESM/global)
const engine = {
  calculeaza,
  // expus pentru teste unitare pe pași individuali
  _pasMeniu: pasMeniu,
  _rampa: rampa,
  _pragRupere: pragRupere,
  _capacitateFizica: capacitateFizica,
  _proiectieCash: proiectieCash,
  _rezultateLaCapacitate: rezultateLaCapacitate,
  _sensibilitate: sensibilitate,
  _scorIncredere: scorIncredere
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = engine;
}
if (typeof window !== 'undefined') {
  window.BizEngine = engine;
}
