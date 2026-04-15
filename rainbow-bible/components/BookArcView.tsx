/**
 * BookArcView — Level 2
 * Archi del libro selezionato, caricati dal DB (o fallback statico).
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { BOOKS } from '../data/books';
import { CONNECTIONS } from '../data/connections';   // fallback
import { SECTIONS } from '../data/sections';
import { Connection } from '../data/types';
import { COLORS } from '../theme/colors';
import { useDB } from '../contexts/DBContext';
import { getConnectionsForBook } from '../utils/database';
import ArcVisualization, { ARC_VIZ_W, LABEL_AREA } from './ArcVisualization';
import ArcTouchLayer from './ArcTouchLayer';
import DetailPanel from './DetailPanel';

interface Props {
  bookId:          string;
  sectionId:       string;
  onBack:          () => void;
  onChapterPress:  (bookId: string) => void;
}

const BookArcView: React.FC<Props> = ({ bookId, sectionId, onBack, onChapterPress }) => {
  const { db } = useDB();
  const book    = BOOKS.find(b => b.id === bookId);
  const section = SECTIONS.find(s => s.id === sectionId);

  const [allConnections, setAllConnections] = useState<Connection[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [sectionFilter,  setSectionFilter]  = useState<string | null>(null);
  const [selectedId,     setSelectedId]     = useState<number | null>(null);
  const [scrubbingId,    setScrubbingId]    = useState<number | null>(null);
  const [vizH,           setVizH]           = useState(0);
  const [scrollX,        setScrollX]        = useState(0);

  // Carica connessioni
  useEffect(() => {
    setLoading(true);
    setSelectedId(null);
    setSectionFilter(null);

    if (db) {
      getConnectionsForBook(db, bookId)
        .then(rows => { setAllConnections(rows); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      // Fallback statico
      setAllConnections(
        CONNECTIONS.filter(c => c.from === bookId || c.to === bookId)
      );
      setLoading(false);
    }
  }, [db, bookId]);

  // Filtro per sezione di destinazione
  const filtered = useMemo<Connection[]>(() => {
    if (!sectionFilter) return allConnections;
    return allConnections.filter(c => {
      const otherId = c.from === bookId ? c.to : c.from;
      return SECTIONS.find(s => s.bookIds.includes(otherId))?.id === sectionFilter;
    });
  }, [allConnections, sectionFilter, bookId]);

  // Sezioni collegate (per i tab filtro)
  const connectedSections = useMemo(() => {
    const ids = new Set<string>();
    for (const c of allConnections) {
      const otherId = c.from === bookId ? c.to : c.from;
      const s = SECTIONS.find(sec => sec.bookIds.includes(otherId));
      if (s && s.id !== sectionId) ids.add(s.id);
    }
    return SECTIONS.filter(s => ids.has(s.id));
  }, [allConnections, bookId, sectionId]);

  // Libri collegati (visibili con il filtro attivo)
  const connectedBooks = useMemo(() => {
    const ids = new Set<string>();
    for (const c of filtered) ids.add(c.from === bookId ? c.to : c.from);
    return BOOKS.filter(b => ids.has(b.id));
  }, [filtered, bookId]);

  const selectedConnection = useMemo(
    () => (selectedId !== null ? filtered.find(c => c.id === selectedId) ?? null : null),
    [selectedId, filtered],
  );

  const baseline = vizH > 0 ? vizH - LABEL_AREA - 4 : 300;

  const handleSelect = useCallback((id: number | null) => {
    setSelectedId(prev => (id !== null && prev === id ? null : id));
  }, []);

  if (!book || !section) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtnText}>‹ {section.label}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>CONNESSIONI</Text>
          <Text style={[styles.headerBook, { color: section.color }]}>
            {book.name.toUpperCase()}
          </Text>
          {!loading && (
            <Text style={styles.headerCount}>
              {filtered.length.toLocaleString()} archi
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.chapterBtn} onPress={() => onChapterPress(bookId)}>
          <Text style={styles.chapterBtnText}>Capitoli</Text>
        </TouchableOpacity>
      </View>

      {/* Section filter tabs */}
      {connectedSections.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll} contentContainerStyle={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, sectionFilter === null && styles.tabActive]}
            onPress={() => { setSectionFilter(null); setSelectedId(null); }}>
            <Text style={[styles.tabText, sectionFilter === null && styles.tabTextActive]}>
              Tutti
            </Text>
          </TouchableOpacity>
          {connectedSections.map(sec => (
            <TouchableOpacity key={sec.id}
              style={[styles.tab,
                sectionFilter === sec.id && { backgroundColor: sec.color + '20', borderColor: sec.color + '60' }]}
              onPress={() => { setSectionFilter(p => p === sec.id ? null : sec.id); setSelectedId(null); }}>
              <Text style={[styles.tabText, sectionFilter === sec.id && { color: sec.color }]}>
                {sec.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Arc visualization */}
      <View style={styles.vizContainer} onLayout={e => setVizH(e.nativeEvent.layout.height)}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLORS.gold} />
            <Text style={styles.loadingText}>Caricamento archi…</Text>
          </View>
        ) : vizH > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16} bounces={false}
            onScroll={e => setScrollX(e.nativeEvent.contentOffset.x)}>
            <View style={{ width: ARC_VIZ_W, height: vizH }}>
              <ArcVisualization
                activeFilter="all"
                selectedId={selectedId}
                scrubbingId={scrubbingId}
                focusBookId={bookId}
                displayHeight={vizH}
                connections={filtered}
              />
              <ArcTouchLayer
                svgDisplayWidth={ARC_VIZ_W}
                svgDisplayHeight={vizH}
                viewBoxW={ARC_VIZ_W}
                viewBoxH={vizH}
                baseline={baseline}
                visibleConnections={filtered}
                scrollOffsetX={scrollX}
                onSelect={handleSelect}
                onScrub={setScrubbingId}
              />
            </View>
          </ScrollView>
        )}
      </View>

      {/* Connected books */}
      {!loading && connectedBooks.length > 0 && (
        <View style={styles.booksSection}>
          <Text style={styles.booksSectionLabel}>LIBRI COLLEGATI</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.booksRow}>
            {connectedBooks.map(b => {
              const sec = SECTIONS.find(s => s.bookIds.includes(b.id));
              return (
                <View key={b.id}
                  style={[styles.chip, { borderColor: (sec?.color ?? COLORS.gold) + '60' }]}>
                  <Text style={[styles.chipText, { color: sec?.color ?? COLORS.inkDim }]}>
                    {b.name}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      <Text style={styles.hint}>Tieni premuto e scorri · Tocca per selezionare</Text>

      {/* Detail overlay */}
      {selectedConnection && (
        <View style={styles.detailOverlay}>
          <DetailPanel connection={selectedConnection} onClose={() => setSelectedId(null)} />
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
  backBtn:       { width: 80 },
  backBtnText:   { fontFamily: 'Cinzel_400Regular', fontSize: 12, color: COLORS.gold },
  headerCenter:  { flex: 1, alignItems: 'center' },
  headerLabel:   { fontFamily: 'Cinzel_400Regular', fontSize: 9, color: COLORS.inkDim, letterSpacing: 2 },
  headerBook:    { fontFamily: 'Cinzel_900Black', fontSize: 17, letterSpacing: 2, marginTop: 1 },
  headerCount:   { fontFamily: 'EBGaramond_400Regular', fontSize: 11, color: COLORS.inkDim, marginTop: 2 },
  chapterBtn:    { width: 80, alignItems: 'flex-end' },
  chapterBtnText: { fontFamily: 'Cinzel_400Regular', fontSize: 11, color: COLORS.gold },

  tabsScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.1)' },
  tabsRow:    { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  tab:        { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)' },
  tabActive:  { backgroundColor: 'rgba(201,168,76,0.15)', borderColor: 'rgba(201,168,76,0.5)' },
  tabText:    { fontFamily: 'Cinzel_400Regular', fontSize: 11, color: COLORS.inkDim },
  tabTextActive: { color: COLORS.gold },

  vizContainer: { flex: 1, overflow: 'hidden' },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:  { fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 13, color: COLORS.inkDim },

  booksSection:      { paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(201,168,76,0.1)' },
  booksSectionLabel: { fontFamily: 'Cinzel_400Regular', fontSize: 8, color: COLORS.inkDim, letterSpacing: 1.5, marginBottom: 8 },
  booksRow:          { flexDirection: 'row', gap: 8 },
  chip:              { paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)' },
  chipText:          { fontFamily: 'Cinzel_400Regular', fontSize: 11 },

  hint: {
    fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 11,
    color: COLORS.inkDim, textAlign: 'center', paddingVertical: 6, opacity: 0.7,
  },
  detailOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    maxHeight: '62%', zIndex: 100,
  },
});

export default BookArcView;
