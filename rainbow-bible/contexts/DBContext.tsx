/**
 * DBContext — fornisce lo stato del backend dati all'app.
 *
 * Con Supabase il client è istanziato in modo sincrono,
 * quindi loading è sempre false e non serve aprire nessun file.
 */

import React, { createContext, useContext, ReactNode } from 'react';

interface DBContextValue {
  loading: boolean;
  error:   string | null;
}

const DBContext = createContext<DBContextValue>({ loading: false, error: null });

export function DBProvider({ children }: { children: ReactNode }) {
  return (
    <DBContext.Provider value={{ loading: false, error: null }}>
      {children}
    </DBContext.Provider>
  );
}

export function useDB(): DBContextValue {
  return useContext(DBContext);
}
