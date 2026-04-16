/**
 * ChapterView — Level 3
 * Bar chart dei capitoli + lista collegamenti, tutto dal DB.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { BOOKS } from '../data/books';
import { SECTIONS } from '../data/sections';
import { Connection } from '../data/types';
import { COLORS } from '../theme/colors';
import { getConnectionsForChapter, getChapterCounts } from '../utils/database';
import DetailPanel from './DetailPanel';

interface Props {
  bookId:    string;
  sectionId: string;
  onBack:    () => void;
}

function chapterFromRef(ref: string): number {
  const m = ref.match(/(\d+):/);
  return m ? parseInt(m[1]) : 0;
}
function chapterForConn(conn: Connection, bookId: string): number {
  if (conn.from === bookId) return chapterFromRef(conn.refA);
  if (conn.to   === bookId) return chapterFromRef(conn.refB);
  return 0;
}

const ChapterView: React.FC<Props> = ({ bookId, sectionId, onBack }) => {
  const book    = BOOKS.find(b => b.id === bookId);
  const section = SECTIONS.find(s => s.id === sectionId);

  const [chapterCounts,    setChapterCounts]    = useState<Record<number, number>>({});
  const [connections,      setConnections]      = useState<Connection[]>([]);
  const [selectedChapter,  setSelectedChapter]  = useState<number | null>(null);
  const [selectedConnId,   setSelectedConnId]   = useState<number | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [mode,             setMode]             = useState<'chapter' | 'verse'>('chapter');

  // Carica conteggi capitoli
  useEffect(() => {
    if (!book) return;
    setLoading(true);
    setSelectedChapter(null);
    setSelectedConnId(null);

    Promise.all([
      getChapterCounts(bookId),
      getConnectionsForChapter(bookId, null),
    ]).then(([counts, conns]) => {
      setChapterCounts(counts);
      setConnections(conns);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [bookId]);

  // Quando l'utente seleziona un capitolo, carica solo quelle connessioni
  const handleChapterPress = useCallback(async (ch: number) => {
    const next = selectedChapter === ch ? null : ch;
    setSelectedChapter(next);
    setSelectedConnId(null);

    setLoading(true);
    getConnectionsForChapter(bookId, next)
      .then(conns => { setConnections(conns); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookId, selectedChapter]);

  const chapters = useMemo(
    () => Object.keys(chapterCounts).map(Number).sort((a, b) => a - b),
    [chapterCounts],
  );
  const maxCount = useMemo(
    () => Math.max(...Object.values(chapterCounts), 1),
    [chapterCounts],
  );

  const selectedConnection = useMemo(
    () => (selectedConnId !== null ? connections.find(c => c.id === selectedConnId) ?? null : null),
    [selectedConnId, connections],
  );

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
          </Text>
          <Text style={styles.headerSub}>
            {connections.length.toLocaleString()} collegamenti
          </Text>
        </View>
        <View style={{ width: 80 }} />
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
      </View>

      {/* Chapter bar chart */}
      {mode === 'chapter' && chapters.length > 0 && (
        <View style={styles.chartContainer}>
          {selectedChapter !== null && (
            <Text style={styles.chartLabel}>
              Capitolo {selectedChapter} · {chapterCounts[selectedChapter] ?? 0} collegamenti
            </Text>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartRow}>
            {chapters.map(ch => {
              const cnt = chapterCounts[ch] ?? 0;
              const barH = Math.max(5, (cnt / maxCount) * 44);
              const isSel = selectedChapter === ch;
              return (
                <TouchableOpacity key={ch} style={styles.barCol}
                  onPress={() => handleChapterPress(ch)} activeOpacity={0.7}>
                  <View style={[styles.bar, {
                    height: barH,
                    backgroundColor: isSel ? COLORS.gold : section.color + '80',
                  }]} />
                  <Text style={[styles.chNum, isSel && { color: COLORS.gold }]}>
                    {ch}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
          {connections.length === 0 && (
            <Text style={styles.emptyText}>Nessun collegamento trovato.</Text>
          )}
          {connections.map(conn => {
            const fromRef = conn.from === bookId ? conn.refA : conn.refB;
            const toRef   = conn.from === bookId ? conn.refB : conn.refA;
            const otherBookId = conn.from === bookId ? conn.to : conn.from;
            const otherSec = SECTIONS.find(s => s.bookIds.includes(otherBookId));
            const hasExpl = conn.hasExplanation !== false && conn.explanation?.trim().length > 0;

            return (
              <TouchableOpacity key={conn.id} style={[
                  styles.connItem,
                  !hasExpl && styles.connItemDim,
                ]}
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
                    Testo disponibile · nessuna spiegazione
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
            );
          })}
        </ScrollView>
      )}

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
  backBtn:     { width: 80 },
  backBtnText: { fontFamily: 'Cinzel_400Regular', fontSize: 12, color: COLORS.gold },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { fontFamily: 'Cinzel_600SemiBold', fontSize: 15, color: COLORS.gold, letterSpacing: 1 },
  headerSub:    { fontFamily: 'EBGaramond_400Regular', fontSize: 12, color: COLORS.inkDim, marginTop: 2 },

  modeTabs: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, gap: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.1)',
  },
  modeTab:         { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  modeTabActive:   { backgroundColor: 'rgba(201,168,76,0.12)', borderColor: 'rgba(201,168,76,0.5)' },
  modeTabText:     { fontFamily: 'Cinzel_400Regular', fontSize: 11, color: COLORS.inkDim },
  modeTabTextActive: { color: COLORS.gold },

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

  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listScroll: { flex: 1 },
  listContent: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  emptyText: {
    fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 14,
    color: COLORS.inkDim, textAlign: 'center', paddingVertical: 32,
  },

  connItem: {
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.02)', padding: 14, gap: 8,
  },
  connItemDim: { borderColor: 'rgba(201,168,76,0.1)', opacity: 0.75 },

  connRefs: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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

  connMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  typeBadge: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  typeBadgeText: { fontFamily: 'Cinzel_400Regular', fontSize: 9, letterSpacing: 0.8 },
  scoreText: {
    fontFamily: 'Cinzel_400Regular', fontSize: 9,
    color: COLORS.inkDim, marginLeft: 'auto' as any,
  },

  detailOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    maxHeight: '65%', zIndex: 100,
  },
});

export default ChapterView;
