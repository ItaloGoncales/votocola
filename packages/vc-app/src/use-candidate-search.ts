import { useCallback, useEffect, useRef, useState } from 'react';
import { searchCandidates, type CandidateFilter, type CandidateSummary } from '@/api';

type Status = 'loading' | 'loadingMore' | 'idle' | 'error' | 'errorMore';

/**
 * Busca paginada (offset) com "carregar mais". Reinicia quando o filtro muda, ignora respostas de
 * buscas antigas, não dispara duas páginas ao mesmo tempo e descarta repetidos (a ordem por
 * popularidade pode mudar entre uma página e outra).
 */
export function useCandidateSearch(filter: CandidateFilter) {
  const key = JSON.stringify(filter);
  const [items, setItems] = useState<CandidateSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<Status>('loading');
  const next = useRef<number | null>(0);
  const generation = useRef(0);
  const busy = useRef(false);

  const fetchPage = useCallback(
    async (offset: number, reset: boolean) => {
      const gen = generation.current;
      busy.current = true;
      setStatus(reset ? 'loading' : 'loadingMore');
      try {
        const page = await searchCandidates(JSON.parse(key) as CandidateFilter, offset);
        if (gen !== generation.current) return;
        next.current = page.nextOffset;
        setTotal(page.total);
        setItems((prev) => {
          if (reset) return page.items;
          const seen = new Set(prev.map((c) => c.id));
          return [...prev, ...page.items.filter((c) => !seen.has(c.id))];
        });
        setStatus('idle');
      } catch {
        if (gen === generation.current) setStatus(reset ? 'error' : 'errorMore');
      } finally {
        if (gen === generation.current) busy.current = false;
      }
    },
    [key],
  );

  // Filtro novo: invalida respostas pendentes e recomeça do zero.
  useEffect(() => {
    generation.current += 1;
    busy.current = false;
    next.current = 0;
    setItems([]);
    fetchPage(0, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (busy.current || next.current === null) return;
    fetchPage(next.current, false);
  }, [fetchPage]);

  const retry = useCallback(() => {
    if (busy.current) return;
    if (next.current === 0 || items.length === 0) fetchPage(0, true);
    else if (next.current !== null) fetchPage(next.current, false);
  }, [fetchPage, items.length]);

  return { items, total, status, hasMore: next.current !== null, loadMore, retry };
}
