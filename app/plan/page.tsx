'use client';

import React, { useState, useEffect } from 'react';
import Capitol, { FieldDef, ParagrafText } from '../components/Capitol';

const MOCK_STATE = {
  domeniu: "Bistro italian",
  localitate: "București",
  tip_zona: "Centrală",
  suprafata_mp: 120,
  locuri: 40,
  angajati: 5,
  capital_initial: 150000,
  program: "Luni-Duminică 10:00-22:00",
  buget_marketing: 2000,
  tier: "urban",
  zile_lucrate: 30,
  capital_blocat: 10000,
  termen_plata: 15,
  luni_acoperire: 3,
  pret_mediu: 45,
  unitate_volum: "client",
  model_venit: "vânzare directă"
};

const MOCK_REZ = {
  venit_lunar: 85000,
  profit_net: 15000,
  marja_profit_net: 17.6,
  luni_recuperare: 10,
  sensibilitate: 3, 
  plafon_fizic: 120,
  populatie: 2000000,
  locuitori_per_concurent: 15000,
  clienti_zi: 80,
  cost_personal: 25000,
  rotatii: 3,
  investitie: 150000,
  prag_rupere: 45,
  cash_minim: 5000
};

function asambleazaCap2(fields: any, state: any, rez: any): ParagrafText[] {
  return [
    {
      titlu: "Prezentare generală",
      text: `Unitatea propusă, ${fields.concept || '[concept]'}, urmează să își desfășoare activitatea în ${state.localitate}, adresându-se cu precădere ${fields.clienti || '[clienti]'}. Programul de funcționare stabilit este ${fields.program || '[program]'}.`
    },
    {
      titlu: "Poziționare și diferențiere",
      text: `Pe piața locală, ${state.domeniu} se diferențiază prin ${fields.diferentiatori || '[diferentiatori]'}.\nSpațiul de ${state.suprafata_mp} mp, cu o capacitate de ${state.locuri} locuri, permite servirea a până la ${rez.plafon_fizic} clienți pe zi.`
    },
    {
      titlu: "Model de venit",
      text: `Modelul de venit se bazează pe ${state.model_venit}, cu un preț mediu estimat de ${state.pret_mediu} lei per ${state.unitate_volum}.\nLa parametrii proiectați, unitatea estimează un venit lunar de ${rez.venit_lunar} lei.`
    }
  ];
}

function asambleazaCap3(fields: any, state: any, rez: any): ParagrafText[] {
  return [
    {
      titlu: "Caracteristicile pieței locale",
      text: `Municipiul/Orașul ${state.localitate} numără aproximativ ${rez.populatie} locuitori, cu o densitate comercială de ${rez.sensibilitate} unități similare în raza de acțiune. Raportul de ${rez.locuitori_per_concurent} locuitori per unitate indică o piață cu potențial de creștere.`
    },
    {
      titlu: "Amplasament și trafic",
      text: `${fields.zona || '[descriere_zona]'}. Tipul de zonă (${state.tip_zona}) prezintă caracteristici de trafic specifice, cu un flux constant de potențiali clienți.`
    },
    {
      titlu: "Estimarea cererii",
      text: `Pe baza observațiilor de teren, ${fields.observatii_concurenta || '[observatii_concurenta]'}.\nNumărul de clienți estimat zilnic este de ${rez.clienti_zi}, determinat prin ${fields.estimare_clienti || '[cum_ai_estimat]'}.`
    }
  ];
}

function asambleazaCap4(fields: any, state: any, rez: any): ParagrafText[] {
  return [
    {
      titlu: "Peisajul competitiv",
      text: `În zona vizată au fost identificate ${rez.sensibilitate} unități cu activitate similară. Principalii competitori sunt: ${fields.concurenti_principali || '[lista_concurenti]'}.`
    },
    {
      titlu: "Analiza punctelor slabe",
      text: `Analiza concurenței relevă următoarele oportunități: ${fields.puncte_slabe || '[puncte_slabe]'}.`
    },
    {
      titlu: "Răspuns strategic",
      text: `Față de aceste aspecte, ${state.domeniu} răspunde prin: ${fields.raspuns_strategic || '[raspuns_puncte_slabe]'}, creând astfel o diferențiere clară față de oferta existentă.`
    }
  ];
}

function asambleazaCap5(fields: any, state: any, rez: any): ParagrafText[] {
  return [
    {
      titlu: "Programul de funcționare și fluxul zilnic",
      text: `${fields.zi_tipica || '[zi_tipica]'}. Unitatea funcționează ${state.zile_lucrate} zile pe lună, cu o capacitate de ${state.locuri} locuri și ${rez.rotatii} rotații estimate pe zi.`
    },
    {
      titlu: "Structura de personal",
      text: `Echipa este formată din ${state.angajati} angajați, cu un cost salarial lunar total de ${rez.cost_personal} lei.\nOrganizarea turelor: ${fields.ture || '[organizare_ture]'}.`
    },
    {
      titlu: "Aprovizionare și stocuri",
      text: `Principalii furnizori: ${fields.furnizori || '[furnizori]'}. \nStocul mediu blocat reprezintă ${state.capital_blocat} lei, cu un termen mediu de plată furnizori de ${state.termen_plata} zile.`
    },
    {
      titlu: "Riscuri operaționale și măsuri de diminuare",
      text: `Principalele riscuri identificate: ${fields.riscuri || '[riscuri]'}. \nCapitalul de lucru asigurat acoperă ${state.luni_acoperire} luni de cheltuieli fixe.`
    }
  ];
}

export default function PlanAfaceriPage() {
  const [completate, setCompletate] = useState<Record<number, boolean>>({});
  const [isPlanAsamblat, setIsPlanAsamblat] = useState(false);
  const [rezumat1, setRezumat1] = useState("");
  const [sugestiiRamase, setSugestiiRamase] = useState(30);

  useEffect(() => {
    const updateSugestii = () => {
      const saved = localStorage.getItem('ai_sugestii_ramase');
      if (saved !== null) {
        setSugestiiRamase(parseInt(saved, 10));
      }
    };
    updateSugestii();
    window.addEventListener('ai_sugestii_updated', updateSugestii);
    return () => window.removeEventListener('ai_sugestii_updated', updateSugestii);
  }, []);

  const handleComplete = (nr: number, status: boolean) => {
    setCompletate(prev => ({ ...prev, [nr]: status }));
  };

  const isGataPtAsamblare = [2,3,4,5,6,7].every(nr => completate[nr]);

  const handleAsambleazaPlan = () => {
    setIsPlanAsamblat(true);
    let extraAvertisment = "";
    if (MOCK_REZ.cash_minim < 0) {
      extraAvertisment = `Atenție: proiecțiile indică un deficit de lichiditate în prima parte a anului. Se recomandă consolidarea capitalului de lucru.`;
    }
    setRezumat1(`Prezentul plan de afaceri descrie înființarea unei unități de tip ${MOCK_STATE.domeniu}, cu sediul în ${MOCK_STATE.localitate}.
Investiția totală necesară este de ${MOCK_REZ.investitie} lei, finanțată din surse proprii în valoare de ${MOCK_STATE.capital_initial} lei.
Unitatea estimează un venit lunar de ${MOCK_REZ.venit_lunar} lei, cu un profit net de ${MOCK_REZ.profit_net} lei (${MOCK_REZ.marja_profit_net}% marjă netă).
Pragul de rentabilitate este atins la ${MOCK_REZ.prag_rupere} ${MOCK_STATE.unitate_volum}, față de estimarea de ${MOCK_REZ.clienti_zi} ${MOCK_STATE.unitate_volum} planificați.
Recuperarea investiției este estimată în ${MOCK_REZ.luni_recuperare} luni de la deschidere.
${extraAvertisment}`);
  };

  const cap2Fields: FieldDef[] = [
    { id: 'concept', label: 'Descrie conceptul afacerii tale', placeholder: 'ex. Un bistro cu specific italian, mâncare proaspătă, atmosferă caldă', aiConfig: { tip: 'concept', afacere: MOCK_STATE.domeniu, localitate: MOCK_STATE.localitate } },
    { id: 'clienti', label: 'Cine sunt clienții tăi principali?', placeholder: 'ex. Familii și profesioniști 25-45 ani din zona centrală', aiConfig: { tip: 'clienti', afacere: MOCK_STATE.domeniu, localitate: MOCK_STATE.localitate, tier: MOCK_STATE.tier } },
    { id: 'program', label: 'Care e programul de funcționare?', placeholder: 'ex. Luni-Duminică 11:00-22:00, inclusiv sărbători legale' },
    { id: 'diferentiatori', label: 'Prin ce te diferențiezi de concurență?', placeholder: 'ex. Singurul cu livrare în 30 min, meniu sezonier rotativ', aiConfig: { tip: 'diferentiatori', afacere: MOCK_STATE.domeniu, localitate: MOCK_STATE.localitate, nr_concurenti: MOCK_REZ.sensibilitate } }
  ];

  const cap3Fields: FieldDef[] = [
    { id: 'zona', label: 'Descrie zona și amplasamentul', placeholder: 'ex. Stradă comercială centrală, trafic pietonal intens în weekend', aiConfig: { tip: 'zona', tip_zona: MOCK_STATE.tip_zona, localitate: MOCK_STATE.localitate } },
    { id: 'observatii_concurenta', label: 'Ce ai observat la concurență când ai vizitat zona?', placeholder: 'ex. Cozi la orele de vârf, meniu limitat, fără opțiuni vegetariene', aiConfig: { tip: 'observatii_concurenta', afacere: MOCK_STATE.domeniu, localitate: MOCK_STATE.localitate } },
    { id: 'estimare_clienti', label: 'Cum ai estimat numărul de clienți pe zi?', placeholder: 'ex. Am stat 1h la concurență și am numărat ~40 persoane/h' }
  ];

  const cap4Fields: FieldDef[] = [
    { id: 'concurenti_principali', label: 'Listează concurenții principali (unul per rând)', placeholder: 'Restaurant X — centru — preț mediu 45 lei\nBistro Y — cartier — preț mediu 35 lei', aiConfig: { tip: 'concurenti_tipici', afacere: MOCK_STATE.domeniu, localitate: MOCK_STATE.localitate } },
    { id: 'puncte_slabe', label: 'Care sunt punctele slabe ale concurenților tăi?', placeholder: 'ex. Serviciu lent, meniu static, fără prezență online', aiConfig: { tip: 'puncte_slabe', afacere: MOCK_STATE.domeniu, localitate: MOCK_STATE.localitate, nr_concurenti: MOCK_REZ.sensibilitate } },
    { id: 'raspuns_strategic', label: 'Cum răspunzi tu la aceste puncte slabe?', placeholder: 'ex. Personal instruit în serviciu rapid, meniu actualizat lunar', aiConfig: { tip: 'raspuns_puncte_slabe', afacere: MOCK_STATE.domeniu } }
  ];

  const cap5Fields: FieldDef[] = [
    { id: 'zi_tipica', label: 'Descrie o zi tipică de funcționare', placeholder: 'ex. 8:00 aprovizionare, 10:00 pregătire, 11:00 deschidere...', aiConfig: { tip: 'zi_tipica', afacere: MOCK_STATE.domeniu, program: MOCK_STATE.program } },
    { id: 'ture', label: 'Cum organizezi turele de personal?', placeholder: 'ex. 2 ture: 10-16 și 16-22, overlap 1h pentru predare', aiConfig: { tip: 'ture', nr_angajati: MOCK_STATE.angajati, program: MOCK_STATE.program } },
    { id: 'furnizori', label: 'Cine sunt furnizorii tăi principali?', placeholder: 'ex. Metro pentru uscat, distribuitor local pentru carne și legume' },
    { id: 'riscuri', label: 'Care sunt principalele riscuri operaționale?', placeholder: 'ex. Dependența de un singur furnizor de carne, fluctuația personalului', aiConfig: { tip: 'riscuri_operationale', afacere: MOCK_STATE.domeniu } }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Plan de Afaceri</h1>
            <p style={{ color: '#4b5563' }}>Completează capitolele narative pentru a genera planul final.</p>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', color: '#0f766e', border: '1px solid #99f6e4', fontWeight: 600 }}>
            {sugestiiRamase} sugestii rămase
          </div>
        </div>

        {isPlanAsamblat ? (
          <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Plan de Afaceri - {MOCK_STATE.domeniu}</h1>
            
            <h2 style={{ fontSize: '1.5rem', marginTop: '24px', marginBottom: '16px', color: '#0f766e' }}>1. Rezumat Executiv</h2>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: '32px' }}>{rezumat1}</p>
            
            {/* Aici am putea reda continutul din localStorage ptr celelalte capitole, 
                dar pe scurt afisam un mesaj de succes */}
            <div style={{ padding: '20px', backgroundColor: '#f0fdfa', borderRadius: '8px', border: '1px solid #99f6e4' }}>
              <p style={{ color: '#0f766e', fontWeight: 600, textAlign: 'center' }}>🎉 Planul complet a fost asamblat cu succes! Aceasta este o previzualizare.</p>
            </div>
            <button 
              onClick={() => setIsPlanAsamblat(false)}
              style={{ marginTop: '24px', backgroundColor: '#f3f4f6', color: '#4b5563', padding: '10px 20px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer' }}
            >
              Înapoi la editare
            </button>
          </div>
        ) : (
          <>
            <Capitol nr={2} title="Descrierea afacerii" fields={cap2Fields} state={MOCK_STATE} rez={MOCK_REZ} onAssemble={asambleazaCap2} onComplete={(s) => handleComplete(2, s)} />
            <Capitol nr={3} title="Piața și locația" fields={cap3Fields} state={MOCK_STATE} rez={MOCK_REZ} onAssemble={asambleazaCap3} onComplete={(s) => handleComplete(3, s)} />
            <Capitol nr={4} title="Analiza concurenței" fields={cap4Fields} state={MOCK_STATE} rez={MOCK_REZ} onAssemble={asambleazaCap4} onComplete={(s) => handleComplete(4, s)} />
            <Capitol nr={5} title="Plan operațional" fields={cap5Fields} state={MOCK_STATE} rez={MOCK_REZ} onAssemble={asambleazaCap5} onComplete={(s) => handleComplete(5, s)} />
            
            <Capitol nr={6} title="Autorizații" state={MOCK_STATE} rez={MOCK_REZ} onComplete={(s) => handleComplete(6, s)}>
              <Capitol6Tabel onChange={() => handleComplete(6, true)} />
            </Capitol>
            
            <Capitol nr={7} title="Plan financiar" state={MOCK_STATE} rez={MOCK_REZ} isAutoGenerated onComplete={(s) => handleComplete(7, s)}>
              <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                Acest capitol este pre-completat din simulările financiare.
              </div>
            </Capitol>
            
            <Capitol nr={8} title="Marketing" state={MOCK_STATE} rez={MOCK_REZ}>
              <Capitol8Marketing state={MOCK_STATE} />
            </Capitol>

            <div style={{ marginTop: '32px', textAlign: 'center', position: 'sticky', bottom: '24px' }}>
              <button
                onClick={handleAsambleazaPlan}
                disabled={!isGataPtAsamblare}
                style={{
                  backgroundColor: isGataPtAsamblare ? '#0f766e' : '#9ca3af',
                  color: 'white', padding: '16px 32px', borderRadius: '32px',
                  fontWeight: 700, border: 'none', cursor: isGataPtAsamblare ? 'pointer' : 'not-allowed',
                  fontSize: '1.1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                📄 Generare PDF
              </button>
              {!isGataPtAsamblare && <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '8px' }}>Completează capitolele 2-6 pentru a asambla planul.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Capitol6Tabel({ onChange }: { onChange: () => void }) {
  const defaultAuths = [
    { id: 1, doc: 'Înființare firmă (ONRC)', emitent: 'ONRC', cost: 600, durata: 3, obligatoriu: 'Da', status: 'Obținut' },
    { id: 2, doc: 'Autorizație sanitar-veterinară', emitent: 'DSVSA', cost: 800, durata: 30, obligatoriu: 'Da', status: 'În curs' },
    { id: 3, doc: 'Autorizație de funcționare', emitent: 'Primărie', cost: 1200, durata: 45, obligatoriu: 'Da', status: 'Neînceput' },
  ];
  
  const [auths, setAuths] = useState(defaultAuths);

  useEffect(() => {
    const s = localStorage.getItem('cap_6_tabel');
    if (s) setAuths(JSON.parse(s));
    onChange();
  }, [onChange]);

  const handleChange = (id: number, status: string) => {
    const noile = auths.map(a => a.id === id ? { ...a, status } : a);
    setAuths(noile);
    localStorage.setItem('cap_6_tabel', JSON.stringify(noile));
    onChange();
  };

  const colors: Record<string, string> = {
    'Neînceput': '#f3f4f6',
    'În curs': '#fef08a',
    'Obținut': '#bbf7d0'
  };

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px 8px' }}>Document</th>
              <th style={{ padding: '12px 8px' }}>Emitent</th>
              <th style={{ padding: '12px 8px' }}>Cost (lei)</th>
              <th style={{ padding: '12px 8px' }}>Durată (zile)</th>
              <th style={{ padding: '12px 8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {auths.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 8px', fontWeight: 500 }}>{a.doc}</td>
                <td style={{ padding: '12px 8px', color: '#4b5563' }}>{a.emitent}</td>
                <td style={{ padding: '12px 8px' }}>{a.cost}</td>
                <td style={{ padding: '12px 8px' }}>{a.durata}</td>
                <td style={{ padding: '12px 8px' }}>
                  <select
                    value={a.status}
                    onChange={(e) => handleChange(a.id, e.target.value)}
                    style={{
                      padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db',
                      backgroundColor: colors[a.status], fontWeight: 500
                    }}
                  >
                    <option value="Neînceput">Neînceput</option>
                    <option value="În curs">În curs</option>
                    <option value="Obținut">Obținut</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '16px', fontSize: '0.9rem', color: '#374151', display: 'flex', gap: '24px' }}>
        <div><strong>Total costuri:</strong> {auths.reduce((sum, a) => sum + a.cost, 0)} lei</div>
        <div><strong>Durată estimată:</strong> {Math.max(...auths.map(a => a.durata))} zile</div>
      </div>
      <p style={{ marginTop: '16px', fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
        * Taxele variază pe primărie și se actualizează anual. Verificați sumele exacte direct la instituțiile emitente.
      </p>
    </div>
  );
}

function Capitol8Marketing({ state }: { state: any }) {
  const [idei, setIdei] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedNote = localStorage.getItem('cap_8_note');
    if (savedNote) setNote(savedNote);

    const loadIdei = async () => {
      const savedIdei = localStorage.getItem('cap_8_idei');
      if (savedIdei) {
        setIdei(JSON.parse(savedIdei));
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/sugereaza-idei', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tip_cerere: 'marketing',
            context: {
              afacere: state.domeniu,
              localitate: state.localitate,
              tier: state.tier,
              buget_marketing: state.buget_marketing
            }
          })
        });
        if (res.ok) {
          const data = await res.json();
          setIdei(data.idei);
          localStorage.setItem('cap_8_idei', JSON.stringify(data.idei));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadIdei();
  }, [state]);

  const handleNoteChange = (v: string) => {
    setNote(v);
    localStorage.setItem('cap_8_note', v);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Idei recomandate de marketing:</h3>
      {loading ? (
        <div style={{ color: '#6b7280', fontStyle: 'italic', marginBottom: '24px' }}>Se generează ideile de marketing...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {idei.map((idee, i) => (
            <div key={i} style={{ padding: '12px', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '6px', fontSize: '0.95rem' }}>
              {idee}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '24px' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Note proprii de marketing</label>
        <textarea
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="ex. Vreau să colaborez cu un influencer local..."
          style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontFamily: 'inherit' }}
        />
      </div>
      <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center' }}>
        Plan complet de marketing — disponibil în curând
      </p>
    </div>
  );
}
