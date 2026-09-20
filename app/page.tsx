'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FormData = {
  tip_afacere: string;
  concept: string;
  localitate: string;
  tip_zona: string;
  buget: string;
  suprafata: string;
};

const initialForm: FormData = {
  tip_afacere: '',
  concept: '',
  localitate: '',
  tip_zona: '',
  buget: '',
  suprafata: '',
};

export default function Home() {
  const [form, setForm] = useState<FormData>(initialForm);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Spune-ne despre ideea ta</h1>

        <form onSubmit={handleSubmit} noValidate>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="tip_afacere">Tip afacere</label>
            <select id="tip_afacere" name="tip_afacere" value={form.tip_afacere}
              onChange={handleChange} required style={styles.select}>
              <option value="" disabled>Selectează tipul</option>
              <option value="restaurant">Restaurant</option>
              <option value="salon">Salon</option>
              <option value="constructii">Construcții</option>
              <option value="magazin_online">Magazin online</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.labelOptional} htmlFor="concept">
              Concept <span style={styles.optional}>(opțional)</span>
            </label>
            <input id="concept" name="concept" type="text" value={form.concept}
              onChange={handleChange} placeholder="ex. bistro italian, cafenea de specialitate"
              style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="localitate">Localitate</label>
            <input id="localitate" name="localitate" type="text" value={form.localitate}
              onChange={handleChange} placeholder="ex. Cluj-Napoca" required style={styles.input} />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="tip_zona">Tip zonă</label>
            <select id="tip_zona" name="tip_zona" value={form.tip_zona}
              onChange={handleChange} required style={styles.select}>
              <option value="" disabled>Selectează zona</option>
              <option value="centru">Centru</option>
              <option value="rezidential">Cartier rezidențial</option>
              <option value="industrial">Zonă industrială</option>
              <option value="periferie">Periferie</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="buget">Buget disponibil</label>
            <div style={styles.inputWrapper}>
              <input id="buget" name="buget" type="number" value={form.buget}
                onChange={handleChange} placeholder="ex. 150000" required min={0}
                style={{ ...styles.input, ...styles.inputWithSuffix }} />
              <span style={styles.suffix}>lei</span>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.labelOptional} htmlFor="suprafata">
              Suprafață <span style={styles.optional}>(opțional)</span>
            </label>
            <div style={styles.inputWrapper}>
              <input id="suprafata" name="suprafata" type="number" value={form.suprafata}
                onChange={handleChange} placeholder="ex. 90" min={0}
                style={{ ...styles.input, ...styles.inputWithSuffix }} />
              <span style={styles.suffix}>mp</span>
            </div>
          </div>

          <button type="submit" className="btn-accent" style={styles.button}>
            Generează simularea
          </button>
        </form>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '60px 16px',
  },
  card: {
    width: '100%',
    maxWidth: 480,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#111',
    marginBottom: '2rem',
    letterSpacing: '-0.02em',
  },
  field: {
    marginBottom: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#111',
  },
  labelOptional: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#111',
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.3rem',
  },
  optional: {
    fontWeight: 400,
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  input: {
    width: '100%',
    padding: '0.625rem 0.75rem',
    fontSize: '0.9375rem',
    color: '#111',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  select: {
    width: '100%',
    padding: '0.625rem 0.75rem',
    fontSize: '0.9375rem',
    color: '#111',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    paddingRight: '2.25rem',
    cursor: 'pointer',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputWithSuffix: {
    paddingRight: '3rem',
  },
  suffix: {
    position: 'absolute',
    right: '0.75rem',
    fontSize: '0.875rem',
    color: '#6b7280',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  button: {
    marginTop: '0.75rem',
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.9375rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px',
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
  },
};
