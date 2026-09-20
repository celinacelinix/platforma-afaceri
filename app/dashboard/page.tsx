'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, Suspense, useEffect } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import engine from '@/engine/src/engine.js';
import verdict from '@/engine/src/verdict.js';
import config from '@/engine/configs/restaurant.test.json';
import Capitol, { FieldDef } from '../components/Capitol';
import {
  asambleazaCapitol1, asambleazaCapitol2, asambleazaCapitol3,
  asambleazaCapitol4, asambleazaCapitol5, asambleazaCapitol8, asambleazaCapitol10
} from '../../lib/asambleazaPlan';

const { calculeaza } = engine;
const { evalueazaVerdict } = verdict;

const cap2Fields: FieldDef[] = [
  { id: 'concept', label: 'Descrie conceptul în 1-2 propoziții', type: 'textarea' },
  { id: 'clienti', label: 'Ce tip de clienți vizezi?', type: 'text' },
  { id: 'program', label: 'Care e programul de funcționare?', type: 'text' },
  { id: 'diferentiator', label: 'Ce te diferențiază de concurență?', type: 'textarea', aiPrompt: 'Idei diferențiatori' }
];

const cap3Fields: FieldDef[] = [
  { id: 'trafic', label: 'Descrie zona și traficul pietonal', type: 'textarea' },
  { id: 'clienti', label: 'Cine sunt clienții tăi tipici?', type: 'text' },
  { id: 'teren', label: 'Ce ai observat la concurență pe teren?', type: 'textarea' }
];

const cap4Fields: FieldDef[] = [
  { id: 'concurenti', label: 'Listează principalii concurenți', type: 'textarea' },
  { id: 'puncteSlabe', label: 'Care sunt punctele lor slabe?', type: 'textarea', aiPrompt: 'Sugerează puncte slabe tipice' },
  { id: 'diferentiere', label: 'Cum te diferențiezi față de fiecare?', type: 'textarea' }
];

const cap5Fields: FieldDef[] = [
  { id: 'zi', label: 'Descrie o zi tipică de funcționare', type: 'textarea' },
  { id: 'ture', label: 'Cum organizezi turele de personal?', type: 'text' },
  { id: 'furnizori', label: 'Cine sunt furnizori principali?', type: 'text' },
  { id: 'riscuri', label: 'Care sunt riscurile operaționale principale?', type: 'textarea' }
];

const cap8Fields: FieldDef[] = [
  { id: 'canale', label: 'Ce canale de marketing vei folosi?', type: 'checkboxes', options: ['Social media', 'Google Ads', 'Flyere', 'Word of mouth', 'Parteneriate', 'Altele'] },
  { id: 'buget', label: 'Care e bugetul lunar de marketing? (lei)', type: 'text' },
  { id: 'zile30', label: 'Ce vei face în primele 30 de zile de la deschidere?', type: 'textarea', aiPrompt: 'Idei pentru primele 30 zile' }
];

const cap10Fields: FieldDef[] = [
  { id: 'pasi', label: 'Care sunt primii 5 pași înainte de deschidere?', type: 'list', aiPrompt: 'Pași tipici pentru tipul meu de afacere' },
  { id: 'data_tinta', label: 'Care e data țintă de deschidere?', type: 'text' }
];

const TAXE = { contributii_angajator: { cam_pct: 2.25 } };
const ACCENT = '#0f766e';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MenuItem      = { id: number; nume: string; pret: number; cost: number; mix_pct: number };
type CashPoint     = { luna: number; cash: number; preDeschidere: boolean };
type TipCheltuiala = 'fix' | 'pct_venit';
type CheltuialaItem = {
  id: number; nume: string; categorie: string; valoare: number; tip: TipCheltuiala;
};
type StocItem = {
  id: number; categorie: string; pct_din_marfa: number;
  zile_stoc: number; pierderi_pct: number; termen_plata_zile: number;
};

type ChapterStatus = 'green' | 'yellow' | 'gray';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CAT_LABELS: Record<string, string> = {
  cost_marfa:   'Cost marfă',
  personal:     'Personal',
  spatiu:       'Spațiu',
  operational:  'Operațional',
  marketing:    'Marketing',
  financiar:    'Financiar',
  neprevazute:  'Neprevăzute',
};
const CAT_ORDER = Object.keys(CAT_LABELS);

let nextMenuId        = 3;
let nextCheltuialaId  = 10;
let nextStocId        = 10;

const DEFAULT_MENU: MenuItem[] = [
  { id: 1, nume: 'Fel principal', pret: 40, cost: 15, mix_pct: 60 },
  { id: 2, nume: 'Băutură',       pret: 12, cost: 3,  mix_pct: 40 },
];

const DEFAULT_CHELTUIELI: CheltuialaItem[] = [
  { id: 1, nume: 'Chirie',        categorie: 'spatiu',      valoare: 8100, tip: 'fix' },
  { id: 2, nume: 'Utilități',     categorie: 'spatiu',      valoare: 3000, tip: 'fix' },
  { id: 4, nume: 'Comision card', categorie: 'operational', valoare: 1.5,  tip: 'pct_venit' },
  { id: 5, nume: 'Contabilitate', categorie: 'financiar',   valoare: 800,  tip: 'fix' },
  { id: 6, nume: 'Marketing',     categorie: 'marketing',   valoare: 1200, tip: 'fix' },
];

const DEFAULT_STOCURI: StocItem[] = [
  { id: 1, categorie: 'Perisabil',       pct_din_marfa: 60, zile_stoc: 3,  pierderi_pct: 8, termen_plata_zile: 7  },
  { id: 2, categorie: 'Uscat / băuturi', pct_din_marfa: 40, zile_stoc: 21, pierderi_pct: 2, termen_plata_zile: 30 },
];

const CHAPTERS: { id: number; title: string; defaultStatus: ChapterStatus }[] = [
  { id: 1,  title: 'Rezumat executiv',      defaultStatus: 'gray'   },
  { id: 2,  title: 'Descrierea afacerii',   defaultStatus: 'gray'   },
  { id: 3,  title: 'Piața și locația',      defaultStatus: 'gray'   },
  { id: 4,  title: 'Analiza concurenței',   defaultStatus: 'gray'   },
  { id: 5,  title: 'Plan operațional',      defaultStatus: 'gray'   },
  { id: 6,  title: 'Autorizații',           defaultStatus: 'gray'   },
  { id: 7,  title: 'Plan financiar',        defaultStatus: 'green'  },
  { id: 8,  title: 'Marketing',             defaultStatus: 'gray'   },
  { id: 9,  title: 'Risc și exit',          defaultStatus: 'green'  },
  { id: 10, title: 'Plan de acțiune',       defaultStatus: 'gray'   },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number) {
  return Math.round(n).toLocaleString('ro-RO');
}

function buildState(
  buget: number, suprafata: number, meniu: MenuItem[], cheltuieli: CheltuialaItem[],
  stocuri: StocItem[], clientiZi: number, pierderiPct: number, rampaMuni: number,
  preDeschidereMuni: number, angajati: number, salariuMediu: number,
  scenariu: 'pesimist' | 'realist' | 'optimist' = 'realist'
) {
  return {
    domeniu: 'restaurant', tip_zona: 'centru', tier: 'tier_3',
    meniu: meniu.map(({ nume, pret, cost, mix_pct }) => ({ nume, pret, cost, mix_pct })),
    clienti_zi: clientiZi, zile_lucrate_luna: 28, pierderi_pct: pierderiPct,
    rampa_luni: rampaMuni, pre_deschidere_luni: preDeschidereMuni,
    angajati, salariu_mediu_brut: salariuMediu,
    cheltuieli: cheltuieli.map(({ nume, categorie, valoare, tip }) => ({ nume, categorie, valoare, tip })),
    stocuri: stocuri.map(({ categorie, pct_din_marfa, zile_stoc, pierderi_pct, termen_plata_zile }) =>
      ({ categorie, pct_din_marfa, zile_stoc, pierderi_pct, termen_plata_zile })),
    investitie: [{ nume: 'echipament', valoare: buget * 0.7 }],
    capital_initial: buget, suprafata_mp: suprafata || 90, chirie_per_mp: 0,
    scenariu, mod_flux: 'medie', platitor_tva: false, cota_tva: 0,
    cota_impozit: 16, regim_impozit: 'profit', venituri_extra: [], surse: {},
  };
}

// ---------------------------------------------------------------------------
// StatusDot
// ---------------------------------------------------------------------------

function StatusDot({ status }: { status: ChapterStatus }) {
  const colors: Record<ChapterStatus, string> = {
    green:  '#22c55e',
    yellow: '#f59e0b',
    gray:   '#d1d5db',
  };
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      backgroundColor: colors[status], flexShrink: 0,
    }} />
  );
}

// ---------------------------------------------------------------------------
// KPI Bar (fixed top)
// ---------------------------------------------------------------------------

function KpiBar({
  venitLunar, profitNet, pragRupere, cashMinim,
}: {
  venitLunar: number; profitNet: number; pragRupere: number | null; cashMinim: number;
}) {
  return (
    <div style={lay.kpiBar}>
      <div style={lay.kpiInner} className="kpi-inner">
        <KpiCell label="Venit lunar"   value={`${fmt(venitLunar)} lei`}  />
        <KpiCell label="Profit net"    value={`${fmt(profitNet)} lei`}   accent={profitNet > 0} />
        <KpiCell label="Prag rupere"   value={pragRupere !== null ? `${pragRupere} cl/zi` : 'imposibil'} />
        <KpiCell label="Cash minim"    value={`${fmt(cashMinim)} lei`}   />
      </div>
    </div>
  );
}

function KpiCell({ label, value, accent }: { label: string;
  type?: 'text' | 'textarea' | 'number'; value: string; accent?: boolean }) {
  return (
    <div style={lay.kpiCell}>
      <span style={lay.kpiLabel}>{label}</span>
      <span style={{ ...lay.kpiValue, color: accent ? ACCENT : '#111' }}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar({
  activeChapter, statuses, onSelect,
}: {
  activeChapter: number;
  statuses: Record<number, ChapterStatus>;
  onSelect: (id: number) => void;
}) {
  const legendItems: { status: ChapterStatus; label: string }[] = [
    { status: 'green',  label: 'Date ok' },
    { status: 'yellow', label: 'Estimări' },
    { status: 'gray',   label: 'Gol' },
  ];

  return (
    <nav style={lay.sidebar}>
      <p style={lay.sidebarBrand}>Capitol</p>
      <ul style={lay.sidebarList}>
        {CHAPTERS.map(ch => {
          const isActive = ch.id === activeChapter;
          return (
            <li key={ch.id}>
              <button
                onClick={() => onSelect(ch.id)}
                style={{
                  ...lay.sidebarItem,
                  ...(isActive ? lay.sidebarItemActive : {}),
                }}
              >
                <StatusDot status={statuses[ch.id]} />
                <span style={lay.sidebarNum}>{ch.id}.</span>
                <span style={lay.sidebarTitle}>{ch.title}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Legend */}
      <div style={lay.legend}>
        {legendItems.map(item => (
          <div key={item.status} style={lay.legendRow}>
            <StatusDot status={item.status} />
            <span style={lay.legendLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Mobile chapter strip (horizontal scroll, no hamburger)
// ---------------------------------------------------------------------------

function MobileChapterStrip({
  activeChapter, statuses, onSelect,
}: {
  activeChapter: number;
  statuses: Record<number, ChapterStatus>;
  onSelect: (id: number) => void;
}) {
  return (
    <div style={lay.mobileStrip} className="mobile-strip">
      {CHAPTERS.map(ch => {
        const isActive = ch.id === activeChapter;
        return (
          <button
            key={ch.id}
            onClick={() => onSelect(ch.id)}
            style={{
              ...lay.mobileChip,
              ...(isActive ? lay.mobileChipActive : {}),
            }}
          >
            <StatusDot status={statuses[ch.id]} />
            <span style={{ marginLeft: 5 }}>{ch.id}. {ch.title}</span>
          </button>
        );
      })}
    </div>
  );
}

function AIGenerator({ chapterId, chapterTitle, state, rez }: { chapterId: number; chapterTitle: string; state: any; rez: any; }) {
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiActions, setAiActions] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ai_actions_remaining");
    if (saved !== null) {
      setAiActions(parseInt(saved, 10));
    } else {
      setAiActions(10);
      localStorage.setItem("ai_actions_remaining", "10");
    }
  }, []);

  const handleGenerate = async () => {
    if (aiActions === null || aiActions <= 0) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/genereaza-capitol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capitol_nr: chapterId, state, rez })
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedText(data.text);
        const newActions = aiActions - 1;
        setAiActions(newActions);
        localStorage.setItem("ai_actions_remaining", newActions.toString());
      } else {
        const err = await response.json();
        alert(err.error || "A apărut o eroare la generare.");
      }
    } catch (error) {
      alert("A apărut o eroare de rețea.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ ...ph.wrap, padding: '24px', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={ph.title}>{chapterId}. {chapterTitle}</h2>
        <p style={ph.sub}>Generare AI</p>
      </div>
      
      {!generatedText ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={ph.desc}>Acest capitol poate fi generat cu ajutorul AI, pe baza datelor din simulare.</p>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || (aiActions !== null && aiActions <= 0)}
              style={{
                backgroundColor: ACCENT, color: 'white', border: 'none', borderRadius: 8,
                padding: '12px 24px', fontSize: '1rem', fontWeight: 600, cursor: (isGenerating || (aiActions !== null && aiActions <= 0)) ? 'not-allowed' : 'pointer',
                opacity: (isGenerating || (aiActions !== null && aiActions <= 0)) ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              {isGenerating ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Se generează...
                </>
              ) : (aiActions !== null && aiActions <= 0) ? (
                "Acțiuni epuizate"
              ) : (
                "✨ Generează cu AI"
              )}
            </button>
            {aiActions !== null && (
              <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                {aiActions} acțiuni AI rămase
              </span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
          <textarea 
            value={generatedText}
            onChange={(e) => setGeneratedText(e.target.value)}
            style={{
              flex: 1, minHeight: 300, padding: 16, borderRadius: 8, border: '1px solid #e5e7eb',
              fontSize: '0.9rem', lineHeight: 1.6, color: '#374151', fontFamily: 'inherit',
              resize: 'vertical', width: '100%', boxSizing: 'border-box'
            }}
          />
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 16, alignItems: 'center' }}>
            {aiActions !== null && (
              <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                {aiActions} acțiuni AI rămase
              </span>
            )}
            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || (aiActions !== null && aiActions <= 0)}
              style={{
                backgroundColor: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8,
                padding: '8px 16px', fontSize: '0.875rem', fontWeight: 500, cursor: (isGenerating || (aiActions !== null && aiActions <= 0)) ? 'not-allowed' : 'pointer',
                opacity: (isGenerating || (aiActions !== null && aiActions <= 0)) ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              {isGenerating ? "Se generează..." : "Regenerează"}
            </button>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Placeholder chapter (chapters 1–6, 8–10)
// ---------------------------------------------------------------------------

function ChapterPlaceholder({
  chapter, state, rez
}: {
  chapter: typeof CHAPTERS[number];
  state?: any;
  rez?: any;
}) {
  return <AIGenerator chapterId={chapter.id} chapterTitle={chapter.title} state={state} rez={rez} />;
}

// ---------------------------------------------------------------------------
// MenuTable
// ---------------------------------------------------------------------------

function MenuTable({ meniu, onChange }: { meniu: MenuItem[]; onChange: (m: MenuItem[]) => void }) {
  const mixTotal = meniu.reduce((s, r) => s + (Number(r.mix_pct) || 0), 0);
  function updateRow(id: number, field: keyof MenuItem, raw: string) {
    onChange(meniu.map(r =>
      r.id === id ? { ...r, [field]: field === 'nume' ? raw : raw === '' ? 0 : Number(raw) } : r,
    ));
  }
  function deleteRow(id: number) { onChange(meniu.filter(r => r.id !== id)); }
  function addRow() {
    onChange([...meniu, { id: nextMenuId++, nume: 'Produs nou', pret: 0, cost: 0, mix_pct: 0 }]);
  }
  return (
    <div>
      <div style={t.tableWrap}>
        <table style={t.table}>
          <thead>
            <tr>
              <th style={t.thLeft}>Produs</th>
              <th style={t.thRight}>Preț (lei)</th>
              <th style={t.thRight}>Cost (lei)</th>
              <th style={t.thRight}>Mix %</th>
              <th style={t.thRight}>Marjă</th>
              <th style={t.thDel} />
            </tr>
          </thead>
          <tbody>
            {meniu.map(row => {
              const marja = row.pret > 0
                ? (((Number(row.pret) - Number(row.cost)) / Number(row.pret)) * 100).toFixed(1) + '%'
                : '—';
              return (
                <tr key={row.id} style={t.tr}>
                  <td style={t.tdLeft}>
                    <input value={row.nume} onChange={e => updateRow(row.id, 'nume', e.target.value)} style={t.inputText} />
                  </td>
                  <td style={t.tdRight}>
                    <input type="number" value={row.pret || ''} onChange={e => updateRow(row.id, 'pret', e.target.value)} style={t.inputNum} min={0} placeholder="0" />
                  </td>
                  <td style={t.tdRight}>
                    <input type="number" value={row.cost || ''} onChange={e => updateRow(row.id, 'cost', e.target.value)} style={t.inputNum} min={0} placeholder="0" />
                  </td>
                  <td style={t.tdRight}>
                    <input type="number" value={row.mix_pct || ''} onChange={e => updateRow(row.id, 'mix_pct', e.target.value)} style={t.inputNum} min={0} max={100} placeholder="0" />
                  </td>
                  <td style={{ ...t.tdRight, color: '#6b7280', fontSize: '0.8125rem' }}>{marja}</td>
                  <td style={t.tdDel}>
                    <button onClick={() => deleteRow(row.id)} style={t.delBtn} title="Șterge">×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {meniu.length > 0 && Math.abs(mixTotal - 100) > 0.5 && (
        <p style={t.mixWarn}>Mixul însumează {mixTotal.toFixed(0)}% — se normalizează automat.</p>
      )}
      <button onClick={addRow} className="btn-accent-ghost" style={t.addBtn}>+ Adaugă produs</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CheltuieliTable
// ---------------------------------------------------------------------------

function CheltuieliTable({
  cheltuieli, venitLunar, onChange,
}: {
  cheltuieli: CheltuialaItem[]; venitLunar: number; onChange: (c: CheltuialaItem[]) => void;
}) {
  function updateRow(id: number, field: keyof CheltuialaItem, val: string) {
    onChange(cheltuieli.map(r => {
      if (r.id !== id) return r;
      if (field === 'tip') return { ...r, tip: val as TipCheltuiala };
      if (field === 'categorie') return { ...r, categorie: val };
      if (field === 'nume') return { ...r, nume: val };
      return { ...r, [field]: val === '' ? 0 : Number(val) };
    }));
  }
  function deleteRow(id: number) { onChange(cheltuieli.filter(r => r.id !== id)); }
  function addRow() {
    onChange([...cheltuieli, { id: nextCheltuialaId++, nume: 'Cheltuială nouă', categorie: 'operational', valoare: 0, tip: 'fix' }]);
  }
  const groups = CAT_ORDER
    .map(cat => ({ cat, rows: cheltuieli.filter(r => r.categorie === cat) }))
    .filter(g => g.rows.length > 0);
  const uncategorised = cheltuieli.filter(r => !CAT_ORDER.includes(r.categorie));
  if (uncategorised.length > 0) groups.push({ cat: 'other', rows: uncategorised });
  function subtotalLei(rows: CheltuialaItem[]) {
    return rows.reduce((s, r) => {
      const v = Number(r.valoare) || 0;
      return s + (r.tip === 'pct_venit' ? (venitLunar * v) / 100 : v);
    }, 0);
  }
  const totalGeneral = cheltuieli.reduce((s, r) => {
    const v = Number(r.valoare) || 0;
    return s + (r.tip === 'pct_venit' ? (venitLunar * v) / 100 : v);
  }, 0);
  return (
    <div>
      <div style={cc.tableWrap}>
        <table style={cc.table}>
          <thead>
            <tr>
              <th style={cc.thCat} />
              <th style={cc.thLeft}>Nume</th>
              <th style={cc.thRight}>Valoare</th>
              <th style={{ ...cc.thRight, minWidth: 110 }}>Tip</th>
              <th style={cc.thRight}>Echivalent / lună</th>
              <th style={cc.thDel} />
            </tr>
          </thead>
          <tbody>
            {groups.map(({ cat, rows }) => {
              const sub = subtotalLei(rows);
              const subPct = venitLunar > 0 ? (sub / venitLunar) * 100 : 0;
              return [
                <tr key={`hdr-${cat}`} style={cc.trCatHeader}>
                  <td colSpan={6} style={cc.catHeaderCell}>{CAT_LABELS[cat] ?? cat}</td>
                </tr>,
                ...rows.map(row => (
                  <tr key={row.id} style={cc.tr}>
                    <td style={cc.tdCat} />
                    <td style={cc.tdLeft}>
                      <input value={row.nume} onChange={e => updateRow(row.id, 'nume', e.target.value)} style={cc.inputText} />
                    </td>
                    <td style={cc.tdRight}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                        <input type="number" value={row.valoare || ''} onChange={e => updateRow(row.id, 'valoare', e.target.value)} style={cc.inputNum} min={0} placeholder="0" />
                        <span style={cc.unit}>{row.tip === 'pct_venit' ? '%' : 'lei'}</span>
                      </div>
                    </td>
                    <td style={cc.tdRight}>
                      <select value={row.tip} onChange={e => updateRow(row.id, 'tip', e.target.value)} style={cc.select}>
                        <option value="fix">fix</option>
                        <option value="pct_venit">% din venit</option>
                      </select>
                    </td>
                    <td style={{ ...cc.tdRight, color: '#6b7280', fontSize: '0.8125rem' }}>
                      {row.tip === 'pct_venit'
                        ? `≈ ${fmt((venitLunar * (Number(row.valoare) || 0)) / 100)} lei`
                        : `${fmt(Number(row.valoare) || 0)} lei`}
                    </td>
                    <td style={cc.tdDel}>
                      <button onClick={() => deleteRow(row.id)} style={cc.delBtn} title="Șterge">×</button>
                    </td>
                  </tr>
                )),
                <tr key={`sub-${cat}`} style={cc.trSubtotal}>
                  <td style={cc.tdCat} />
                  <td style={{ ...cc.tdSubtotal, color: '#6b7280', fontSize: '0.75rem', fontStyle: 'italic' }}>
                    Subtotal {CAT_LABELS[cat] ?? cat}
                  </td>
                  <td colSpan={2} style={{ ...cc.tdSubtotal, textAlign: 'right', fontWeight: 600 }}>
                    {fmt(sub)} lei
                  </td>
                  <td style={{ ...cc.tdSubtotal, textAlign: 'right', color: '#6b7280', fontSize: '0.8125rem' }}>
                    {subPct.toFixed(1)}% din venit
                  </td>
                  <td style={cc.tdDel} />
                </tr>,
              ];
            })}
            <tr style={cc.trTotal}>
              <td style={cc.tdCat} />
              <td style={cc.tdTotal}>Total cheltuieli</td>
              <td colSpan={2} style={{ ...cc.tdTotal, textAlign: 'right' as const }}>
                {fmt(totalGeneral)} lei
              </td>
              <td style={{ ...cc.tdTotal, textAlign: 'right' as const, color: '#6b7280' }}>
                {venitLunar > 0 ? ((totalGeneral / venitLunar) * 100).toFixed(1) : '—'}% din venit
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
      <button onClick={addRow} className="btn-accent-ghost" style={cc.addBtn}>+ Adaugă cheltuială</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slider
// ---------------------------------------------------------------------------

function Slider({ id, label, min, max, step, value, unit, onChange }: {
  id: string; label: string;
  type?: 'text' | 'textarea' | 'number'; min: number; max: number;
  step: number; value: number; unit: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={sl.sliderBlock}>
      <div style={sl.sliderHeader}>
        <span style={sl.sliderLabel}>{label}</span>
        <span style={sl.sliderValue}>{value.toLocaleString('ro-RO')} {unit}</span>
      </div>
      <div style={sl.trackWrap}>
        <div style={sl.trackRail} />
        <div style={{ ...sl.trackFill, width: `${pct}%` }} />
        <input id={id} type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="custom-slider" style={sl.rangeInput} />
      </div>
      <div style={sl.trackEnds}>
        <span>{min.toLocaleString('ro-RO')}</span>
        <span>{max.toLocaleString('ro-RO')}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

function Card({ label, value, accent }: { label: string;
  type?: 'text' | 'textarea' | 'number'; value: string; accent?: boolean }) {
  return (
    <div style={{ ...sl.card, ...(accent ? sl.cardAccent : {}) }}>
      <p style={sl.cardLabel}>{label}</p>
      <p style={{ ...sl.cardValue, ...(accent ? sl.cardValueAccent : {}) }}>{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------

const NIVEL_STYLE: Record<string, React.CSSProperties> = {
  danger:  { backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' },
  warning: { backgroundColor: '#fffbeb', borderColor: '#fde68a', color: '#92400e' },
  success: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' },
  info:    { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' },
};

function Alert({ id, nivel, mesaj }: { id: string; nivel: string; mesaj: string }) {
  const st = NIVEL_STYLE[nivel] || NIVEL_STYLE.info;
  return (
    <div style={{ ...sl.alert, ...st }}>
      <span style={sl.alertDot} />
      <span>{mesaj}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CashFlowChart
// ---------------------------------------------------------------------------

function barColor(entry: CashPoint): string {
  if (entry.preDeschidere) return '#B4B2A9';
  if (entry.cash < 0)      return '#E24B4A';
  return ACCENT;
}

function fmtY(v: number) {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${(v / 1_000).toFixed(0)}k`;
  return String(Math.round(v));
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: CashPoint }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '8px 12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb', fontSize: '0.8125rem' }}>
      <p style={{ fontWeight: 600, marginBottom: 2 }}>
        {d.luna < 0 ? `Pre-deschidere (luna ${d.luna})` : `Luna ${d.luna}`}
      </p>
      <p style={{ color: d.cash < 0 ? '#E24B4A' : ACCENT }}>
        {Math.round(d.cash).toLocaleString('ro-RO')} lei
      </p>
    </div>
  );
}

function CashFlowChart({ serie }: { serie: CashPoint[] }) {
  return (
    <div style={sl.chartPanel}>
      <p style={sl.chartTitle}>Bani în cont, lună cu lună</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={serie} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="15%">
          <XAxis dataKey="luna" ticks={[-3, 0, 6, 12, 18, 24]}
            tickFormatter={v => v === 0 ? 'deschidere' : `L${v}`}
            tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtY} tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false} tickLine={false} width={48} />
          <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={1} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="cash" radius={[3, 3, 0, 0]}>
            {serie.map((entry, i) => <Cell key={i} fill={barColor(entry)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={sl.chartLegend}>Roșu = cash negativ.&nbsp; Gri = perioada înainte de deschidere.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SensitivitateSection
// ---------------------------------------------------------------------------

const SENS_VAR_LABELS: Record<string, string> = {
  pret_mediu:    'Preț mediu vânzare',
  clienti_zi:    'Număr clienți/zi',
  cost_mediu:    'Cost mediu marfă',
  cost_personal: 'Cost personal',
  chirie:        'Chirie',
  pierderi_pct:  'Pierderi / perisabilitate',
};

type SensRow = {
  variabila: string;
  impactPlus: number;
  impactMinus: number;
  impactMax: number;
  eticheta: 'critic' | 'mare' | 'mic';
};

const ETICHETA_CFG: Record<string, { label: string;
  type?: 'text' | 'textarea' | 'number'; bg: string; color: string; barColor: string }> = {
  critic: { label: 'CRITIC',  bg: '#fef2f2', color: '#b91c1c', barColor: '#E24B4A' },
  mare:   { label: 'MARE',    bg: '#fffbeb', color: '#92400e', barColor: '#f59e0b' },
  mic:    { label: 'MIC',     bg: '#f3f4f6', color: '#6b7280', barColor: '#d1d5db' },
};

function SensitivitateSection({ rows }: { rows: SensRow[] }) {
  if (!rows || rows.length === 0) return null;

  const maxImpact = Math.max(...rows.map(r => r.impactMax), 1);
  const primaVar  = SENS_VAR_LABELS[rows[0].variabila] ?? rows[0].variabila;

  return (
    <div style={sens.wrap}>
      <p style={sens.title}>Analiză de sensibilitate</p>
      <p style={sens.subtitle}>
        Impact asupra profitului net la variație de ±10% pe fiecare factor cheie.
        Ordonat descrescător după amplitudine.
      </p>

      <div style={sens.tableWrap}>
        {rows.map(row => {
          const cfg   = ETICHETA_CFG[row.eticheta] ?? ETICHETA_CFG.mic;
          const barW  = (row.impactMax / maxImpact) * 100;
          const label = SENS_VAR_LABELS[row.variabila] ?? row.variabila;
          const signPlus  = row.impactPlus >= 0 ? '+' : '';
          const signMinus = row.impactMinus >= 0 ? '+' : '';

          return (
            <div key={row.variabila} style={sens.row}>
              {/* Nume variabilă */}
              <div style={sens.nameCell}>
                <span style={sens.varName}>{label}</span>
              </div>

              {/* Bară proporțională */}
              <div style={sens.barCell}>
                <div style={sens.barRail}>
                  <div style={{
                    ...sens.barFill,
                    width: `${barW}%`,
                    backgroundColor: cfg.barColor,
                  }} />
                </div>
              </div>

              {/* ±X% impact */}
              <div style={sens.impactCell}>
                <span style={{ ...sens.impactText, color: cfg.color }}>
                  {signPlus}{row.impactPlus.toFixed(1)}% / {signMinus}{row.impactMinus.toFixed(1)}%
                </span>
              </div>

              {/* Etichetă */}
              <div style={sens.labelCell}>
                <span style={{
                  ...sens.badge,
                  backgroundColor: cfg.bg,
                  color: cfg.color,
                }}>
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p style={sens.conclusion}>
        💡 Afacerea depinde cel mai mult de <strong>{primaVar}</strong>.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StocuriTable
// ---------------------------------------------------------------------------

function StocuriTable({
  stocuri, consumLunar, capitalBlocat, creditFurnizor, onChange,
}: {
  stocuri: StocItem[]; consumLunar: number; capitalBlocat: number;
  creditFurnizor: number; onChange: (s: StocItem[]) => void;
}) {
  function updateRow(id: number, field: keyof StocItem, raw: string) {
    onChange(stocuri.map(r =>
      r.id === id ? { ...r, [field]: field === 'categorie' ? raw : raw === '' ? 0 : Number(raw) } : r,
    ));
  }
  function deleteRow(id: number) { onChange(stocuri.filter(r => r.id !== id)); }
  function addRow() {
    onChange([...stocuri, {
      id: nextStocId++, categorie: 'Categorie nouă',
      pct_din_marfa: 0, zile_stoc: 7, pierderi_pct: 0, termen_plata_zile: 14,
    }]);
  }
  function capitalBlocatRand(row: StocItem) {
    if (!consumLunar || !row.zile_stoc) return 0;
    const consumCat = consumLunar * ((Number(row.pct_din_marfa) || 0) / 100);
    return (consumCat / 30) * (Number(row.zile_stoc) || 0);
  }
  const totalPct = stocuri.reduce((s, r) => s + (Number(r.pct_din_marfa) || 0), 0);
  const pierderiPonderate = totalPct > 0
    ? stocuri.reduce((s, r) => s + ((Number(r.pct_din_marfa) || 0) / totalPct) * (Number(r.pierderi_pct) || 0), 0)
    : 0;
  return (
    <div>
      <p style={sk.explainer}>
        Zile stoc = cât capital blochezi în marfă. Pierderi % = cât din marfă arunci. Sunt lucruri diferite.
      </p>
      <div style={sk.tableWrap}>
        <table style={sk.table}>
          <thead>
            <tr>
              <th style={sk.thLeft}>Categorie</th>
              <th style={sk.thRight}>% din marfă</th>
              <th style={sk.thRight}>Zile stoc</th>
              <th style={sk.thRight}>Pierderi %</th>
              <th style={sk.thRight}>Termen plată (zile)</th>
              <th style={sk.thRight}>Capital blocat</th>
              <th style={sk.thDel} />
            </tr>
          </thead>
          <tbody>
            {stocuri.map(row => (
              <tr key={row.id} style={sk.tr}>
                <td style={sk.tdLeft}>
                  <input value={row.categorie} onChange={e => updateRow(row.id, 'categorie', e.target.value)} style={sk.inputText} />
                </td>
                <td style={sk.tdRight}>
                  <input type="number" value={row.pct_din_marfa || ''} onChange={e => updateRow(row.id, 'pct_din_marfa', e.target.value)} style={sk.inputNum} min={0} max={100} placeholder="0" />
                  <span style={sk.unit}>%</span>
                </td>
                <td style={sk.tdRight}>
                  <input type="number" value={row.zile_stoc || ''} onChange={e => updateRow(row.id, 'zile_stoc', e.target.value)} style={sk.inputNum} min={0} placeholder="0" />
                  <span style={sk.unit}>z</span>
                </td>
                <td style={sk.tdRight}>
                  <input type="number" value={row.pierderi_pct || ''} onChange={e => updateRow(row.id, 'pierderi_pct', e.target.value)} style={sk.inputNum} min={0} max={100} placeholder="0" />
                  <span style={sk.unit}>%</span>
                </td>
                <td style={sk.tdRight}>
                  <input type="number" value={row.termen_plata_zile || ''} onChange={e => updateRow(row.id, 'termen_plata_zile', e.target.value)} style={sk.inputNum} min={0} placeholder="0" />
                  <span style={sk.unit}>z</span>
                </td>
                <td style={{ ...sk.tdRight, color: '#6b7280', fontSize: '0.8125rem' }}>
                  {fmt(capitalBlocatRand(row))} lei
                </td>
                <td style={sk.tdDel}>
                  <button onClick={() => deleteRow(row.id)} style={sk.delBtn} title="Șterge">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} className="btn-accent-ghost" style={sk.addBtn}>+ Adaugă categorie</button>
      <div style={sk.summary}>
        <div style={sk.summaryItem}>
          <span style={sk.summaryLabel}>Pierderi medii ponderate</span>
          <span style={sk.summaryValue}>{pierderiPonderate.toFixed(1)}%</span>
        </div>
        <div style={sk.summaryItem}>
          <span style={sk.summaryLabel}>Capital blocat total</span>
          <span style={sk.summaryValue}>{fmt(capitalBlocat)} lei</span>
        </div>
        <div style={sk.summaryItem}>
          <span style={sk.summaryLabel}>Credit furnizor</span>
          <span style={{ ...sk.summaryValue, color: ACCENT }}>{fmt(creditFurnizor)} lei</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chapter7 – tab types
// ---------------------------------------------------------------------------

type Ch7Tab = 'meniu' | 'cheltuieli' | 'stocuri' | 'cashflow';

const CH7_TABS: { id: Ch7Tab; label: string }[] = [
  { id: 'meniu',      label: 'Meniu' },
  { id: 'cheltuieli', label: 'Cheltuieli' },
  { id: 'stocuri',    label: 'Stocuri' },
  { id: 'cashflow',   label: 'Cash-flow' },
];

// ---------------------------------------------------------------------------
// CashFlowIndicators (tab Cash-flow indicators row)
// ---------------------------------------------------------------------------

function CashFlowIndicators({
  pragRupere, cashMinim, venitLunar, totalCheltuieli, profitNet, serieCash,
}: {
  pragRupere: number | null;
  cashMinim: number;
  venitLunar: number;
  totalCheltuieli: number;
  profitNet: number;
  serieCash: CashPoint[];
}) {
  // Breakeven = venit la care profit = 0  (already expressed as clients/zi = pragRupere)
  // Recuperare investiție = prima lună cu cash > 0 după faza de rampă
  const recuperareLuna = serieCash.find(p => !p.preDeschidere && p.cash > 0)?.luna ?? null;

  return (
    <div style={cf.indicatorsGrid}>
      <div style={cf.indCard}>
        <p style={cf.indLabel}>Prag rupere</p>
        <p style={cf.indValue}>
          {pragRupere !== null ? <>{pragRupere} <span style={cf.indUnit}>cl/zi</span></> : <span style={{ color: '#E24B4A' }}>imposibil</span>}
        </p>
        <p style={cf.indSub}>Minim clienți pe zi pentru a nu pierde bani</p>
      </div>
      <div style={cf.indCard}>
        <p style={cf.indLabel}>Cash minim</p>
        <p style={{ ...cf.indValue, color: cashMinim < 0 ? '#E24B4A' : '#111' }}>
          {fmt(cashMinim)} <span style={cf.indUnit}>lei</span>
        </p>
        <p style={cf.indSub}>Cel mai mic sold proiectat (include pre-deschidere)</p>
      </div>
      <div style={cf.indCard}>
        <p style={cf.indLabel}>Breakeven lunar</p>
        <p style={cf.indValue}>
          {venitLunar > 0 ? <>{fmt(totalCheltuieli)} <span style={cf.indUnit}>lei/lună</span></> : '—'}
        </p>
        <p style={cf.indSub}>Cifra de afaceri necesară pentru profit zero</p>
      </div>
      <div style={cf.indCard}>
        <p style={cf.indLabel}>Recuperare</p>
        <p style={{ ...cf.indValue, color: recuperareLuna !== null && recuperareLuna <= 12 ? ACCENT : '#111' }}>
          {recuperareLuna !== null ? <>L{recuperareLuna} <span style={cf.indUnit}>după deschidere</span></> : '—'}
        </p>
        <p style={cf.indSub}>Prima lună cu sold pozitiv în cont</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chapter7 content
// ---------------------------------------------------------------------------

function Chapter7({
  rez, alerte, meniu, setMeniu, cheltuieli, setCheltuieli, stocuri, setStocuri,
  clientiZi, setClientiZi, pierderiPct, setPierderiPct, rampaMuni, setRampaMuni,
  preDeschidereMuni, setPreDeschidereMuni, angajati, setAngajati,
  salariuMediu, setSalariuMediu,
  missionStatus, onConfirmMission,
}: {
  rez: Record<string, unknown>;
  alerte: { id: string; nivel: string; mesaj: string }[];
  meniu: MenuItem[]; setMeniu: (m: MenuItem[]) => void;
  cheltuieli: CheltuialaItem[]; setCheltuieli: (c: CheltuialaItem[]) => void;
  stocuri: StocItem[]; setStocuri: (s: StocItem[]) => void;
  clientiZi: number; setClientiZi: (v: number) => void;
  pierderiPct: number; setPierderiPct: (v: number) => void;
  rampaMuni: number; setRampaMuni: (v: number) => void;
  preDeschidereMuni: number; setPreDeschidereMuni: (v: number) => void;
  angajati: number; setAngajati: (v: number) => void;
  salariuMediu: number; setSalariuMediu: (v: number) => void;
  missionStatus: Record<string, string>;
  onConfirmMission: (key: string, val: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<Ch7Tab>('meniu');

  const pretMediu    = (rez.meniu as { pretMediu: number }).pretMediu;
  const foodCostPct  = (rez.meniu as { foodCostPct: number }).foodCostPct;
  const venitLunar   = rez.venitLunar as number;
  const profitNet    = rez.profitNet as number;
  const pragRupere   = rez.pragRupere as number | null;
  const marjaNetaPct = rez.marjaNetaPct as number;
  const serieCash    = rez.serieCash as CashPoint[];

  // Total cheltuieli (pentru breakeven indicator)
  const totalCheltuieli = cheltuieli.reduce((s, r) => {
    const v = Number(r.valoare) || 0;
    return s + (r.tip === 'pct_venit' ? (venitLunar * v) / 100 : v);
  }, 0);

  return (
    <div style={ch7.wrap}>
      <div style={{ marginBottom: 24 }}>
        <ConfidenceBar missionStatus={missionStatus} sensibilitate={(rez.sensibilitate as SensRow[]) || []} />
      </div>

      {/* ── Verdict strip (always visible) ── */}
      {alerte.length > 0 && (
        <div style={ch7.verdictStrip}>
          <span style={ch7.verdictTitle}>Verdict:</span>
          <div style={ch7.verdictAlerts}>
            {alerte.map((al) => (
              <Alert key={al.id} id={al.id} nivel={al.nivel} mesaj={al.mesaj} />
            ))}
          </div>
        </div>
      )}

      {/* ── Tab bar ── */}
      <div style={ch7.tabBar} className="ch7-tab-bar">
        {CH7_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...ch7.tabBtn,
              ...(activeTab === tab.id ? ch7.tabBtnActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Meniu ── */}
      {activeTab === 'meniu' && (
        <section style={ch7.panelFull}>
          <h2 style={ch7.panelTitle}>Meniu și structura venitului</h2>
          <MenuTable meniu={meniu} onChange={setMeniu} />
          {meniu.length > 0 && (
            <div style={ch7.menuStats}>
              <span>Preț mediu ponderat: <strong>{pretMediu.toFixed(2)} lei</strong></span>
              <span>Food cost mediu: <strong style={{ color: foodCostPct > 40 ? '#E24B4A' : '#111' }}>{foodCostPct.toFixed(1)}%</strong></span>
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <MissionCard fieldKey="pret_mediu" status={missionStatus.pret_mediu as any} value={Math.round(pretMediu)} onConfirm={(v) => onConfirmMission('pret_mediu', v)} />
          </div>

          {/* Parametri + Rezultate */}
          <div style={{ ...ch7.grid, marginTop: 24 }}>
            <section style={ch7.panel}>
              <h2 style={ch7.panelTitle}>Parametri operaționali</h2>
              <Slider id="clienti-zi" label="Clienți pe zi" min={10} max={250} step={5} value={clientiZi} unit="clienți" onChange={setClientiZi} />
              <MissionCard fieldKey="clienti_zi" status={missionStatus.clienti_zi as any} value={clientiZi} onConfirm={(v) => onConfirmMission('clienti_zi', v)} />
              <div style={{ marginTop: 24 }} />
              
              <Slider id="pierderi" label="Pierderi / perisabilitate" min={0} max={20} step={0.5} value={pierderiPct} unit="%" onChange={setPierderiPct} />
              <Slider id="rampa" label="Rampă la capacitate" min={1} max={12} step={1} value={rampaMuni} unit="luni" onChange={setRampaMuni} />
              <Slider id="pre-deschidere" label="Perioadă pre-deschidere" min={0} max={6} step={1} value={preDeschidereMuni} unit="luni" onChange={setPreDeschidereMuni} />
              <Slider id="angajati" label="Număr angajați" min={1} max={20} step={1} value={angajati} unit="pers." onChange={setAngajati} />
              
              <Slider id="salariu" label="Salariu mediu brut" min={2000} max={15000} step={500} value={salariuMediu} unit="lei" onChange={setSalariuMediu} />
              <MissionCard fieldKey="salarii" status={missionStatus.salarii as any} value={salariuMediu} onConfirm={(v) => onConfirmMission('salarii', v)} />
              <div style={{ marginTop: 24 }} />

              <p style={ch7.hint}>Modificările se reflectă instant în rezultate.</p>
            </section>

            <section style={ch7.panel}>
              <h2 style={ch7.panelTitle}>Rezultate la capacitate</h2>
              <div style={ch7.cards}>
                <Card label="Venit lunar"          value={`${fmt(venitLunar)} lei`} />
                <Card label="Profit net"           value={`${fmt(profitNet)} lei`} accent={profitNet > 0} />
                <Card label="Prag de rupere"       value={pragRupere !== null ? `${pragRupere} clienți/zi` : 'imposibil'} />
                <Card label="Cash minim proiectat" value={`${fmt(rez.cashMinim as number)} lei`} />
              </div>

              <div style={ch7.marjaRow}>
                <span style={ch7.marjaLabel}>Marjă netă</span>
                <span style={{
                  ...ch7.marjaBadge,
                  backgroundColor: marjaNetaPct >= 3 && marjaNetaPct <= 8 ? '#f0fdf4' : marjaNetaPct > 8 ? '#fffbeb' : '#fef2f2',
                  color:           marjaNetaPct >= 3 && marjaNetaPct <= 8 ? '#166534' : marjaNetaPct > 8 ? '#92400e' : '#b91c1c',
                }}>
                  {marjaNetaPct.toFixed(1)}%
                </span>
              </div>
            </section>
          </div>
        </section>
      )}

      {/* ── Tab: Cheltuieli ── */}
      {activeTab === 'cheltuieli' && (
        <section style={ch7.panelFull}>
          <h2 style={ch7.panelTitle}>Cheltuieli lunare</h2>
          <CheltuieliTable cheltuieli={cheltuieli} venitLunar={venitLunar} onChange={setCheltuieli} />
          <div style={{ marginTop: 24 }}>
            <MissionCard 
              fieldKey="chirie" 
              status={missionStatus.chirie as any} 
              value={Number(cheltuieli.find(c => c.nume.toLowerCase().includes('chiri'))?.valoare || 0)} 
              onConfirm={(v) => onConfirmMission('chirie', v)} 
            />
          </div>
        </section>
      )}

      {/* ── Tab: Stocuri ── */}
      {activeTab === 'stocuri' && (
        <section style={ch7.panelFull}>
          <h2 style={ch7.panelTitle}>Structura stocurilor</h2>
          <StocuriTable
            stocuri={stocuri}
            consumLunar={Number(rez.consumLunar) || 0}
            capitalBlocat={Number(rez.capitalBlocatStoc) || 0}
            creditFurnizor={Number(rez.creditFurnizor) || 0}
            onChange={setStocuri}
          />
        </section>
      )}

      {/* ── Tab: Cash-flow ── */}
      {activeTab === 'cashflow' && (
        <div>
          <CashFlowIndicators
            pragRupere={pragRupere}
            cashMinim={rez.cashMinim as number}
            venitLunar={venitLunar}
            totalCheltuieli={totalCheltuieli}
            profitNet={profitNet}
            serieCash={serieCash}
          />
          <CashFlowChart serie={serieCash} />
          <SensitivitateSection rows={(rez.sensibilitate as SensRow[]) ?? []} />
        </div>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// Chapter 9 content
// ---------------------------------------------------------------------------

function Chapter9({ 
  rez, buget, state, missionStatus, onConfirmMission
}: { 
  rez: Record<string, unknown>; buget: number; state?: any; 
  missionStatus: Record<string, string>; onConfirmMission: (k: string, v: number) => void;
}) {
  const [luniExit, setLuniExit] = useState<number>(6);
  const [recupPct, setRecupPct] = useState<Record<string, number>>({});

  const serieCash = (rez.serieCash as CashPoint[]) || [];
  const punctCash = serieCash.find(p => p.luna === luniExit && !p.preDeschidere) || serieCash[serieCash.length - 1];
  const cashRamas = punctCash ? punctCash.cash : 0;
  
  // Capital consumat (până atunci) = Buget inițial - Cash rămas
  const investitPanaAtunci = buget - cashRamas;
  
  // Active (din buget) - aproximativ 70% este investiție în active (echipamente/amenajare) cf. buildState
  const investitii = [{ nume: 'Echipamente și amenajare', valoare: buget * 0.7 }];

  const sumaRecuperabila = investitii.reduce((acc, inv) => {
    const pct = recupPct[inv.nume] ?? 40;
    return acc + (inv.valoare * pct) / 100;
  }, 0);

  const pierdereNeta = investitPanaAtunci - sumaRecuperabila;

  return (
    <div style={ch7.wrap}>
      <section style={ch7.panelFull}>
        <h2 style={ch7.panelTitle}>Risc și exit (Dacă te oprești)</h2>

        {/* Switcher luni */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[4, 6, 12].map(luni => (
            <button
              key={luni}
              onClick={() => setLuniExit(luni)}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                border: luniExit === luni ? `2px solid ${ACCENT}` : '1px solid #e5e7eb',
                backgroundColor: luniExit === luni ? '#f0fdf4' : '#fff',
                color: luniExit === luni ? ACCENT : '#374151',
                fontWeight: luniExit === luni ? 600 : 500,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: 'inherit'
              }}
            >
              La {luni} luni
            </button>
          ))}
        </div>

        {/* Grid de rezultate */}
        <div style={ch7.cards}>
          <Card label="Capital consumat (până atunci)" value={`${fmt(investitPanaAtunci)} lei`} />
          <Card label="Recuperabil din active" value={`${fmt(sumaRecuperabila)} lei`} accent />
          <Card label="Pierdere netă estimată" value={`${fmt(pierdereNeta)} lei`} />
        </div>

        {/* Tabel Active */}
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', marginTop: 32, marginBottom: 12 }}>
          Active și recuperare
        </h3>
        <MissionCard 
          fieldKey="cost_echipament" 
          status={missionStatus.cost_echipament as any} 
          value={Math.round(buget * 0.7)} 
          onConfirm={(v) => onConfirmMission('cost_echipament', Math.round(v / 0.7))} 
        />
        <div style={{ marginTop: 16 }} />
        <div style={t.tableWrap}>
          <table style={t.table}>
            <thead>
              <tr>
                <th style={t.thLeft}>Element investiție</th>
                <th style={t.thRight}>Valoare (lei)</th>
                <th style={t.thRight}>% Recuperare</th>
                <th style={t.thRight}>Recuperabil (lei)</th>
              </tr>
            </thead>
            <tbody>
              {investitii.map((inv, idx) => {
                const pct = recupPct[inv.nume] ?? 40;
                const rec = (inv.valoare * pct) / 100;
                return (
                  <tr key={idx} style={t.tr}>
                    <td style={t.tdLeft}>{inv.nume}</td>
                    <td style={t.tdRight}>{fmt(inv.valoare)}</td>
                    <td style={t.tdRight}>
                      <input 
                        type="number" 
                        value={pct} 
                        onChange={e => setRecupPct({...recupPct, [inv.nume]: Number(e.target.value)})}
                        style={t.inputNum} 
                        min={0} max={100} 
                      />
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 2 }}>%</span>
                    </td>
                    <td style={t.tdRight}>{fmt(rec)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 8, fontStyle: 'italic' }}>
          * Procentele de recuperare sunt estimări. Verifică pe piața second-hand.
        </p>

        {/* Secțiune "Dacă te oprești" */}
        <div style={{ marginTop: 32, padding: 20, backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: 16 }}>Dacă te oprești (Pași exit)</h3>
          <ul style={{ fontSize: '0.875rem', color: '#374151', paddingLeft: 20, lineHeight: 1.6, margin: 0 }}>
            <li><strong>Preaviz contract chirie:</strong> De obicei 1-3 luni (verifică clauzele contractuale). Costul cu chiria va continua în această perioadă.</li>
            <li><strong>Cost lichidare personal:</strong> Estimat la 1-2 salarii compensatorii / angajat (dacă este cazul).</li>
            <li><strong>Pași legali:</strong> Suspendare firmă &rarr; Radiere &rarr; Protejare bunuri personale.</li>
          </ul>
        </div>
      </section>
      
      <div style={{ marginTop: 24 }}>
        <AIGenerator chapterId={9} chapterTitle="Risc și exit" state={state} rez={rez} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scenariu Switcher
// ---------------------------------------------------------------------------

function ScenariuSwitcher({
  value,
  onChange,
}: {
  value: 'pesimist' | 'realist' | 'optimist';
  onChange: (v: 'pesimist' | 'realist' | 'optimist') => void;
}) {
  const options = [
    { id: 'pesimist', label: 'Pesimist' },
    { id: 'realist', label: 'Realist' },
    { id: 'optimist', label: 'Optimist' },
  ] as const;
  
  return (
    <div style={{ display: 'flex', backgroundColor: '#f3f4f6', padding: 4, borderRadius: 8, gap: 4 }} className="scenariu-switcher">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            padding: '6px 12px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: value === opt.id ? ACCENT : 'transparent',
            color: value === opt.id ? '#fff' : '#4b5563',
            transition: 'all 0.15s ease',
            fontFamily: 'inherit',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Missions / Confidence Bar
// ---------------------------------------------------------------------------

const MISSIONS_DEF = {
  pret_mediu: { title: 'Preț mediu', instruction: 'Verifică prețurile concurenței din zonă pentru produse similare.', unit: 'lei' },
  clienti_zi: { title: 'Clienți pe zi', instruction: 'Numără trecătorii sau clienții competiției într-o zi de vârf și una slabă.', unit: 'clienți' },
  chirie: { title: 'Chirie lunară', instruction: 'Contactează 3 agenții imobiliare pentru spații similare în zonă.', unit: 'lei' },
  salarii: { title: 'Salariu mediu brut', instruction: 'Verifică ofertele de angajare actuale pe platformele de joburi.', unit: 'lei' },
  cost_echipament: { title: 'Investiție / Echipament', instruction: 'Cere 2 oferte reale de la furnizori de echipamente.', unit: 'lei' },
};

function ConfidenceBar({ missionStatus, sensibilitate }: { missionStatus: Record<string, string>, sensibilitate: SensRow[] }) {
  const keys = Object.keys(MISSIONS_DEF);
  const verifiedCount = keys.filter(k => missionStatus[k] === 'verificat').length;
  const pct = (verifiedCount / keys.length) * 100;
  
  let label = "Estimare orientativă";
  let color = "#ef4444";
  if (pct >= 80) { label = "Fundamentată"; color = "#22c55e"; }
  else if (pct >= 50) { label = "Parțial validată"; color = "#eab308"; }
  else if (pct >= 25) { label = "Estimare îmbunătățită"; color = "#f97316"; }

  const sortedKeys = [...keys].sort((a, b) => {
    const impactA = sensibilitate.find(s => s.variabila === a)?.impactMax || 0;
    const impactB = sensibilitate.find(s => s.variabila === b)?.impactMax || 0;
    return impactB - impactA;
  });

  return (
    <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>Încredere date: {pct.toFixed(0)}%</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, backgroundColor: color + '20', color: color }}>
            {label}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Verifică misiunile (ordinea impactului)</span>
      </div>
      <div style={{ height: 6, backgroundColor: '#f3f4f6', borderRadius: 999, overflow: 'hidden', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ height: '100%', backgroundColor: color, width: `${pct}%`, transition: 'all 0.5s ease' }} />
      </div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '12px 0 4px', maxWidth: 1200, margin: '0 auto', scrollbarWidth: 'none' }}>
        {sortedKeys.map(k => {
          const isVerified = missionStatus[k] === 'verificat';
          return (
            <div key={k} style={{ 
              flexShrink: 0, padding: '6px 12px', borderRadius: 8, border: `1px solid ${isVerified ? '#bbf7d0' : '#e5e7eb'}`,
              backgroundColor: isVerified ? '#f0fdf4' : '#f9fafb', display: 'flex', alignItems: 'center', gap: 6,
              opacity: isVerified ? 0.7 : 1
            }}>
              <span style={{ fontSize: '0.75rem', color: isVerified ? '#166534' : '#374151', fontWeight: 500 }}>
                {isVerified ? '✓ ' : '○ '}{MISSIONS_DEF[k as keyof typeof MISSIONS_DEF].title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MissionCard({
  fieldKey, status, value, onConfirm
}: {
  fieldKey: keyof typeof MISSIONS_DEF, status: 'estimat'|'verificat', value: number, onConfirm: (v: number) => void
}) {
  const def = MISSIONS_DEF[fieldKey];
  const [localVal, setLocalVal] = useState(value);
  
  useEffect(() => { setLocalVal(value); }, [value]);

  if (status === 'verificat') {
    return (
      <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#166534', fontSize: '1.25rem', lineHeight: 1 }}>✓</span>
        <span style={{ fontSize: '0.8125rem', color: '#166534', fontWeight: 500 }}>Sursă: Verificat pe teren ({localVal} {def.unit})</span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8, padding: 16, backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: '1rem' }}>🎯</span>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#92400e' }}>Misiune: {def.title}</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: 12, lineHeight: 1.4 }}>{def.instruction}</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input 
          type="number" 
          value={localVal || ''} 
          onChange={e => setLocalVal(Number(e.target.value))}
          style={{ width: 80, padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: '0.8125rem' }}
        />
        <span style={{ fontSize: '0.75rem', color: '#92400e' }}>{def.unit}</span>
        <button 
          onClick={() => onConfirm(localVal)}
          style={{ marginLeft: 'auto', backgroundColor: '#92400e', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Confirmă
        </button>
        <button 
          onClick={() => onConfirm(value)}
          style={{ backgroundColor: 'transparent', color: '#92400e', border: '1px solid #92400e', padding: '4px 12px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Lasă estimarea
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardInner (main layout shell)
// ---------------------------------------------------------------------------

function DashboardInner() {
  const params      = useSearchParams();
  const router      = useRouter();

  const bugetParam  = Number(params.get('buget')       || 200000);
  const suprafata   = Number(params.get('suprafata')   || 90);
  const concept     = params.get('concept')     || '';
  const localitate  = params.get('localitate')  || '';
  const tipAfacere  = params.get('tip_afacere') || 'restaurant';

  const [buget, setBuget] = useState(bugetParam);

  const [activeChapter, setActiveChapter] = useState(7);
  const [statuses, setStatuses] = useState<Record<number, ChapterStatus>>(() => {
    const m: Record<number, ChapterStatus> = {};
    CHAPTERS.forEach(ch => { m[ch.id] = ch.defaultStatus; });
    return m;
  });

  const [chapterCompletion, setChapterCompletion] = useState<Record<number, boolean>>({});
  
  const handleCompletionChange = (nr: number, isComplete: boolean) => {
    setChapterCompletion(prev => ({ ...prev, [nr]: isComplete }));
    setStatuses(prev => ({ ...prev, [nr]: isComplete ? 'green' : 'yellow' }));
  };

  const narrativeChapters = [2, 3, 4, 5, 8, 10];
  const allNarrativeCompleted = narrativeChapters.every(nr => chapterCompletion[nr]);

  const [showFullPlanPreview, setShowFullPlanPreview] = useState(false);
  const [fullPlanText, setFullPlanText] = useState("");

  const handleAssembleFullPlan = () => {
    let fullText = "";
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(nr => {
      const title = CHAPTERS.find(c => c.id === nr)?.title || `Capitol ${nr}`;
      const text = localStorage.getItem(`plan_cap_${nr}_text`);
      if (text) {
        fullText += `## ${nr}. ${title}\n\n${text}\n\n`;
      }
    });
    setFullPlanText(fullText);
    setShowFullPlanPreview(true);
  };


  const [missionStatus, setMissionStatus] = useState<Record<string, 'estimat' | 'verificat'>>({
    pret_mediu: 'estimat',
    clienti_zi: 'estimat',
    chirie: 'estimat',
    salarii: 'estimat',
    cost_echipament: 'estimat'
  });

  const [meniu, setMeniu]                           = useState<MenuItem[]>(DEFAULT_MENU);
  const [cheltuieli, setCheltuieli]                 = useState<CheltuialaItem[]>(DEFAULT_CHELTUIELI);
  const [stocuri, setStocuri]                       = useState<StocItem[]>(DEFAULT_STOCURI);
  const [clientiZi, setClientiZi]                   = useState(80);
  const [pierderiPct, setPierderiPct]               = useState(6);
  const [rampaMuni, setRampaMuni]                   = useState(5);
  const [preDeschidereMuni, setPreDeschidereMuni]   = useState(3);
  const [angajati, setAngajati]                     = useState(6);
  const [salariuMediu, setSalariuMediu]             = useState(4000);
  const [scenariu, setScenariu]                     = useState<'pesimist' | 'realist' | 'optimist'>('realist');

  const onConfirmMission = (key: string, val: number) => {
    setMissionStatus(prev => ({ ...prev, [key]: 'verificat' }));
    if (key === 'clienti_zi') setClientiZi(val);
    else if (key === 'salarii') setSalariuMediu(val);
    else if (key === 'chirie') {
      setCheltuieli(prev => prev.map(c => c.nume.toLowerCase().includes('chiri') ? { ...c, valoare: val } : c));
    } else if (key === 'cost_echipament') {
      setBuget(val);
    } else if (key === 'pret_mediu') {
      const oldPretMediu = meniu.reduce((s, r) => s + (r.pret * r.mix_pct / 100), 0) || 1;
      const ratio = val / oldPretMediu;
      setMeniu(prev => prev.map(r => ({ ...r, pret: Math.round(r.pret * ratio) })));
    }
  };

  const params_op = [buget, suprafata, meniu, cheltuieli, stocuri, clientiZi,
    pierderiPct, rampaMuni, preDeschidereMuni, angajati, salariuMediu, scenariu] as const;

  const rez = useMemo(
    () => calculeaza(buildState(...params_op), config, TAXE, []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...params_op],
  );

  const alerte = useMemo(
    () => evalueazaVerdict(rez, buildState(...params_op), config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rez, ...params_op],
  );

  const subtitle = [tipAfacere.charAt(0).toUpperCase() + tipAfacere.slice(1), concept, localitate]
    .filter(Boolean).join(' · ');

  const activeChapterObj = CHAPTERS.find(ch => ch.id === activeChapter)!;

  return (
    <div style={lay.root}>
      {/* ── KPI bar (fixed top) ── */}
      <KpiBar
        venitLunar={rez.venitLunar as number}
        profitNet={rez.profitNet as number}
        pragRupere={rez.pragRupere as number | null}
        cashMinim={rez.cashMinim as number}
      />

      {/* ── Mobile chapter strip (below KPI bar, hidden on desktop) ── */}
      <div style={lay.mobileStripWrapper} className="mobile-strip-wrapper">
        <MobileChapterStrip
          activeChapter={activeChapter}
          statuses={statuses}
          onSelect={setActiveChapter}
        />
      </div>

      {/* ── Page header ── */}
      <header style={lay.pageHeader} className="page-header">
        <div style={lay.pageHeaderInner} className="page-header-inner">
          <div>
            <h1 style={lay.pageTitle}>Simulator financiar</h1>
            {subtitle && <p style={lay.pageSub}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="header-actions">
            <ScenariuSwitcher value={scenariu} onChange={setScenariu} />
            <button onClick={() => router.push('/')} style={lay.backBtn}>← Înapoi</button>
          </div>
        </div>
      </header>

      {/* ── Body: sidebar + content ── */}
      <div style={lay.body}>
        {/* Sidebar (desktop only) */}
        <div style={lay.sidebarWrapper} className="sidebar-wrapper">
          <Sidebar
            activeChapter={activeChapter}
            statuses={statuses}
            onSelect={setActiveChapter}
          />
        </div>

        {/* Main content */}
        <main style={lay.content}>
          {activeChapter === 7 ? (
            <Chapter7
              rez={rez as Record<string, unknown>}
              alerte={alerte as { id: string; nivel: string; mesaj: string }[]}
              meniu={meniu} setMeniu={setMeniu}
              cheltuieli={cheltuieli} setCheltuieli={setCheltuieli}
              stocuri={stocuri} setStocuri={setStocuri}
              clientiZi={clientiZi} setClientiZi={setClientiZi}
              pierderiPct={pierderiPct} setPierderiPct={setPierderiPct}
              rampaMuni={rampaMuni} setRampaMuni={setRampaMuni}
              preDeschidereMuni={preDeschidereMuni} setPreDeschidereMuni={setPreDeschidereMuni}
              angajati={angajati} setAngajati={setAngajati}
              salariuMediu={salariuMediu} setSalariuMediu={setSalariuMediu}
              missionStatus={missionStatus}
              onConfirmMission={onConfirmMission}
            />
          ) : activeChapter === 9 ? (
            <Chapter9 rez={rez as Record<string, unknown>} buget={buget} state={{ ...buildState(...params_op), concept, localitate, tip_afacere: tipAfacere }} missionStatus={missionStatus} onConfirmMission={onConfirmMission} />
          ) : activeChapter === 1 ? (
            <div style={ch7.wrap}>
              <Capitol nr={1} title="Rezumat executiv" fields={[]} state={{ ...buildState(...params_op), concept, localitate, tip_afacere: tipAfacere }} rez={rez} onAssemble={(f, s, r) => asambleazaCapitol1({ cap2: {} }, s, r)} isAutoGenerated isBlocked={!allNarrativeCompleted} blockedMessage="Acest capitol se generează automat pe baza celorlalte capitole. Asigură-te că ai completat toate celelalte capitole înainte de a-l asambla." onCompletionChange={(val) => handleCompletionChange(1, val)} />
            </div>
          ) : activeChapter === 2 ? (
            <div style={ch7.wrap}>
              <Capitol nr={2} title="Descrierea afacerii" fields={cap2Fields} state={{ ...buildState(...params_op), concept, localitate, tip_afacere: tipAfacere }} rez={rez} onAssemble={asambleazaCapitol2} onCompletionChange={(val) => handleCompletionChange(2, val)} />
            </div>
          ) : activeChapter === 3 ? (
            <div style={ch7.wrap}>
              <Capitol nr={3} title="Piața și locația" fields={cap3Fields} state={{ ...buildState(...params_op), concept, localitate, tip_afacere: tipAfacere }} rez={rez} onAssemble={asambleazaCapitol3} onCompletionChange={(val) => handleCompletionChange(3, val)} />
            </div>
          ) : activeChapter === 4 ? (
            <div style={ch7.wrap}>
              <Capitol nr={4} title="Analiza concurenței" fields={cap4Fields} state={{ ...buildState(...params_op), concept, localitate, tip_afacere: tipAfacere }} rez={rez} onAssemble={asambleazaCapitol4} onCompletionChange={(val) => handleCompletionChange(4, val)} />
            </div>
          ) : activeChapter === 5 ? (
            <div style={ch7.wrap}>
              <Capitol nr={5} title="Plan operațional" fields={cap5Fields} state={{ ...buildState(...params_op), concept, localitate, tip_afacere: tipAfacere }} rez={rez} onAssemble={asambleazaCapitol5} onCompletionChange={(val) => handleCompletionChange(5, val)} />
            </div>
          ) : activeChapter === 6 ? (
            <div style={ch7.wrap}>
              <Capitol nr={6} title="Autorizații" fields={[]} state={{ ...buildState(...params_op), concept, localitate, tip_afacere: tipAfacere }} rez={rez} onAssemble={() => [{ titlu: "", text: "Sistemul a generat automat lista de autorizații necesare din configurație." }]} isAutoGenerated onCompletionChange={(val) => handleCompletionChange(6, val)} />
            </div>
          ) : activeChapter === 8 ? (
            <div style={ch7.wrap}>
              <Capitol nr={8} title="Marketing" fields={cap8Fields} state={{ ...buildState(...params_op), concept, localitate, tip_afacere: tipAfacere }} rez={rez} onAssemble={asambleazaCapitol8} onCompletionChange={(val) => handleCompletionChange(8, val)} />
            </div>
          ) : activeChapter === 10 ? (
            <div style={ch7.wrap}>
              <Capitol nr={10} title="Plan de acțiune" fields={cap10Fields} state={{ ...buildState(...params_op), concept, localitate, tip_afacere: tipAfacere }} rez={rez} onAssemble={asambleazaCapitol10} onCompletionChange={(val) => handleCompletionChange(10, val)} />
            </div>
          ) : (
            <ChapterPlaceholder chapter={activeChapterObj} state={{ ...buildState(...params_op), concept, localitate, tip_afacere: tipAfacere }} rez={rez} />
          )}
        </main>
      </div>

      {/* ── Global Assemble Button ── */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
        <button
          onClick={handleAssembleFullPlan}
          disabled={!allNarrativeCompleted}
          style={{
            backgroundColor: allNarrativeCompleted ? '#0f766e' : '#9ca3af',
            color: 'white', padding: '12px 24px', borderRadius: 999,
            fontWeight: 600, border: 'none', cursor: allNarrativeCompleted ? 'pointer' : 'not-allowed',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
          title={!allNarrativeCompleted ? "Completează toate capitolele narative (2,3,4,5,8,10) pentru a activa" : "Asamblează planul complet"}
        >
          📄 Asamblează planul complet
        </button>
      </div>

      {/* ── Modal Full Plan ── */}
      {showFullPlanPreview && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: 800,
            maxHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111' }}>Planul tău de afaceri</h2>
              <button onClick={() => setShowFullPlanPreview(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              <textarea
                value={fullPlanText}
                onChange={e => setFullPlanText(e.target.value)}
                style={{
                  width: '100%', minHeight: '60vh', padding: 16, borderRadius: 6, border: '1px solid #d1d5db',
                  fontSize: '1rem', lineHeight: 1.6, color: '#1f2937', fontFamily: 'inherit', resize: 'vertical'
                }}
              />
            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
              <button onClick={() => setShowFullPlanPreview(false)} style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                Închide
              </button>
              <button onClick={() => window.print()} style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: '#0f766e', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Exportă PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
        Se încarcă simularea…
      </div>
    }>
      <DashboardInner />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Layout styles
// ---------------------------------------------------------------------------

const KPI_H  = 52;   // px — height of the fixed KPI bar
const HDR_H  = 60;   // px — page header height
const SIDE_W = 224;  // px — sidebar width

const lay: Record<string, React.CSSProperties> = {
  root: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: KPI_H,
    },

  // Fixed KPI bar
  kpiBar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    height: KPI_H,
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
  },
  kpiInner: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    alignItems: 'center',
    gap: 0,
    paddingLeft: SIDE_W + 24,
    paddingRight: 24,
  },
  kpiCell: {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRight: '1px solid #f3f4f6',
    padding: '4px 12px',
  },
  kpiLabel: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 1,
  },
  kpiValue: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#111',
  },

  // Mobile chapter strip (hidden on desktop via CSS class)
  mobileStripWrapper: {
    display: 'none',          // overridden in globals.css @media
    position: 'sticky' as const,
    top: KPI_H,
    zIndex: 90,
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
  },
  mobileStrip: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto' as const,
    gap: 0,
    WebkitOverflowScrolling: 'touch' as unknown as undefined,
    scrollbarWidth: 'none' as const,
  },
  mobileChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap' as const,
    padding: '10px 16px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#6b7280',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  mobileChipActive: {
    color: ACCENT,
    borderBottomColor: ACCENT,
    fontWeight: 600,
  },

  // Page header (below KPI bar)
  pageHeader: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    /* marginTop removed for mobile fix */
    height: HDR_H,
    flexShrink: 0,
  },
  pageHeaderInner: {
    maxWidth: 'none',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: SIDE_W + 24,
    paddingRight: 24,
  },
  pageTitle: { fontSize: '1rem', fontWeight: 600, color: '#111', letterSpacing: '-0.01em' },
  pageSub:   { fontSize: '0.8125rem', color: '#6b7280', marginTop: 2 },
  backBtn:   { fontSize: '0.8125rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0' },

  // Body = sidebar + content
  body: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },

  // Sidebar wrapper
  sidebarWrapper: {
    width: SIDE_W,
    flexShrink: 0,
    position: 'sticky' as const,
    top: KPI_H + HDR_H,
    alignSelf: 'flex-start',
    height: `calc(100vh - ${KPI_H + HDR_H}px)`,
    overflowY: 'auto' as const,
    backgroundColor: '#fff',
    borderRight: '1px solid #e5e7eb',
  },

  // Sidebar nav
  sidebar: {
    padding: '20px 0 24px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
  },
  sidebarBrand: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    padding: '0 16px 12px',
  },
  sidebarList: {
    listStyle: 'none',
    flex: 1,
  },
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 16px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#374151',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left' as const,
    borderLeft: '3px solid transparent',
    transition: 'background-color 0.12s, color 0.12s',
  },
  sidebarItemActive: {
    color: ACCENT,
    borderLeftColor: ACCENT,
    fontWeight: 600,
  },
  sidebarNum: {
    color: '#9ca3af',
    fontSize: '0.75rem',
    minWidth: 16,
  },
  sidebarTitle: {
    flex: 1,
    lineHeight: 1.35,
  },

  // Legend
  legend: {
    marginTop: 'auto',
    padding: '16px 16px 0',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  legendLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },

  // Main content area
  content: {
    flex: 1,
    minWidth: 0,
    overflowX: 'hidden' as const,
  },
};

// ---------------------------------------------------------------------------
// Chapter 7 styles
// ---------------------------------------------------------------------------

const ch7: Record<string, React.CSSProperties> = {
  wrap:     { padding: '28px 28px 48px', maxWidth: 960, margin: '0 auto' },
  panelFull: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28, marginBottom: 24 },
  grid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' },
  panel:    { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28 },
  panelTitle: { fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 20 },
  menuStats: { display: 'flex', gap: 32, marginTop: 12, fontSize: '0.875rem', color: '#374151' },
  hint:     { fontSize: '0.75rem', color: '#9ca3af', marginTop: 4, fontStyle: 'italic' },
  cards:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
  marjaRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 20 },
  marjaLabel:  { fontSize: '0.875rem', fontWeight: 500, color: '#374151' },
  marjaBadge:  { fontSize: '0.875rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999 },
  alertsSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  alertsTitle:   { fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 },

  // Tab bar
  tabBar: {
    display: 'flex',
    overflowX: 'auto' as const,
    gap: 0,
    borderBottom: '2px solid #e5e7eb',
    marginBottom: 24,
    scrollbarWidth: 'none' as const,
    WebkitOverflowScrolling: 'touch' as unknown as undefined,
  },
  tabBtn: {
    flexShrink: 0,
    padding: '10px 20px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#6b7280',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
    transition: 'color 0.12s',
  },
  tabBtnActive: {
    color: ACCENT,
    borderBottom: `2px solid ${ACCENT}`,
    fontWeight: 600,
  },

  // Verdict strip (always visible above tabs)
  verdictStrip: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  verdictTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
  verdictAlerts: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
};

// ---------------------------------------------------------------------------
// Cash-flow indicators styles (cf)
// ---------------------------------------------------------------------------

const cf: Record<string, React.CSSProperties> = {
  indicatorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 16,
  },
  indCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '16px 18px',
  },
  indLabel: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 6,
  },
  indValue: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: '#111',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    marginBottom: 6,
  },
  indUnit: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#6b7280',
  },
  indSub: {
    fontSize: '0.6875rem',
    color: '#9ca3af',
    lineHeight: 1.4,
  },
};

// ---------------------------------------------------------------------------
// Placeholder styles
// ---------------------------------------------------------------------------

const ph: Record<string, React.CSSProperties> = {
  wrap:    { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, padding: '60px 32px', textAlign: 'center' },
  iconWrap:{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  icon:    { fontSize: '1.75rem' },
  title:   { fontSize: '1.125rem', fontWeight: 600, color: '#111', letterSpacing: '-0.01em', marginBottom: 8 },
  sub:     { fontSize: '0.8125rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 16 },
  desc:    { fontSize: '0.875rem', color: '#6b7280', maxWidth: 380, lineHeight: 1.6 },
};

// ---------------------------------------------------------------------------
// Slider / card / alert / chart styles (sl)
// ---------------------------------------------------------------------------

const sl: Record<string, React.CSSProperties> = {
  sliderBlock:  { marginBottom: 28 },
  sliderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  sliderLabel:  { fontSize: '0.9rem', fontWeight: 500, color: '#111' },
  sliderValue:  { fontSize: '0.9rem', fontWeight: 700, color: ACCENT },
  trackWrap:    { position: 'relative', height: 22, display: 'flex', alignItems: 'center' },
  trackRail:    { position: 'absolute', left: 0, right: 0, height: 6, backgroundColor: '#e5e7eb', borderRadius: 999, pointerEvents: 'none' },
  trackFill:    { position: 'absolute', top: '50%', left: 0, height: 6, transform: 'translateY(-50%)', backgroundColor: ACCENT, borderRadius: 999, pointerEvents: 'none' },
  rangeInput:   { position: 'relative', width: '100%', height: 22, margin: 0, padding: 0, background: 'transparent', zIndex: 1 },
  trackEnds:    { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginTop: 6 },

  card:            { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' },
  cardAccent:      { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  cardLabel:       { fontSize: '0.75rem', color: '#6b7280', marginBottom: 6, fontWeight: 500 },
  cardValue:       { fontSize: '1.25rem', fontWeight: 700, color: '#111', letterSpacing: '-0.02em' },
  cardValueAccent: { color: ACCENT },

  alert:    { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 8, borderWidth: '1px', borderStyle: 'solid', fontSize: '0.8125rem', lineHeight: 1.5 },
  alertDot: { display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor', flexShrink: 0, marginTop: 5 },

  chartPanel:  { marginTop: 24, backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 28px 16px' },
  chartTitle:  { fontSize: '0.875rem', fontWeight: 600, color: '#111', letterSpacing: '-0.01em', marginBottom: 16 },
  chartLegend: { fontSize: '0.75rem', color: '#9ca3af', marginTop: 10 },
};

// ---------------------------------------------------------------------------
// Menu table styles (t)
// ---------------------------------------------------------------------------

const t: Record<string, React.CSSProperties> = {
  tableWrap: { overflowX: 'auto' as const },
  table:     { width: '100%', minWidth: 500, borderCollapse: 'collapse' as const, fontSize: '0.875rem' },
  thLeft:    { textAlign: 'left' as const,  padding: '0 8px 10px 0', fontWeight: 600, fontSize: '0.75rem', color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
  thRight:   { textAlign: 'right' as const, padding: '0 8px 10px',   fontWeight: 600, fontSize: '0.75rem', color: '#6b7280', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' as const },
  thDel:     { padding: '0 0 10px', borderBottom: '1px solid #e5e7eb', width: 28 },
  tr:        { borderBottom: '1px solid #f3f4f6' },
  tdLeft:    { padding: '7px 8px 7px 0', verticalAlign: 'middle' as const },
  tdRight:   { padding: '7px 8px',       verticalAlign: 'middle' as const, textAlign: 'right' as const },
  tdDel:     { padding: '7px 0',         verticalAlign: 'middle' as const, textAlign: 'center' as const },
  inputText: { width: '100%', minWidth: 100, border: 'none', outline: 'none', fontSize: '0.875rem', color: '#111', fontFamily: 'inherit', backgroundColor: 'transparent', padding: '2px 0' },
  inputNum:  { width: 68, border: 'none', outline: 'none', textAlign: 'right' as const, fontSize: '0.875rem', color: '#111', fontFamily: 'inherit', backgroundColor: 'transparent', padding: '2px 0', appearance: 'none' as const, WebkitAppearance: 'none' as const },
  mixWarn:   { fontSize: '0.75rem', color: '#9ca3af', marginTop: 8, fontStyle: 'italic' },
  addBtn:    { marginTop: 12, fontSize: '0.8125rem', fontWeight: 600, background: 'none', border: 'none', fontFamily: 'inherit', padding: '4px 0' },
  delBtn:    { background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: '1.1rem', lineHeight: 1, padding: '2px 4px', borderRadius: 4, fontFamily: 'inherit' },
};

// ---------------------------------------------------------------------------
// Cheltuieli table styles (cc)
// ---------------------------------------------------------------------------

const cc: Record<string, React.CSSProperties> = {
  tableWrap:     { overflowX: 'auto' as const },
  table:         { width: '100%', minWidth: 500, borderCollapse: 'collapse' as const, fontSize: '0.875rem' },
  thCat:         { width: 12, padding: '0 0 10px', borderBottom: '1px solid #e5e7eb' },
  thLeft:        { textAlign: 'left' as const,  padding: '0 8px 10px', fontWeight: 600, fontSize: '0.75rem', color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
  thRight:       { textAlign: 'right' as const, padding: '0 8px 10px', fontWeight: 600, fontSize: '0.75rem', color: '#6b7280', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' as const },
  thDel:         { width: 28, padding: '0 0 10px', borderBottom: '1px solid #e5e7eb' },
  trCatHeader:   { backgroundColor: '#f9fafb' },
  catHeaderCell: { padding: '8px 8px 6px', fontWeight: 600, fontSize: '0.75rem', color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' },
  tr:            { borderBottom: '1px solid #f3f4f6' },
  tdCat:         { width: 12, borderLeft: `3px solid ${ACCENT}`, borderRadius: 0 },
  tdLeft:        { padding: '7px 8px', verticalAlign: 'middle' as const },
  tdRight:       { padding: '7px 8px', verticalAlign: 'middle' as const, textAlign: 'right' as const },
  tdDel:         { padding: '7px 0',   verticalAlign: 'middle' as const, textAlign: 'center' as const, width: 28 },
  trSubtotal:    { backgroundColor: '#fafafa', borderBottom: '2px solid #e5e7eb' },
  tdSubtotal:    { padding: '5px 8px', verticalAlign: 'middle' as const },
  trTotal:       { borderTop: '2px solid #374151' },
  tdTotal:       { padding: '10px 8px', fontWeight: 700, fontSize: '0.875rem', color: '#111', verticalAlign: 'middle' as const },
  inputText:     { width: '100%', minWidth: 120, border: 'none', outline: 'none', fontSize: '0.875rem', color: '#111', fontFamily: 'inherit', backgroundColor: 'transparent', padding: '2px 0' },
  inputNum:      { width: 72, border: 'none', outline: 'none', textAlign: 'right' as const, fontSize: '0.875rem', color: '#111', fontFamily: 'inherit', backgroundColor: 'transparent', padding: '2px 0', appearance: 'none' as const, WebkitAppearance: 'none' as const },
  unit:          { fontSize: '0.75rem', color: '#9ca3af', minWidth: 22 },
  select:        { border: 'none', outline: 'none', fontSize: '0.8125rem', color: '#374151', fontFamily: 'inherit', backgroundColor: 'transparent', cursor: 'pointer', padding: '2px 4px' },
  delBtn:        { background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: '1.1rem', lineHeight: 1, padding: '2px 4px', borderRadius: 4, fontFamily: 'inherit' },
  addBtn:        { marginTop: 12, fontSize: '0.8125rem', fontWeight: 600, background: 'none', border: 'none', fontFamily: 'inherit', padding: '4px 0' },
};

// ---------------------------------------------------------------------------
// Stocuri table styles (sk)
// ---------------------------------------------------------------------------

const sk: Record<string, React.CSSProperties> = {
  explainer: { fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', marginBottom: 16 },
  tableWrap: { overflowX: 'auto' as const },
  table:     { width: '100%', minWidth: 500, borderCollapse: 'collapse' as const, fontSize: '0.875rem' },
  thLeft:    { textAlign: 'left' as const,  padding: '0 8px 10px 0', fontWeight: 600, fontSize: '0.75rem', color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
  thRight:   { textAlign: 'right' as const, padding: '0 8px 10px',   fontWeight: 600, fontSize: '0.75rem', color: '#6b7280', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' as const },
  thDel:     { width: 28, padding: '0 0 10px', borderBottom: '1px solid #e5e7eb' },
  tr:        { borderBottom: '1px solid #f3f4f6' },
  tdLeft:    { padding: '7px 8px 7px 0', verticalAlign: 'middle' as const },
  tdRight:   { padding: '7px 8px',       verticalAlign: 'middle' as const, textAlign: 'right' as const },
  tdDel:     { padding: '7px 0',         verticalAlign: 'middle' as const, textAlign: 'center' as const },
  inputText: { width: '100%', minWidth: 120, border: 'none', outline: 'none', fontSize: '0.875rem', color: '#111', fontFamily: 'inherit', backgroundColor: 'transparent', padding: '2px 0' },
  inputNum:  { width: 52, border: 'none', outline: 'none', textAlign: 'right' as const, fontSize: '0.875rem', color: '#111', fontFamily: 'inherit', backgroundColor: 'transparent', padding: '2px 0', appearance: 'none' as const, WebkitAppearance: 'none' as const },
  unit:      { fontSize: '0.75rem', color: '#9ca3af', marginLeft: 2 },
  delBtn:    { background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: '1.1rem', lineHeight: 1, padding: '2px 4px', borderRadius: 4, fontFamily: 'inherit' },
  addBtn:    { marginTop: 12, fontSize: '0.8125rem', fontWeight: 600, background: 'none', border: 'none', fontFamily: 'inherit', padding: '4px 0' },
  summary:      { display: 'flex', gap: 32, marginTop: 16, padding: '14px 16px', backgroundColor: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', flexWrap: 'wrap' as const },
  summaryItem:  { display: 'flex', flexDirection: 'column' as const, gap: 2 },
  summaryLabel: { fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 },
  summaryValue: { fontSize: '1rem', fontWeight: 700, color: '#111', letterSpacing: '-0.01em' },
};

// ---------------------------------------------------------------------------
// Sensibilitate styles (sens)
// ---------------------------------------------------------------------------

const sens: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 24,
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '24px 28px 20px',
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#111',
    letterSpacing: '-0.01em',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginBottom: 20,
    lineHeight: 1.5,
  },
  tableWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '180px 1fr 140px 72px',
    alignItems: 'center',
    gap: 12,
  },
  nameCell: {
    minWidth: 0,
  },
  varName: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#374151',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    display: 'block',
  },
  barCell: {
    minWidth: 0,
  },
  barRail: {
    height: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    overflow: 'hidden' as const,
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    transition: 'width 0.35s ease',
  },
  impactCell: {
    textAlign: 'right' as const,
  },
  impactText: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums' as const,
  },
  labelCell: {
    textAlign: 'right' as const,
  },
  badge: {
    display: 'inline-block',
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    padding: '2px 8px',
    borderRadius: 999,
  },
  conclusion: {
    marginTop: 20,
    padding: '12px 16px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 8,
    fontSize: '0.875rem',
    color: '#166534',
    lineHeight: 1.5,
  },
};
