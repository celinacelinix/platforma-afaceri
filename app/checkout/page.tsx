'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { isAdmin } from '@/lib/isAdmin';

function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();
  const pret = Number(params.get('pret') || 149);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    isAdmin().then(setAdmin);
  }, []);

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <span style={styles.icon}>🚀</span>
        </div>
        
        {admin ? (
          <>
            <h1 style={styles.title}>Cont admin</h1>
            <p style={styles.desc}>
              Plata nu este necesară. Ai acces complet la funcționalitățile platformei.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ ...styles.button, backgroundColor: '#0f766e', cursor: 'pointer', opacity: 1 }}
            >
              Creează proiect nou
            </button>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Deblochează planul tău de afaceri</h1>
            <p style={styles.desc}>
              Primești un simulator financiar complet, cu plan de afaceri generat de AI,
              personalizat pentru piața din România.
            </p>

            <div style={styles.priceCard}>
              <span style={styles.priceAmount}>{pret} lei</span>
              <span style={styles.priceLabel}>per proiect · acces permanent</span>
            </div>

            <ul style={styles.features}>
              <li style={styles.feature}>✓ Simulator financiar interactiv</li>
              <li style={styles.feature}>✓ Plan de afaceri generat cu AI</li>
              <li style={styles.feature}>✓ Analiză de sensibilitate</li>
              <li style={styles.feature}>✓ Export PDF</li>
              <li style={styles.feature}>✓ Salvare și editare nelimitată</li>
            </ul>

                        <button
              onClick={() => router.push('/')}
              style={{ ...styles.button, backgroundColor: '#0f766e', cursor: 'pointer', opacity: 1 }}
            >
              Creează proiect nou →
            </button>
            <p style={styles.hint}>
              Plata securizată · Acces instant după confirmare
            </p>
          </>
        )}

        <button
          onClick={() => router.push('/proiecte')}
          style={styles.backLink}
        >
          ← Înapoi la proiecte
        </button>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main style={styles.page}>
        <p style={{ color: '#6b7280' }}>Se încarcă…</p>
      </main>
    }>
      <CheckoutInner />
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
    padding: '48px 16px',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    backgroundColor: '#f0fdfa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: '2rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#111',
    letterSpacing: '-0.02em',
    marginBottom: 12,
  },
  desc: {
    fontSize: '0.9375rem',
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: 28,
  },
  priceCard: {
    backgroundColor: '#f0fdfa',
    border: '2px solid #0f766e',
    borderRadius: 12,
    padding: '20px 32px',
    marginBottom: 28,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  priceAmount: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#0f766e',
    letterSpacing: '-0.03em',
  },
  priceLabel: {
    fontSize: '0.8125rem',
    color: '#6b7280',
    fontWeight: 500,
  },
  features: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 28px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    textAlign: 'left',
  },
  feature: {
    fontSize: '0.9rem',
    color: '#374151',
    paddingLeft: 4,
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff',
    backgroundColor: '#9ca3af',
    border: 'none',
    borderRadius: 10,
    cursor: 'not-allowed',
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
    opacity: 0.7,
  },
  hint: {
    marginTop: 12,
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  backLink: {
    marginTop: 24,
    fontSize: '0.8125rem',
    color: '#6b7280',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '4px 0',
  },
};
