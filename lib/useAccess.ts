import { useState, useEffect } from 'react';
import { createClient } from './supabase';
import { isAdmin as checkIsAdmin } from './isAdmin';

export function useAccess(proiectIdParam: string | null) {
  const [isPaid, setIsPaid] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function loadAccess() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!mounted) return;
      if (user) {
        setUser({ id: user.id });
        const adminStatus = await checkIsAdmin();
        if (mounted) setIsAdmin(adminStatus);

        if (proiectIdParam) {
          const { data } = await supabase
            .from('proiecte')
            .select('platit')
            .eq('id', proiectIdParam)
            .single();
          
          if (mounted && data) {
            setIsPaid(!!data.platit);
          }
        }
      }
      
      if (mounted) setLoading(false);
    }
    
    loadAccess();
    
    return () => {
      mounted = false;
    };
  }, [proiectIdParam]);

  const isPreview = !isAdmin && !isPaid;

  return { isPreview, isPaid, isAdmin, loading, user };
}
