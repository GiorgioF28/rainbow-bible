/**
 * DBContext — fornisce il database SQLite a tutta l'app.
 *
 * Stati:
 *   loading = true  → DB in fase di copia/apertura (splash)
 *   error   ≠ null  → qualcosa è andato storto (mostra messaggio)
 *   db      ≠ null  → pronto, le view possono fare query
 *
 * Se il file assets/rainbow_bible.db non è presente, db rimane null
 * e l'app ricade automaticamente sui dati statici (connections.ts).
 */

import React, {
  createContext, useContext, useEffect, useState, ReactNode,
} from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { openDatabase } from '../utils/database';

interface DBContextValue {
  db:      SQLiteDatabase | null;
  loading: boolean;
  error:   string | null;
}

const DBContext = createContext<DBContextValue>({
  db: null, loading: true, error: null,
});

export function DBProvider({ children }: { children: ReactNode }) {
  const [db,      setDb]      = useState<SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    openDatabase()
      .then(database => {
        setDb(database);
        setLoading(false);
      })
      .catch(err => {
        console.warn('[DB] Apertura fallita:', err.message);
        // Non bloccare l'app — ricade sui dati statici
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <DBContext.Provider value={{ db, loading, error }}>
      {children}
    </DBContext.Provider>
  );
}

/** Hook principale — usato da ogni view che fa query */
export function useDB(): DBContextValue {
  return useContext(DBContext);
}
