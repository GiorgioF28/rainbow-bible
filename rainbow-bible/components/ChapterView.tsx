/**
 * ChapterView — Level 3
 * Bar chart capitoli + lista collegamenti.
 * Modalità "Per Versetto": carica in ordine versetto + selettore versetti.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { BOOKS } from '../data/books';
import { SECTIONS } from '../data/sections';
import { Connection } from '../data/types';
import { COLORS } from '../theme/colors';
import {
  getConnectionsForChapter,
  getConnectionsForChapterCount,
  getChapterCounts,
  getVerseCounts,
  PAGE_SIZE,
} from '../utils/database';
import DetailPanel from './DetailPanel';
import { useLang } from '../contexts/LangContext';
import { t, sectionLabel } from '../i18n';

interface Props {
  bookId:    string;
  sectionId: string;
  onBack:    () => void;
}

function chapterFromRef(ref: string): number {
  const m = ref.match(/(\d+):/);
  return m ? parseInt(m[1]) : 0;
}
function verseFromRef(ref: string): number {
  const m = ref.match(/:(\d+)/);
  return m ? parseInt(m[1]) : 0;
}
function refForBook(conn: Connection, bookId: string): string {
  return conn.from === bookId ? conn.refA : conn.refB;
}

type SortMode = 'score' | 'verse';

interface VerseInfo { ch: number; vs: number; cnt: number }

const ChapterView: React.FC<Props> = ({ bookId, sectionId, onBack }) => {
  useLang(); // re-render on language change
  const book    = BOOKS.find(b => b.id === bookId);
  const section = SECTIONS.find(s => s.id === sectionId);

  const [chapterCounts,   setChapterCounts]   = useState<Record<number, number>>({});
  const [connections,     setConnections]      = useState<Connection[]>([]);
  const [totalCount,      setTotalCount]       = useState(0);
  const [selectedChapter, setSelectedChapter]  = useState<number | null>(null);
  const [selectedConnId,  setSelectedConnId]   = useState<number | null>(null);
  const [loading,         setLoading]          = useState(true);
  const [mode,            setMode]             = useState<'chapter' | 'verse'>('chapter');
  const [sortMode,        setSortMode]         = useState<SortMode>('score');
  const [showFilterMenu,  setShowFilterMenu]   = useState(false);

  // Verse selector state (solo in modalità verse)
  const [verseList,       setVerseList]        = useState<VerseInfo[]>([]);
  const [selectedVerse,   setSelectedVerse]    = useState<{ ch: number; vs: number } | null>(null);
  const [loadingVerses,   setLoadingVerses]    = useState(false);

  // Caricamento iniziale del libro
  useEffect(() => {
    if (!book) return;
    setLoading(true);
    setSelectedChapter(null);
    setSelectedVerse(null);
    setSelectedConnId(null);
    setVerseList([]);

    const orderBy = mode === 'verse' ? 'verse' : 'score';
    Promise.all([
      getChapterCounts(bookId),
      getConnectionsForChapterCount(bookId, null),
      getConnectionsForChapter(bookId, null, PAGE_SIZE, 0, orderBy),
    ]).then(([counts, total, conns]) => {
      setChapterCounts(counts);
      setTotalCount(total);
      setConnections(conns);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [bookId]);

  // Quando cambia la modalità (chapter ↔ verse), ricarica nell'ordine giusto
  useEffect(() => {
    if (loading) return; // evita doppio fetch all'avvio
    setSelectedConnId(null);
    setSelectedVerse(null);

    const orderBy = mode === 'verse' ? 'verse' : 'score';
    setLoading(true);
    getConnectionsForChapter(bookId, selectedChapter, PAGE_SIZE, 0, orderBy)
      .then(conns => { setConnections(conns); setLoading(false); })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Carica i versetti del capitolo selezionato in modalità verse
  useEffect(() => {
    if (mode !== 'verse' || selectedChapter === null) {
      setVerseList([]);
      return;
    }
    setLoadingVerses(true);
    getVerseCounts(bookId, selectedChapter)
      .then(vs => { setVerseList(vs); setLoadingVerses(false); })
      .catch(() => setLoadingVerses(false));
  }, [mode, selectedChapter, bookId]);

  // Selezione capitolo
  const handleChapterPress = useCallback(async (ch: number) => {
    const next = selectedChapter === ch ? null : ch;
    setSelectedChapter(next);
    setSelectedConnId(null);
    setSelectedVerse(null);

    const orderBy = mode === 'verse' ? 'verse' : 'score';
    setLoading(true);
    Promise.all([
      getConnectionsForChapterCount(bookId, next),
      getConnectionsForChapter(bookId, next, PAGE_SIZE, 0, orderBy),
    ]).then(([total, conns]) => {
      setTotalCount(total);
      setConnections(conns);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [bookId, selectedChapter, mode]);

  // Selezione versetto (filtra localmente dall'elenco già caricato)
  const handleVersePress = useCallback((ch: number, vs: number) => {
    setSelectedVerse(prev =>
      prev?.ch === ch && prev.vs === vs ? null : { ch, vs }
    );
    setSelectedConnId(null);
  }, []);

  // Applica filtro versetto se selezionato
  const displayConnections = useMemo(() => {
    if (mode !== 'verse' || selectedVerse === null) return connections;
    return connections.filter(conn => {
      const ref = refForBook(conn, bookId);
      return chapterFromRef(ref) === selectedVerse.ch
          && verseFromRef(ref)   === selectedVerse.vs;
    });
  }, [connections, mode, selectedVerse, bookId]);

  const chapters = useMemo(
    () => Object.keys(chapterCounts).map(Number).sort((a, b) => a - b),
    [chapterCounts],
  );
  const maxCount = useMemo(
    () => Math.max(...Object.values(chapterCounts), 1),
    [chapterCounts],
  );

  const selectedConnection = useMemo(
    () => selectedConnId !== null
      ? displayConnections.find(c => c.id === selectedConnId) ?? null
      : null,
    [selectedConnId, displayConnections],
  );

  const handleSortChange = (s: SortMode) => {
    setSortMode(s);
    setShowFilterMenu(false);
    if (mode === 'verse') return; // già gestito da mode
    // In chapter mode: ricarica con il nuovo ordine
    setLoading(true);
    setSelectedConnId(null);
    getConnectionsForChapter(bookId, selectedChapter, PAGE_SIZE, 0, s)
      .then(conns => { setConnections(conns); setLoading(false); })
      .catch(() => setLoading(false));
  };

  if (!book || !section) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtnText}>‹ {book.name}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {book.name}{selectedChapter ? ` · Cap. ${selectedChapter}` : ''}
            {selectedVerse ? ` : ${selectedVerse.vs}` : ''}
          </Text>
          <Text style={styles.headerSub}>
            {loading ? '…' : `${(mode === 'verse' && selectedVerse ? displayConnections.length : totalCount).toLocaleString()} collegamenti`}
          </Text>
        </View>
        {/* Gear icon */}
        <TouchableOpacity
          style={styles.gearBtn}
          onPress={() => setShowFilterMenu(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.gearIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Mode tabs */}
      <View style={styles.modeTabs}>
        {(['chapter', 'verse'] as const).map(m => (
          <TouchableOpacity key={m}
            style={[styles.modeTab, mode === m && styles.modeTabActive]}
            onPress={() => setMode(m)}>
            <Text style={[styles.modeTabText, mode === m && styles.modeTabTextActive]}>
              {m === 'chapter' ? 'Per Capitolo' : 'Per Versetto'}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Sort badge */}
        {mode === 'chapter' && sortMode === 'verse' && (
          <View style={styles.sortBadge}>
            <Text style={styles.sortBadgeText}>ord. versetto</Text>
          </View>
        )}
      </View>

      {/* Chapter bar chart */}
      {chapters.length > 0 && (
        <View style={styles.chartContainer}>
          {selectedChapter !== null && (
            <Text style={styles.chartLabel}>
              Capitolo {selectedChapter} · {chapterCounts[selectedChapter] ?? 0} collegamenti
            </Text>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartRow}>
            {chapters.map(ch => {
              const cnt  = chapterCounts[ch] ?? 0;
              const barH = Math.max(5, (cnt / maxCount) * 44);
              const isSel = selectedChapter === ch;
              return (
                <TouchableOpacity key={ch} style={styles.barCol}
                  onPress={() => handleChapterPress(ch)} activeOpacity={0.7}>
                  <View style={[styles.bar, {
                    height: barH,
                    backgroundColor: isSel ? COLORS.gold : section.color + '80',
                  }]} />
                  <Text style={[styles.chNum, isSel && { color: COLORS.gold }]}>{ch}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Verse selector (solo in verse mode + capitolo selezionato) */}
      {mode === 'verse' && selectedChapter !== null && (
        <View style={styles.verseBarContainer}>
          {loadingVerses ? (
            <ActivityIndicator color={COLORS.gold} size="small" style={{ marginVertical: 8 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.verseBarRow}>
              <TouchableOpacity
                style={[styles.verseChip, selectedVerse === null && styles.verseChipActive]}
                onPress={() => { setSelectedVerse(null); setSelectedConnId(null); }}>
                <Text style={[styles.verseChipText, selectedVerse === null && styles.verseChipTextActive]}>
                  {t('all')}
                </Text>
              </TouchableOpacity>
              {verseList.map(({ ch, vs, cnt }) => {
                const isSel = selectedVerse?.ch === ch && selectedVerse.vs === vs;
                return (
                  <TouchableOpacity key={`${ch}:${vs}`}
                    style={[styles.verseChip, isSel && styles.verseChipActive]}
                    onPress={() => handleVersePress(ch, vs)}>
                    <Text style={[styles.verseChipText, isSel && styles.verseChipTextActive]}>
                      :{vs}
                    </Text>
                    {cnt > 0 && (
                      <Text style={styles.verseChipCount}>{cnt}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {/* Connection list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.gold} />
        </View>
      ) : (
        <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}>
          {displayConnections.length === 0 && (
            <Text style={styles.emptyText}>{t('no_connections')}</Text>
          )}

          {displayConnections.map((conn, idx) => {
            const fromRef = refForBook(conn, bookId);
            const toRef   = conn.from === bookId ? conn.refB : conn.refA;
            const otherBookId = conn.from === bookId ? conn.to : conn.from;
            const otherSec = SECTIONS.find(s => s.bookIds.includes(otherBookId));
            const hasExpl  = conn.hasExplanation !== false && conn.explanation?.trim().length > 0;

            // Intestazione di versetto in modalità verse
            const showVerseHeader = mode === 'verse' && (
              idx === 0 ||
              refForBook(displayConnections[idx - 1], bookId) !== fromRef
            );

            return (
              <React.Fragment key={conn.id}>
                {showVerseHeader && (
                  <Text style={styles.verseHeader}>{fromRef}</Text>
                )}
                <TouchableOpacity
                  style={[styles.connItem, !hasExpl && styles.connItemDim]}
                  onPress={() => setSelectedConnId(p => p === conn.id ? null : conn.id)}
                  activeOpacity={0.75}>

                  <View style={styles.connRefs}>
                    <Text style={styles.connRefFrom}>{fromRef}</Text>
                    <View style={[styles.connArrow, { backgroundColor: conn.color }]} />
                    <Text style={[styles.connRefTo, { color: otherSec?.color ?? COLORS.inkDim }]}>
                      {toRef}
                    </Text>
                  </View>

                  {hasExpl ? (
                    <Text style={styles.connExcerpt} numberOfLines={2}>
                      {conn.explanation}
                    </Text>
                  ) : (
                    <Text style={styles.connNoExpl}>
                      {t('text_no_expl')}
                    </Text>
                  )}

                  <View style={styles.connMeta}>
                    {conn.link_type ? (
                      <View style={[styles.typeBadge, { borderColor: conn.color + '60' }]}>
                        <Text style={[styles.typeBadgeText, { color: conn.color }]}>
                          {conn.link_type}
                        </Text>
                      </View>
                    ) : null}
                    {conn.score !== undefined && (
                      <Text style={styles.scoreText}>
                        {Math.round(conn.score * 100)}%
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </ScrollView>
      )}

      {/* Filter / sort modal */}
      <Modal
        visible={showFilterMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterMenu(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowFilterMenu(false)}>
          <View style={styles.filterMenu}>
            <Text style={styles.filterMenuTitle}>Ordina per</Text>
            {(['score', 'verse'] as SortMode[]).map(s => (
              <TouchableOpacity key={s}
                style={[styles.filterOption, sortMode === s && styles.filterOptionActive]}
                onPress={() => { setSortMode(s); handleSortChange(s); }}>
                <Text style={[styles.filterOptionText, sortMode === s && { color: COLORS.gold }]}>
                  {s === 'score' ? '% Percentuale rilevanza' : 'Ordine versetto (1:1, 1:2…)'}
                </Text>
                {sortMode === s && <Text style={styles.filterCheckmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {selectedConnection && (
        <View style={styles.detailOverlay}>
          <DetailPanel connection={selectedConnection}
            onClose={() => setSelectedConnId(null)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.parchment },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 52, paddingBottom: 10, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.2)',
  },
  backBtn:      { width: 80 },
  backBtnText:  { fontFamily: 'Cinzel_400Regular', fontSize: 12, color: COLORS.gold },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { fontFamily: 'Cinzel_600SemiBold', fontSize: 15, color: COLORS.gold, letterSpacing: 1 },
  headerSub:    { fontFamily: 'EBGaramond_400Regular', fontSize: 12, color: COLORS.inkDim, marginTop: 2 },
  gearBtn:      { width: 80, alignItems: 'flex-end' },
  gearIcon:     { fontSize: 18, color: 'rgba(201,168,76,0.5)' },

  modeTabs: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, gap: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.1)',
    alignItems: 'center',
  },
  modeTab:           { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  modeTabActive:     { backgroundColor: 'rgba(201,168,76,0.12)', borderColor: 'rgba(201,168,76,0.5)' },
  modeTabText:       { fontFamily: 'Cinzel_400Regular', fontSize: 11, color: COLORS.inkDim },
  modeTabTextActive: { color: COLORS.gold },
  sortBadge:         { marginLeft: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: 'rgba(201,168,76,0.1)' },
  sortBadgeText:     { fontFamily: 'Cinzel_400Regular', fontSize: 9, color: 'rgba(201,168,76,0.6)' },

  chartContainer: {
    paddingTop: 10, paddingBottom: 6,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.1)',
  },
  chartLabel: {
    fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 12,
    color: COLORS.inkDim, textAlign: 'center', marginBottom: 6,
  },
  chartRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 4, gap: 6,
  },
  barCol: { alignItems: 'center', gap: 4, minWidth: 28 },
  bar:    { width: 18, borderRadius: 2 },
  chNum:  { fontFamily: 'Cinzel_400Regular', fontSize: 9, color: COLORS.inkDim },

  // Verse selector bar
  verseBarContainer: {
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.1)',
    paddingVertical: 6,
  },
  verseBarRow: {
    flexDirection: 'row', paddingHorizontal: 12, gap: 6, alignItems: 'center',
  },
  verseChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)',
  },
  verseChipActive:     { backgroundColor: 'rgba(201,168,76,0.15)', borderColor: 'rgba(201,168,76,0.5)' },
  verseChipText:       { fontFamily: 'Cinzel_400Regular', fontSize: 11, color: COLORS.inkDim },
  verseChipTextActive: { color: COLORS.gold },
  verseChipCount:      { fontFamily: 'Cinzel_400Regular', fontSize: 9, color: 'rgba(201,168,76,0.5)' },

  // Verse header in list
  verseHeader: {
    fontFamily: 'Cinzel_600SemiBold', fontSize: 11,
    color: COLORS.gold, opacity: 0.7,
    paddingTop: 14, paddingBottom: 4, letterSpacing: 0.5,
  },

  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listScroll:  { flex: 1 },
  listContent: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  emptyText:   {
    fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 14,
    color: COLORS.inkDim, textAlign: 'center', paddingVertical: 32,
  },

  connItem:    {
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.02)', padding: 14, gap: 8,
  },
  connItemDim: { borderColor: 'rgba(201,168,76,0.1)', opacity: 0.75 },

  connRefs:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  connRefFrom: { fontFamily: 'Cinzel_600SemiBold', fontSize: 12, color: COLORS.gold },
  connArrow:   { height: 1, flex: 1, opacity: 0.7 },
  connRefTo:   { fontFamily: 'Cinzel_600SemiBold', fontSize: 12 },

  connExcerpt: {
    fontFamily: 'EBGaramond_400Regular', fontSize: 13,
    color: COLORS.ink, lineHeight: 19, opacity: 0.85,
  },
  connNoExpl: {
    fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 12,
    color: COLORS.inkDim, opacity: 0.6,
  },

  connMeta:      { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  typeBadge:     { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  typeBadgeText: { fontFamily: 'Cinzel_400Regular', fontSize: 9, letterSpacing: 0.8 },
  scoreText:     { fontFamily: 'Cinzel_400Regular', fontSize: 9, color: COLORS.inkDim, marginLeft: 'auto' as any },

  // Filter modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  filterMenu: {
    backgroundColor: '#1e1508',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: 'rgba(201,168,76,0.2)',
    gap: 4,
  },
  filterMenuTitle: {
    fontFamily: 'Cinzel_600SemiBold', fontSize: 13,
    color: COLORS.gold, letterSpacing: 1, marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 12,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(201,168,76,0.12)',
    marginBottom: 6,
  },
  filterOptionActive:  { borderColor: 'rgba(201,168,76,0.4)', backgroundColor: 'rgba(201,168,76,0.06)' },
  filterOptionText:    { fontFamily: 'EBGaramond_400Regular', fontSize: 15, color: COLORS.inkDim, flex: 1 },
  filterCheckmark:     { fontFamily: 'Cinzel_400Regular', fontSize: 14, color: COLORS.gold },

  detailOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    maxHeight: '65%', zIndex: 100,
  },
});

export default ChapterView;
