/**
 * DBContext — fornisce lo stato del backend dati all'app.
 * Esegue un ping a Supabase all'avvio; loading rimane true finché
 * la prima query non risponde (successo o errore).
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';

interface DBContextValue {
  loading: boolean;
  error:   string | null;
}

const DBContext = createContext<DBContextValue>({ loading: true, error: null });

export function DBProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve(supabase.rpc('get_book_pair_counts'))
      .then(({ error: e }) => {
        if (e) setError(e.message);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  return (
    <DBContext.Provider value={{ loading, error }}>
      {children}
    </DBContext.Provider>
  );
}

export function useDB(): DBContextValue {
  return useContext(DBContext);
}
