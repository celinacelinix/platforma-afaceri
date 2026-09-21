'use client';

import React, { useState, useEffect } from 'react';

type DescriereState = {
  concept_tip: string;
  concept_personalizat: string;
  public_tinta: string[];
  public_personalizat: string;
  diferentiator: string[];
  diferentiator_personalizat: string;
  text_generat: string;
  text_final: string;
  status: 'none' | 'generat' | 'verificat';
};

interface Capitol2GhidatProps {
  nr: number;
  title: string;
  state: any;
  rez: any;
  descriere: DescriereState;
  onChangeDescriere: (desc: DescriereState) => void;
  onComplete?: (status: boolean) => void;
}

const PRESET_CONCEPTS = [
  'Bistro / Casual Dining',
  'Fast-Casual / Street Food',
  'Cafenea & Brunch',
  'Fine Dining',
  'Pizzerie / Trattoria',
  'Alt concept / Personalizat'
];

const PRESET_PUBLIC = [
  'Tineri / Studenți',
  'Familii',
  'Corporate / Lunch',
  'Turiști',
  'Altul'
];

const PRESET_DIFERENTIATOR = [
  'Preț accesibil',
  'Ingrediente locale/bio',
  'Viteză de servire',
  'Atmosferă & Design',
  'Altul'
];

export default function Capitol2Ghidat({ nr, title, state, rez, descriere, onChangeDescriere, onComplete }: Capitol2GhidatProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isCompleted = descriere.status === 'verificat';
  
  let headerColor = '#111827';
  if (isCompleted) headerColor = '#0f766e';
  else if (descriere.status === 'generat') headerColor = '#ca8a04';

  // Sincronizare onComplete către părinte
  useEffect(() => {
    onComplete?.(isCompleted);
  }, [isCompleted]);

  // Colapsare automată DOAR la trecerea în verificat
  useEffect(() => {
    if (isCompleted) {
      setIsExpanded(false);
    }
  }, [isCompleted]);

  const updateDesc = (updates: Partial<DescriereState>) => {
    const newDesc = { ...descriere, ...updates };
    onChangeDescriere(newDesc);
    if (newDesc.text_final) {
      localStorage.setItem(`plan_cap_${nr}_text`, newDesc.text_final);
    }
  };

  const togglePublic = (p: string) => {
    const arr = Array.isArray(descriere.public_tinta) ? descriere.public_tinta : [];
    if (arr.includes(p)) updateDesc({ public_tinta: arr.filter(x => x !== p) });
    else updateDesc({ public_tinta: [...arr, p] });
  };

  const toggleDif = (d: string) => {
    const arr = Array.isArray(descriere.diferentiator) ? descriere.diferentiator : [];
    if (arr.includes(d)) updateDesc({ diferentiator: arr.filter(x => x !== d) });
    else updateDesc({ diferentiator: [...arr, d] });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/genereaza-descriere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domeniu: state.domeniu,
          tip_afacere: state.tip_afacere,
          localitate: state.localitate,
          optiuni: descriere
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Eroare la generare');
      updateDesc({ text_generat: data.text, text_final: data.text, status: 'generat' });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
      <div 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: headerColor, margin: 0 }}>
          {nr}. {title} {isCompleted && '✓'}
        </h2>
      </div>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
          
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
              Conceptul afacerii
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PRESET_CONCEPTS.map(c => (
                <button
                  key={c}
                  onClick={() => updateDesc({ concept_tip: c })}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: '1px solid',
                    backgroundColor: descriere.concept_tip === c ? '#0f766e' : '#fff',
                    color: descriere.concept_tip === c ? '#fff' : '#4b5563',
                    borderColor: descriere.concept_tip === c ? '#0f766e' : '#d1d5db',
                    cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {descriere.concept_tip === 'Alt concept / Personalizat' && (
            <div>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '8px', color: '#4b5563', fontSize: '0.875rem' }}>
                Descrie pe scurt ideea ta:
              </label>
              <input
                type="text"
                value={descriere.concept_personalizat}
                onChange={e => updateDesc({ concept_personalizat: e.target.value })}
                placeholder="ex: local vegetarian axat pe prânz și livrări corporate"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '0.9rem' }}>
                Public țintă
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {PRESET_PUBLIC.map(p => {
                  const isSel = Array.isArray(descriere.public_tinta) && descriere.public_tinta.includes(p);
                  return (
                  <button
                    key={p}
                    onClick={() => togglePublic(p)}
                    style={{
                      padding: '6px 12px', borderRadius: '16px', border: '1px solid',
                      backgroundColor: isSel ? '#0f766e' : '#fff',
                      color: isSel ? '#fff' : '#4b5563',
                      borderColor: isSel ? '#0f766e' : '#e5e7eb',
                      cursor: 'pointer', fontSize: '0.8125rem'
                    }}
                  >
                    {p}
                  </button>
                )})}
              </div>
              {Array.isArray(descriere.public_tinta) && descriere.public_tinta.includes('Altul') && (
                <input
                  type="text"
                  value={descriere.public_personalizat || ''}
                  onChange={e => updateDesc({ public_personalizat: e.target.value })}
                  placeholder="ex: Mame cu copii mici"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', marginTop: '8px' }}
                />
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#374151', fontSize: '0.9rem' }}>
                Diferențiator
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {PRESET_DIFERENTIATOR.map(d => {
                  const isSel = Array.isArray(descriere.diferentiator) && descriere.diferentiator.includes(d);
                  return (
                  <button
                    key={d}
                    onClick={() => toggleDif(d)}
                    style={{
                      padding: '6px 12px', borderRadius: '16px', border: '1px solid',
                      backgroundColor: isSel ? '#0f766e' : '#fff',
                      color: isSel ? '#fff' : '#4b5563',
                      borderColor: isSel ? '#0f766e' : '#e5e7eb',
                      cursor: 'pointer', fontSize: '0.8125rem'
                    }}
                  >
                    {d}
                  </button>
                )})}
              </div>
              {Array.isArray(descriere.diferentiator) && descriere.diferentiator.includes('Altul') && (
                <input
                  type="text"
                  value={descriere.diferentiator_personalizat || ''}
                  onChange={e => updateDesc({ diferentiator_personalizat: e.target.value })}
                  placeholder="ex: Design spectaculos instagramabil"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', marginTop: '8px' }}
                />
              )}
            </div>
          </div>

          <div>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !descriere.concept_tip}
              style={{
                padding: '10px 20px', borderRadius: '6px', border: 'none',
                backgroundColor: isLoading || !descriere.concept_tip ? '#9ca3af' : '#0f766e',
                color: '#fff', cursor: isLoading || !descriere.concept_tip ? 'not-allowed' : 'pointer',
                fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {isLoading ? 'Se generează...' : '✨ Generează descrierea cu AI'}
            </button>
            {errorMsg && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '8px' }}>{errorMsg}</p>}
          </div>

          {(descriere.status === 'generat' || descriere.status === 'verificat') && (
            <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Rezultat narativ</h3>
                <span style={{ 
                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                  backgroundColor: descriere.status === 'verificat' ? '#dcfce7' : '#fef9c3',
                  color: descriere.status === 'verificat' ? '#166534' : '#854d0e'
                }}>
                  {descriere.status === 'verificat' ? '✓ Confirmat' : 'Estimat AI'}
                </span>
              </div>
              
              <textarea
                value={descriere.text_final}
                onChange={(e) => updateDesc({ text_final: e.target.value })}
                style={{
                  width: '100%', minHeight: '180px', padding: '16px', borderRadius: '8px',
                  border: '1px solid #d1d5db', fontSize: '0.95rem', lineHeight: 1.5,
                  fontFamily: 'inherit', resize: 'vertical'
                }}
              />
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={() => updateDesc({ status: 'verificat' })}
                  style={{
                    padding: '8px 16px', borderRadius: '6px', border: 'none',
                    backgroundColor: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  Salvează modificările
                </button>
                <button
                  onClick={handleGenerate}
                  style={{
                    padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db',
                    backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 500
                  }}
                >
                  Regenerează
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {!isExpanded && isCompleted && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#166534', fontWeight: 600, fontSize: '0.9rem' }}>✓ Conținut salvat</span>
            <button
              onClick={() => setIsExpanded(true)}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db',
                backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem'
              }}
            >
              Editează din nou
            </button>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
            {descriere.text_final}
          </p>
        </div>
      )}
    </div>
  );
}
