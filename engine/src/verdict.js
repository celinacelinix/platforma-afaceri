// verdict.js — regulile de verdict. Cod determinist, NU apel AI.
// Aceeași configurație -> același verdict, mereu. Fiecare regulă e explicabilă.
//
// Primește: rezultatele din engine.calculeaza + state + config.
// Întoarce: listă de alerte { id, nivel, blocheazaGenerare, mesaj }.

'use strict';

function f(n) {
  return Math.round(Number(n) || 0).toLocaleString('ro-RO');
}

function evalueazaVerdict(rez, state, config) {
  const cfg = config || {};
  const alerte = [];

  const venit = rez.venitLunar || 0;
  const marja = rez.marjaNetaPct || 0;
  const marjaRef = (cfg.marja_neta_referinta || {});
  const pragNerealist = Number(marjaRef.prag_alerta_nerealist) || 15;
  const [minRealist, maxRealist] = Array.isArray(marjaRef.interval_realist)
    ? marjaRef.interval_realist : [3, 8];

  // capacitate fizică — blocant
  if (rez.plafonFizic != null && rez.clientiZiFinal > rez.plafonFizic) {
    alerte.push({
      id: 'capacitate_fizica', nivel: 'danger', blocheazaGenerare: true,
      mesaj: `Fizic imposibil: ${Math.round(rez.clientiZiFinal)} clienți/zi peste plafonul de ${rez.plafonFizic} pentru suprafața dată. Mărește spațiul sau scade estimarea.`
    });
  }

  // marjă nerealistă
  if (marja > pragNerealist) {
    alerte.push({
      id: 'marja_nerealista', nivel: 'danger', blocheazaGenerare: false,
      mesaj: `Marjă de ${marja.toFixed(1)}% — peste normalul sectorului (${minRealist}-${maxRealist}%). Verifică ce cheltuieli lipsesc.`
    });
  }

  // pierdere lunară
  if (rez.profitNet < 0) {
    alerte.push({
      id: 'pierdere_lunara', nivel: 'danger', blocheazaGenerare: false,
      mesaj: `Pierdere lunară de ${f(Math.abs(rez.profitNet))} € la capacitate maximă.`
    });
  }

  // fără profit posibil
  if (rez.pragRupere === null) {
    alerte.push({
      id: 'fara_profit_posibil', nivel: 'danger', blocheazaGenerare: false,
      mesaj: 'Configurația nu produce profit la nicio cantitate — costul pe unitate depășește prețul.'
    });
  }

  // cash negativ
  if (rez.cashMinim < 0) {
    alerte.push({
      id: 'cash_negativ', nivel: 'danger', blocheazaGenerare: false,
      mesaj: `Rămâi fără bani în luna ${rez.lunaCashMinim} (${f(rez.cashMinim)} €). Capitalul nu acoperă perioada de start.`
    });
  } else if (rez.profitNet > 0 && rez.cashMinim < rez.profitNet * 2) {
    alerte.push({
      id: 'cash_fragil', nivel: 'warning', blocheazaGenerare: false,
      mesaj: `Cash minim foarte redus (${f(rez.cashMinim)} €). Orice întârziere de încasare te blochează.`
    });
  }

  // investiție peste capital
  const capital = Number(state.capital_initial) || 0;
  if (rez.investitieTotala > capital) {
    alerte.push({
      id: 'investitie_peste_capital', nivel: 'danger', blocheazaGenerare: false,
      mesaj: `Investiția necesară (${f(rez.investitieTotala)} €) depășește capitalul disponibil cu ${f(rez.investitieTotala - capital)} €.`
    });
  }

  // food cost mare
  const fcPct = rez.venitLunar > 0 ? (rez.consumLunar / rez.venitLunar) * 100 : 0;
  if (fcPct > 40) {
    alerte.push({
      id: 'food_cost_mare', nivel: 'warning', blocheazaGenerare: false,
      mesaj: `Cost marfă ${fcPct.toFixed(0)}% din venit — peste pragul sănătos (28-35%).`
    });
  }

  // breakeven lung / fără recuperare
  if (rez.lunaRecuperare === null || rez.lunaRecuperare > 24) {
    alerte.push({
      id: 'breakeven_lung', nivel: 'danger', blocheazaGenerare: false,
      mesaj: 'Investiția nu se recuperează în 24 de luni.'
    });
  }

  // zonă saturată
  const pop = Number(state.populatie) || 0;
  const conc = Number(state.nr_concurenti) || 0;
  if (pop > 0 && conc > 0 && (pop / conc) < 2500) {
    alerte.push({
      id: 'zona_saturata', nivel: 'warning', blocheazaGenerare: false,
      mesaj: `Doar ${f(pop / conc)} locuitori per concurent — zonă saturată.`
    });
  }

  // variație pe zile
  if (Array.isArray(state.distributie_zile) && state.mod_flux === 'detaliat') {
    const vals = state.distributie_zile.map(Number).filter(x => x > 0);
    if (vals.length) {
      const mx = Math.max(...vals), mn = Math.min(...vals);
      if (mn > 0 && mx / mn > 2.5) {
        alerte.push({
          id: 'variatie_zile', nivel: 'warning', blocheazaGenerare: false,
          mesaj: `Variație de ${(mx / mn).toFixed(1)}× între zile: personalul dimensionat pentru vârf stă subutilizat în zilele slabe.`
        });
      }
    }
  }

  // pozitiv: configurație plauzibilă
  if (marja > minRealist && marja <= maxRealist && rez.cashMinim >= 0 && rez.profitNet > 0) {
    alerte.push({
      id: 'configuratie_plauzibila', nivel: 'success', blocheazaGenerare: false,
      mesaj: `Marjă de ${marja.toFixed(1)}% și cash pozitiv — configurație plauzibilă pentru sector.`
    });
  }

  // scor de încredere scăzut
  if (rez.scorIncredere < 25) {
    alerte.push({
      id: 'date_neverificate', nivel: 'info', blocheazaGenerare: false,
      mesaj: 'Cifrele sunt estimări de piață. Îndeplinește misiunile critice ca verdictul să devină fiabil.'
    });
  }

  return alerte;
}

// eticheta scorului de încredere
function etichetaIncredere(scor) {
  if (scor >= 80) return { eticheta: 'Evaluare fundamentată', descriere: 'Majoritatea cifrelor vin din realitatea ta.' };
  if (scor >= 50) return { eticheta: 'Evaluare parțial validată', descriere: 'Variabilele cu impact mare sunt confirmate.' };
  if (scor >= 25) return { eticheta: 'Estimare îmbunătățită', descriere: 'Mai verifică variabilele critice.' };
  return { eticheta: 'Estimare orientativă', descriere: 'Cifrele vin din medii de piață, nu din realitatea ta.' };
}

const verdict = { evalueazaVerdict, etichetaIncredere };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = verdict;
}
if (typeof window !== 'undefined') {
  window.BizVerdict = verdict;
}
