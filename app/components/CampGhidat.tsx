'use client';

import React, { useState, useEffect } from 'react';

type CampGhidatProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  aiConfig?: {
    tip: string;
    [key: string]: any;
  };
};

export default function CampGhidat({ label, placeholder, value, onChange, aiConfig }: CampGhidatProps) {
  const [idei, setIdei] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sugestiiRamase, setSugestiiRamase] = useState(30);

  useEffect(() => {
    const saved = localStorage.getItem('ai_sugestii_ramase');
    if (saved !== null) {
      setSugestiiRamase(parseInt(saved, 10));
    } else {
      localStorage.setItem('ai_sugestii_ramase', '30');
    }
  }, []);

  const cereIdei = async () => {
    if (!aiConfig || sugestiiRamase <= 0 || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sugereaza-idei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tip_cerere: aiConfig.tip,
          context: aiConfig
        })
      });
      if (res.ok) {
        const data = await res.json();
        setIdei(data.idei || []);
        const nou = sugestiiRamase - 1;
        setSugestiiRamase(nou);
        localStorage.setItem('ai_sugestii_ramase', nou.toString());
        
        // Emitem eveniment pentru actualizarea contorului global (opțional, dacă e un header)
        window.dispatchEvent(new Event('ai_sugestii_updated'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const adaugaIdee = (idee: string) => {
    navigator.clipboard.writeText(idee);
    const el = document.createElement('div');
    el.innerText = 'Copiat!';
    el.style.position = 'fixed';
    el.style.bottom = '20px';
    el.style.right = '20px';
    el.style.background = '#0f766e';
    el.style.color = 'white';
    el.style.padding = '8px 16px';
    el.style.borderRadius = '4px';
    el.style.zIndex = '9999';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, text: string) => {
    e.dataTransfer.setData('text/plain', text);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontWeight: 'bold', color: '#111827', fontSize: '0.95rem' }}>{label}</label>
        {aiConfig && (
          <button
            onClick={cereIdei}
            disabled={loading || sugestiiRamase <= 0}
            style={{
              backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb',
              borderRadius: '12px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 500,
              cursor: (loading || sugestiiRamase <= 0) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            {loading ? '⏳...' : '💡 Idei'}
          </button>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', minHeight: '80px', padding: '10px 12px', borderRadius: '6px',
          border: '1px solid #d1d5db', fontSize: '0.95rem', fontFamily: 'inherit',
          resize: 'vertical'
        }}
      />

      {idei.length > 0 && (
        <div style={{
          backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '6px',
          padding: '12px', position: 'relative', marginTop: '4px'
        }}>
          <button 
            onClick={() => setIdei([])}
            style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#0f766e', fontWeight: 'bold' }}
          >
            ✕
          </button>
          <div style={{ fontSize: '0.85rem', color: '#0f766e', marginBottom: '8px', fontWeight: 500 }}>Sugestii (trage în câmp sau dă click pentru a copia):</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {idei.map((idee, i) => (
              <div
                key={i}
                draggable
                onDragStart={(e) => onDragStart(e, idee)}
                onClick={() => adaugaIdee(idee)}
                style={{
                  backgroundColor: 'white', border: '1px solid #99f6e4', padding: '8px 12px',
                  borderRadius: '4px', fontSize: '0.85rem', cursor: 'grab', color: '#111827',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)', flex: '1 1 calc(50% - 8px)', minWidth: '150px'
                }}
              >
                {idee}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
