'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase';

function LoginInner() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const nextUrl = searchParams.get('next') || '/proiecte';
    
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
      },
    });

    if (error) {
      setMessage(`Eroare: ${error.message}`);
    } else {
      setMessage('Verifică emailul tău');
    }
    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>planurideafaceri.ro</div>
        </div>
        <h1 style={styles.title}>Intră sau creează un cont</h1>

        <form style={{ width: '100%' }} onSubmit={handleSubmit} noValidate>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Adresă de email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="nume@exemplu.ro" 
              required 
              style={styles.input} 
            />
          </div>

          <button 
            type="submit" 
            className="btn-accent" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Se trimite...' : 'Trimite link-ul magic'}
          </button>
          
          <div style={styles.hintText}>
            Dacă nu ai cont, vom crea unul automat pentru tine.<br />
            Vei primi un link sigur prin care intri direct, fără parole.
          </div>

          {message && (
            <div style={{
              ...styles.message,
              color: message.startsWith('Eroare') ? '#ef4444' : '#0f766e',
              backgroundColor: message.startsWith('Eroare') ? '#fef2f2' : '#f0fdfa',
              border: `1px solid ${message.startsWith('Eroare') ? '#f87171' : '#5eead4'}`
            }}>
              {message}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main style={styles.page}>
        <p style={{ color: '#6b7280' }}>Se încarcă…</p>
      </main>
    }>
      <LoginInner />
    </Suspense>
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
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    marginBottom: '2rem',
    width: '100%',
    textAlign: 'center',
  },
  logo: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#0f766e',
    letterSpacing: '-0.02em',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#111',
    marginBottom: '2rem',
    letterSpacing: '-0.02em',
    width: '100%',
    textAlign: 'left',
  },
  field: {
    marginBottom: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '100%',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#111',
    textAlign: 'left',
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
  button: {
    marginTop: '0.5rem',
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '0.9375rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px',
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
  },
  hintText: {
    marginTop: '1rem',
    fontSize: '0.8rem',
    lineHeight: '1.4',
    color: '#6b7280',
    textAlign: 'center',
    width: '100%',
  },
  message: {
    marginTop: '1.25rem',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    textAlign: 'center',
    width: '100%',
  }
};
