'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

import { isAdmin } from '@/lib/isAdmin';

type Proiect = {
  id: string;
  nume: string;
  domeniu: string | null;
  localitate: string | null;
  actualizat_la: string;
  platit: boolean;
};

export default function ProiectePage() {
  const router = useRouter();
  const [proiecte, setProiecte] = useState<Proiect[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    fetchProiecte();
  }, []);

  async function fetchProiecte() {
    const isAdminUser = await isAdmin();
    setAdmin(isAdminUser);
    const supabase = createClient();
    
    let query = supabase
      .from('proiecte')
      .select('id, nume, domeniu, localitate, actualizat_la, platit')
      .order('actualizat_la', { ascending: false });

    if (!isAdminUser) {
      query = query.eq('platit', true);
    }

    const { data, error } = await query;

    if (!error && data) {
      if (data.length === 0 && !isAdminUser) {
        // No paid projects → redirect to checkout for first project (149 lei)
        router.replace('/checkout?pret=149');
        return;
      }
      setProiecte(data);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Sigur vrei să ștergi acest proiect?')) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from('proiecte').delete().eq('id', id);
    if (!error) {
      setProiecte(prev => prev.filter(p => p.id !== id));
    }
    setDeletingId(null);
  }

  function handleOpen(id: string) {
    router.push(`/dashboard?proiect_id=${id}`);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Se încarcă proiectele…</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Proiectele mele</h1>
            <p style={styles.subtitle}>
              {proiecte.length} {proiecte.length === 1 ? 'proiect' : 'proiecte'}
            </p>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={() => router.push(admin ? '/dashboard' : '/checkout?pret=99')}
              className="btn-accent"
              style={styles.newBtn}
            >
              + Proiect nou
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Ieși din cont
            </button>
          </div>
        </div>

        {proiecte.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📋</div>
            <p style={styles.emptyTitle}>Niciun proiect salvat</p>
            <p style={styles.emptyDesc}>Nu ai creat încă niciun proiect.</p>
          </div>
        ) : (
          <div style={styles.grid}>
          {proiecte.map(p => (
            <div key={p.id} style={styles.card}>
              <div style={styles.cardBody}>
                <h2 style={styles.cardTitle}>{p.nume}</h2>
                <div style={styles.cardMeta}>
                  {p.domeniu && <span style={styles.badge}>{p.domeniu}</span>}
                  {p.localitate && <span style={styles.metaText}>📍 {p.localitate}</span>}
                </div>
                <p style={styles.cardDate}>
                  Ultima salvare: {new Date(p.actualizat_la).toLocaleDateString('ro-RO', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div style={styles.cardActions}>
                <button
                  onClick={() => handleOpen(p.id)}
                  className="btn-accent"
                  style={styles.openBtn}
                >
                  Deschide
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  style={styles.deleteBtn}
                >
                  {deletingId === p.id ? 'Se șterge...' : 'Șterge'}
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '40px 16px',
  },
  container: {
    maxWidth: 720,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    flexWrap: 'wrap',
    gap: 16,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#111',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: 4,
  },
  newBtn: {
    padding: '10px 20px',
    fontSize: '0.875rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: 8,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  logoutBtn: {
    padding: '10px 16px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#ef4444',
    backgroundColor: 'transparent',
    border: '1px solid #fecaca',
    borderRadius: 8,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 24px',
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: 1.6,
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#111',
    marginBottom: 8,
    letterSpacing: '-0.01em',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#0f766e',
    backgroundColor: '#f0fdfa',
    padding: '2px 10px',
    borderRadius: 999,
    border: '1px solid #ccfbf1',
    textTransform: 'capitalize',
  },
  metaText: {
    fontSize: '0.8125rem',
    color: '#6b7280',
  },
  cardDate: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  cardActions: {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
  },
  openBtn: {
    padding: '8px 18px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    border: 'none',
    borderRadius: 8,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '8px 14px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#ef4444',
    backgroundColor: 'transparent',
    border: '1px solid #fecaca',
    borderRadius: 8,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
};
