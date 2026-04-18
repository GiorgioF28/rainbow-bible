/**
 * database.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Tutte le query via Supabase. Nessun file SQLite locale.
 */

import { supabase } from './supabase';
import { BOOKS } from '../data/books';
import { SECTIONS } from '../data/sections';
import { Connection, FilterType } from '../data/types';
import { bookName as i18nBookName } from '../i18n';

// ── Costanti ──────────────────────────────────────────────────────────────
export const PAGE_SIZE = 400;

// ── Lookup tables ─────────────────────────────────────────────────────────
const BOOK_NAME: Record<string, string> = {};
const BOOK_GENRE: Record<string, string> = {};
const BOOK_TESTAMENT: Record<string, string> = {};
for (const b of BOOKS) {
  BOOK_NAME[b.id]      = b.name;
  BOOK_GENRE[b.id]     = b.genre;
  BOOK_TESTAMENT[b.id] = b.testament;
}

const SECTION_COLOR: Record<string, string> = {};
for (const s of SECTIONS) {
  for (const bid of s.bookIds) SECTION_COLOR[bid] = s.color;
}

// ── Helper: inferisce type e color ────────────────────────────────────────
function inferType(fromBook: string, toBook: string): FilterType {
  const fromGenre = BOOK_GENRE[fromBook] ?? '';
  const toGenre   = BOOK_GENRE[toBook]   ?? '';
  if (toGenre === 'gospel')                              return 'gospel';
  if (toGenre === 'epistle' || fromGenre === 'epistle')  return 'epistle';
  if (fromGenre === 'wisdom' || toGenre === 'wisdom')    return 'wisdom';
  return 'prophecy';
}

function inferColor(fromBook: string, toBook: string): string {
  const fromTest = BOOK_TESTAMENT[fromBook];
  const c = fromTest === 'OT' ? SECTION_COLOR[fromBook] : SECTION_COLOR[toBook];
  return c ?? '#c9a84c';
}

function formatRef(bookId: string, ch: number, vs: number): string {
  return `${i18nBookName(bookId)} ${ch}:${vs}`;
}

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

// ══════════════════════════════════════════════════════════════════════════
//  MacroView
// ══════════════════════════════════════════════════════════════════════════

export interface BookPairCount {
  fromBook: string;
  toBook:   string;
  count:    number;
}

export async function getBookPairCounts(): Promise<BookPairCount[]> {
  const { data, error } = await supabase.rpc('get_book_pair_counts');
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    fromBook: r.from_book,
    toBook:   r.to_book,
    count:    Number(r.cnt),
  }));
}

// ══════════════════════════════════════════════════════════════════════════
//  SectionBooksPage
// ══════════════════════════════════════════════════════════════════════════

export async function getConnectionCountsForBooks(
  bookIds: string[]
): Promise<Record<string, number>> {
  if (bookIds.length === 0) return {};
  const { data, error } = await supabase.rpc('get_connection_counts_for_books', {
    book_ids: bookIds,
  });
  if (error) throw new Error(error.message);
  const result: Record<string, number> = {};
  for (const r of (data ?? [])) result[r.book] = Number(r.cnt);
  return result;
}

// ══════════════════════════════════════════════════════════════════════════
//  BookArcView
// ══════════════════════════════════════════════════════════════════════════

/** Carica una pagina di connessioni per un libro, ordinate per score desc. */
export async function getConnectionsForBook(
  bookId:         string,
  sectionBookIds: string[] | null = null,
  limit           = PAGE_SIZE,
  offset          = 0,
): Promise<Connection[]> {
  const { data, error } = await supabase.rpc('get_connections_for_book', {
    p_book_id:          bookId,
    p_section_book_ids: sectionBookIds,
    p_limit:            limit,
    p_offset:           offset,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToConnection);
}

/** Totale connessioni per un libro (con filtro sezione opzionale). */
export async function getConnectionsForBookCount(
  bookId:         string,
  sectionBookIds: string[] | null = null,
): Promise<number> {
  const { data, error } = await supabase.rpc('get_connections_for_book_count', {
    p_book_id:          bookId,
    p_section_book_ids: sectionBookIds,
  });
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

/** Tutti i libri collegati (per costruire i tab sezione senza limite 400). */
export async function getConnectedBooksForBook(bookId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_connected_books_for_book', {
    p_book_id: bookId,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => r.book_id as string);
}

// ══════════════════════════════════════════════════════════════════════════
//  ChapterView
// ══════════════════════════════════════════════════════════════════════════

/**
 * Carica connessioni per capitolo.
 * @param orderBy 'score' (default) | 'verse' — ordine per percentuale o per versetto
 */
export async function getConnectionsForChapter(
  bookId:   string,
  chapter:  number | null = null,
  limit     = PAGE_SIZE,
  offset    = 0,
  orderBy   = 'score',
): Promise<Connection[]> {
  const { data, error } = await supabase.rpc('get_connections_for_chapter', {
    p_book_id:  bookId,
    p_chapter:  chapter,
    p_limit:    limit,
    p_offset:   offset,
    p_order_by: orderBy,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToConnection);
}

/** Totale connessioni per capitolo. */
export async function getConnectionsForChapterCount(
  bookId:  string,
  chapter: number | null = null,
): Promise<number> {
  const { data, error } = await supabase.rpc('get_connections_for_chapter_count', {
    p_book_id: bookId,
    p_chapter: chapter,
  });
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

export async function getChapterCounts(
  bookId: string
): Promise<Record<number, number>> {
  const { data, error } = await supabase.rpc('get_chapter_counts', {
    p_book_id: bookId,
  });
  if (error) throw new Error(error.message);
  const result: Record<number, number> = {};
  for (const r of (data ?? [])) result[r.ch] = Number(r.cnt);
  return result;
}

/** Conteggio connessioni per versetto (per i chip versetto in ChapterView). */
export async function getVerseCounts(
  bookId:  string,
  chapter: number | null = null,
): Promise<Array<{ ch: number; vs: number; cnt: number }>> {
  const { data, error } = await supabase.rpc('get_verse_counts', {
    p_book_id: bookId,
    p_chapter: chapter,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    ch:  Number(r.ch),
    vs:  Number(r.vs),
    cnt: Number(r.cnt),
  }));
}

// ══════════════════════════════════════════════════════════════════════════
//  DetailPanel
// ══════════════════════════════════════════════════════════════════════════

export async function getConnectionById(id: number): Promise<Connection | null> {
  const { data, error } = await supabase.rpc('get_connection_by_id', { p_id: id });
  if (error) throw new Error(error.message);
  const row = (data ?? [])[0];
  return row ? rowToConnection(row) : null;
}
