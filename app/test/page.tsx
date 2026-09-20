import engine from "@/engine/src/engine.js";
import verdict from "@/engine/src/verdict.js";
import config from "@/engine/configs/restaurant.test.json";

const { calculeaza } = engine;
const { evalueazaVerdict } = verdict;

export default function TestPage() {
  const state = {
    domeniu: "restaurant",
    tip_zona: "centru",
    tier: "tier_3",
    meniu: [
      { nume: "Fel principal", pret: 40, cost: 15, mix_pct: 60 },
      { nume: "Băutură", pret: 12, cost: 3, mix_pct: 40 }
    ],
    clienti_zi: 80,
    zile_lucrate_luna: 28,
    pierderi_pct: 6,
    rampa_luni: 5,
    pre_deschidere_luni: 3,
    angajati: 6,
    salariu_mediu_brut: 4000,
    cheltuieli: [
      { nume: "chirie", valoare: 8000, tip: "fix" },
      { nume: "utilitati", valoare: 3000, tip: "fix" }
    ],
    investitie: [
      { nume: "echipament", valoare: 120000 }
    ],
    capital_initial: 200000,
    suprafata_mp: 90,
    scenariu: "realist",
    mod_flux: "medie",
    platitor_tva: false,
    cota_impozit: 16,
    regim_impozit: "profit",
    surse: {}
  };

  const taxe = { contributii_angajator: { cam_pct: 2.25 } };

  const rez = calculeaza(state, config, taxe, []);
  const alerte = evalueazaVerdict(rez, state, config);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", backgroundColor: "#fff", color: "#000", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Test Motor Calcul</h1>

      <div style={{ marginBottom: "2rem" }}>
        <p><strong>Venit lunar:</strong> {rez.venitLunar.toFixed(2)} lei</p>
        <p><strong>Profit net:</strong> {rez.profitNet.toFixed(2)} lei</p>
        <p><strong>Marja neta:</strong> {rez.marjaNetaPct.toFixed(2)}%</p>
        <p><strong>Pragul de rupere:</strong> {rez.pragRupere !== null ? `${rez.pragRupere} clienți/zi` : "N/A"}</p>
        <p><strong>Cash minim:</strong> {rez.cashMinim.toFixed(2)} lei (în luna {rez.lunaCashMinim})</p>
        <p><strong>Luna de recuperare:</strong> {rez.lunaRecuperare !== null ? `luna ${rez.lunaRecuperare}` : ">24 luni"}</p>
      </div>

      <h2>Alerte Verdict</h2>
      <ul>
        {alerte.map((al: { id: string; nivel: string; mesaj: string }, idx: number) => (
          <li key={idx} style={{ marginTop: "0.5rem" }}>
            <strong>[{al.id}] ({al.nivel}):</strong> {al.mesaj}
          </li>
        ))}
      </ul>
    </main>
  );
}
