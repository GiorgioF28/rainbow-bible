/**
 * database.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Gestisce l'apertura del DB SQLite bundlato in assets/ e fornisce
 * tutte le funzioni di query usate dall'app.
 *
 * Prima apertura: copia rainbow_bible.db da assets → documentDirectory/SQLite/
 * Aperture successive: usa direttamente il file già copiato.
 */

import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';

import { BOOKS } from '../data/books';
import { SECTIONS } from '../data/sections';
import { Connection, FilterType } from '../data/types';

// ── Costanti ──────────────────────────────────────────────────────────────
const DB_NAME = 'rainbow_bible.db';
const MAX_BOOK_CONNECTIONS = 400; // limite archi per book view (performance)

// URL diretto del DB remoto (GitHub Releases o altro CDN).
// Aggiorna questo valore ad ogni nuova versione del DB.
const REMOTE_DB_URL = 'INSERISCI_QUI_IL_LINK_DIRETTO';

// ── Lookup tables derivate dai dati statici ───────────────────────────────
const BOOK_NAME: Record<string, string> = {};
const BOOK_GENRE: Record<string, string> = {};
const BOOK_TESTAMENT: Record<string, string> = {};
for (const b of BOOKS) {
  BOOK_NAME[b.id]      = b.name;
  BOOK_GENRE[b.id]     = b.genre;
  BOOK_TESTAMENT[b.id] = b.testament;
}

// Colore per sezione (stesso schema di sections.ts)
const SECTION_COLOR: Record<string, string> = {};
const BOOK_SECTION: Record<string, string> = {};
for (const s of SECTIONS) {
  for (const bid of s.bookIds) {
    SECTION_COLOR[bid] = s.color;
    BOOK_SECTION[bid]  = s.id;
  }
}

// ── Deriva type e color da book ids ───────────────────────────────────────
function inferType(fromBook: string, toBook: string): FilterType {
  const fromGenre = BOOK_GENRE[fromBook] ?? '';
  const toGenre   = BOOK_GENRE[toBook]   ?? '';
  if (toGenre === 'gospel')                           return 'gospel';
  if (toGenre === 'epistle' || fromGenre === 'epistle') return 'epistle';
  if (fromGenre === 'wisdom' || toGenre === 'wisdom')   return 'wisdom';
  return 'prophecy';
}

function inferColor(fromBook: string, toBook: string): string {
  // Prefer the OT book's section color; fall back to to-book
  const fromTest = BOOK_TESTAMENT[fromBook];
  const c = fromTest === 'OT' ? SECTION_COLOR[fromBook] : SECTION_COLOR[toBook];
  return c ?? '#c9a84c';
}

// ── Formatta riferimento italiano ─────────────────────────────────────────
function formatRef(bookId: string, ch: number, vs: number): string {
  return `${BOOK_NAME[bookId] ?? bookId} ${ch}:${vs}`;
}

// ── Trasforma una riga raw del DB in Connection ───────────────────────────
function rowToConnection(row: any): Connection {
  const hasExp = row.expl_id != null;
  return {
    id:             row.id,
    from:           row.from_book,
    to:             row.to_book,
    type:           row.type_override ?? inferType(row.from_book, row.to_book),
    color:          row.color_override ?? inferColor(row.from_book, row.to_book),
    refA:           formatRef(row.from_book, row.from_ch, row.from_vs),
    refB:           formatRef(row.to_book,   row.to_ch,   row.to_vs),
    textA:          row.text_from ?? '',
    textB:          row.text_to   ?? '',
    score:          row.score     ?? 0,
    hasExplanation: hasExp,
    explanation:    row.expl_body    ?? '',
    author_a:       row.expl_auth_a  ?? '',
    author_b:       row.expl_auth_b  ?? '',
    period:         row.expl_period  ?? '',
    link_type:      row.expl_link    ?? '',
  };
}

// ── SQL base per recuperare connessioni complete ───────────────────────────
const CONN_SELECT = `
  SELECT
    c.id, c.from_book, c.from_ch, c.from_vs,
    c.to_book, c.to_ch, c.to_vs, c.score,
    c.type   AS type_override,
    c.color  AS color_override,
    v1.text_it AS text_from,
    v2.text_it AS text_to,
    e.id       AS expl_id,
    e.body     AS expl_body,
    e.link_type AS expl_link,
    e.author_a  AS expl_auth_a,
    e.author_b  AS expl_auth_b,
    e.period    AS expl_period
  FROM connections c
  LEFT JOIN verses v1
    ON v1.book_id = c.from_book AND v1.chapter = c.from_ch AND v1.verse = c.from_vs
  LEFT JOIN verses v2
    ON v2.book_id = c.to_book AND v2.chapter = c.to_ch AND v2.verse = c.to_vs
  LEFT JOIN explanations e ON e.connection_id = c.id
`;

// ══════════════════════════════════════════════════════════════════════════
//  INIZIALIZZAZIONE DB
// ══════════════════════════════════════════════════════════════════════════

// Il DB reale è ~40MB. Se il file sul device è più piccolo di 5MB
// significa che è vuoto/corrotto (copia precedente fallita) → ricopiamo.
const MIN_DB_SIZE_BYTES = 5 * 1024 * 1024;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const sqliteDir = FileSystem.documentDirectory + 'SQLite/';
  const dbPath    = sqliteDir + DB_NAME;

  // Crea la directory SQLite se non esiste
  const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
  }

  // Copia il DB da assets se:
  //  - il file non esiste ancora, OPPURE
  //  - esiste ma è troppo piccolo (copia precedente interrotta/fallita)
  const dbInfo = await FileSystem.getInfoAsync(dbPath, { size: true } as any);
  const needsCopy = !dbInfo.exists || ((dbInfo as any).size ?? 0) < MIN_DB_SIZE_BYTES;

  if (needsCopy) {
    // Rimuove eventuale file parziale
    if (dbInfo.exists) {
      await FileSystem.deleteAsync(dbPath, { idempotent: true });
    }
    // Scarica il DB dal CDN remoto (GitHub Releases).
    // Prima apertura: ~40MB download una tantum via rete.
    // Aperture successive: file già presente, skip automatico.
    console.log('[DB] Download da remoto...');
    const result = await FileSystem.downloadAsync(REMOTE_DB_URL, dbPath);
    if (result.status !== 200) {
      await FileSystem.deleteAsync(dbPath, { idempotent: true });
      throw new Error(`Download DB fallito: HTTP ${result.status}`);
    }
    console.log('[DB] Download completato →', dbPath);
  }

  return SQLite.openDatabaseAsync(DB_NAME);
}

// ══════════════════════════════════════════════════════════════════════════
//  QUERY — MacroView
//  Restituisce il numero di connessioni tra ogni coppia (from_book, to_book)
//  aggregato in un array compatto; il mapping book→sezione viene fatto in JS.
// ══════════════════════════════════════════════════════════════════════════

export interface BookPairCount {
  fromBook: string;
  toBook:   string;
  count:    number;
}

export async function getBookPairCounts(
  db: SQLite.SQLiteDatabase
): Promise<BookPairCount[]> {
  const rows = await db.getAllAsync<{ from_book: string; to_book: string; cnt: number }>(
    `SELECT from_book, to_book, COUNT(*) as cnt
     FROM connections
     GROUP BY from_book, to_book`
  );
  return rows.map(r => ({ fromBook: r.from_book, toBook: r.to_book, count: r.cnt }));
}

// ══════════════════════════════════════════════════════════════════════════
//  QUERY — SectionBooksPage
//  Conta i collegamenti per ogni book_id in una sezione.
// ══════════════════════════════════════════════════════════════════════════

export async function getConnectionCountsForBooks(
  db: SQLite.SQLiteDatabase,
  bookIds: string[]
): Promise<Record<string, number>> {
  if (bookIds.length === 0) return {};
  const placeholders = bookIds.map(() => '?').join(',');

  const rows = await db.getAllAsync<{ book: string; cnt: number }>(
    `SELECT book, SUM(cnt) as cnt FROM (
       SELECT from_book AS book, COUNT(*) AS cnt
       FROM connections WHERE from_book IN (${placeholders}) GROUP BY from_book
       UNION ALL
       SELECT to_book AS book, COUNT(*) AS cnt
       FROM connections WHERE to_book IN (${placeholders}) GROUP BY to_book
     ) GROUP BY book`,
    [...bookIds, ...bookIds]
  );

  const result: Record<string, number> = {};
  for (const r of rows) result[r.book] = r.cnt;
  return result;
}

// ══════════════════════════════════════════════════════════════════════════
//  QUERY — BookArcView
//  Top N connessioni per un libro, ordinate per score DESC.
//  Opzionalmente filtrate per sezione di destinazione.
// ══════════════════════════════════════════════════════════════════════════

export async function getConnectionsForBook(
  db: SQLite.SQLiteDatabase,
  bookId: string,
  targetSectionId: string | null = null,
  limit = MAX_BOOK_CONNECTIONS
): Promise<Connection[]> {
  let whereClause = '(c.from_book = ? OR c.to_book = ?)';
  const params: (string | number)[] = [bookId, bookId];

  if (targetSectionId) {
    const sec = SECTIONS.find(s => s.id === targetSectionId);
    if (sec && sec.bookIds.length > 0) {
      const ph = sec.bookIds.map(() => '?').join(',');
      whereClause +=
        ` AND (
          (c.from_book = ? AND c.to_book IN (${ph})) OR
          (c.to_book   = ? AND c.from_book IN (${ph}))
        )`;
      params.push(bookId, ...sec.bookIds, bookId, ...sec.bookIds);
    }
  }

  const rows = await db.getAllAsync<any>(
    `${CONN_SELECT} WHERE ${whereClause} ORDER BY c.score DESC LIMIT ?`,
    [...params, limit]
  );
  return rows.map(rowToConnection);
}

// ══════════════════════════════════════════════════════════════════════════
//  QUERY — ChapterView
//  Connessioni per un libro raggruppate per capitolo.
// ══════════════════════════════════════════════════════════════════════════

export async function getConnectionsForChapter(
  db: SQLite.SQLiteDatabase,
  bookId: string,
  chapter: number | null = null,
  limit = MAX_BOOK_CONNECTIONS
): Promise<Connection[]> {
  let whereClause: string;
  let params: (string | number)[];

  if (chapter !== null) {
    whereClause =
      '((c.from_book = ? AND c.from_ch = ?) OR (c.to_book = ? AND c.to_ch = ?))';
    params = [bookId, chapter, bookId, chapter, limit];
  } else {
    whereClause = '(c.from_book = ? OR c.to_book = ?)';
    params = [bookId, bookId, limit];
  }

  const rows = await db.getAllAsync<any>(
    `${CONN_SELECT} WHERE ${whereClause} ORDER BY c.score DESC LIMIT ?`,
    params
  );
  return rows.map(rowToConnection);
}

// Conta connessioni per ogni capitolo di un libro (per la bar chart)
export async function getChapterCounts(
  db: SQLite.SQLiteDatabase,
  bookId: string
): Promise<Record<number, number>> {
  const rows = await db.getAllAsync<{ ch: number; cnt: number }>(
    `SELECT ch, SUM(cnt) as cnt FROM (
       SELECT from_ch AS ch, COUNT(*) AS cnt
       FROM connections WHERE from_book = ? GROUP BY from_ch
       UNION ALL
       SELECT to_ch AS ch, COUNT(*) AS cnt
       FROM connections WHERE to_book = ? GROUP BY to_ch
     ) GROUP BY ch`,
    [bookId, bookId]
  );
  const result: Record<number, number> = {};
  for (const r of rows) result[r.ch] = r.cnt;
  return result;
}

// ══════════════════════════════════════════════════════════════════════════
//  QUERY — DetailPanel
//  Una singola connessione completa per id.
// ══════════════════════════════════════════════════════════════════════════

export async function getConnectionById(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<Connection | null> {
  const row = await db.getFirstAsync<any>(
    `${CONN_SELECT} WHERE c.id = ?`,
    [id]
  );
  return row ? rowToConnection(row) : null;
}
