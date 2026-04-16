/**
 * database.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Fornisce tutte le funzioni di query usando Supabase come backend.
 * Nessun file SQLite locale — i dati vengono letti direttamente dal DB remoto.
 */

import { supabase } from './supabase';
import { BOOKS } from '../data/books';
import { SECTIONS } from '../data/sections';
import { Connection, FilterType } from '../data/types';

// ── Costanti ──────────────────────────────────────────────────────────────
const MAX_BOOK_CONNECTIONS = 400;

// ── Lookup tables derivate dai dati statici ───────────────────────────────
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
  for (const bid of s.bookIds) {
    SECTION_COLOR[bid] = s.color;
  }
}

// ── Helper: inferisce type e color dai book ids ───────────────────────────
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
  return `${BOOK_NAME[bookId] ?? bookId} ${ch}:${vs}`;
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
//  QUERY — MacroView
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
//  QUERY — SectionBooksPage
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
//  QUERY — BookArcView
// ══════════════════════════════════════════════════════════════════════════

export async function getConnectionsForBook(
  bookId:          string,
  targetSectionId: string | null = null,
  limit            = MAX_BOOK_CONNECTIONS
): Promise<Connection[]> {
  let sectionBookIds: string[] | null = null;
  if (targetSectionId) {
    const sec = SECTIONS.find(s => s.id === targetSectionId);
    if (sec && sec.bookIds.length > 0) sectionBookIds = sec.bookIds;
  }
  const { data, error } = await supabase.rpc('get_connections_for_book', {
    p_book_id:          bookId,
    p_section_book_ids: sectionBookIds,
    p_limit:            limit,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToConnection);
}

// ══════════════════════════════════════════════════════════════════════════
//  QUERY — ChapterView
// ══════════════════════════════════════════════════════════════════════════

export async function getConnectionsForChapter(
  bookId:  string,
  chapter: number | null = null,
  limit    = MAX_BOOK_CONNECTIONS
): Promise<Connection[]> {
  const { data, error } = await supabase.rpc('get_connections_for_chapter', {
    p_book_id: bookId,
    p_chapter: chapter,
    p_limit:   limit,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToConnection);
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

// ══════════════════════════════════════════════════════════════════════════
//  QUERY — DetailPanel
// ══════════════════════════════════════════════════════════════════════════

export async function getConnectionById(id: number): Promise<Connection | null> {
  const { data, error } = await supabase.rpc('get_connection_by_id', { p_id: id });
  if (error) throw new Error(error.message);
  const row = (data ?? [])[0];
  return row ? rowToConnection(row) : null;
}
