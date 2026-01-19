'use client';

import { useEffect, useState } from 'react';
import { loadKB } from '@/lib/askmaven/storage';

export default function useKBReady() {
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    // initial check
    loadKB().then(kb => {
      if (!alive) return;
      const ok = Boolean(kb?.rows?.length);
      setReady(ok);
      setCount(ok ? kb!.rows.length : null);
      if (ok) console.log('[useKBReady] KB present:', kb!.rows.length);
    });

    // react to event from indexMergedRows()
    const onKB = (e: any) => {
      if (!alive) return;
      setReady(true);
      setCount(e?.detail?.count ?? null);
      console.log('[useKBReady] event askmaven:kb-updated', e?.detail);
    };
    window.addEventListener('askmaven:kb-updated', onKB);

    // polling fallback (in case the event is missed)
    const iv = setInterval(async () => {
      if (!alive || ready) return;
      const kb = await loadKB();
      const ok = Boolean(kb?.rows?.length);
      if (ok) {
        setReady(true);
        setCount(kb!.rows.length);
        console.log('[useKBReady] polling found KB:', kb!.rows.length);
        clearInterval(iv);
      }
    }, 800);

    return () => { alive = false; window.removeEventListener('askmaven:kb-updated', onKB); clearInterval(iv); };
  }, [ready]);

  return { ready, count };
}
