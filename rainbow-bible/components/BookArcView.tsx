/**
 * BookArcView — Level 2
 * Archi del libro con paginazione (400 per pagina) e filtri sezione dal DB.
 */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';

const SCREEN_H = Dimensions.get('window').height;
const GRAPH_H  = Math.round(SCREEN_H * 0.48);
import { BOOKS } from '../data/books';
import { SECTIONS } from '../data/sections';
import { Connection } from '../data/types';
import { COLORS } from '../theme/colors';
import {
  getConnectionsForBook,
  getConnectionsForBookCount,
  getConnectedBooksForBook,
  PAGE_SIZE,
} from '../utils/database';
import ArcVisualization, { ARC_VIZ_W, LABEL_AREA } from './ArcVisualization';
import ArcTouchLayer from './ArcTouchLayer';
import DetailPanel from './DetailPanel';
import { useLang } from '../contexts/LangContext';
import { t, sectionLabel, bookName } from '../i18n';

interface Props {
  bookId:          string;
  sectionId:       string;
  onBack:          () => void;
  onChapterPress:  (bookId: string) => void;
}

const BookArcView: React.FC<Props> = ({ bookId, sectionId, onBack, onChapterPress }) => {
  const { lang } = useLang(); // re-render + refetch on language change
  const book    = BOOKS.find(b => b.id === bookId);
  const section = SECTIONS.find(s => s.id === sectionId);

  const [connections,       setConnections]       = useState<Connection[]>([]);
  const [totalCount,        setTotalCount]        = useState(0);
  const [page,              setPage]              = useState(0);
  const [loading,           setLoading]           = useState(true);
  const [sectionFilter,     setSectionFilter]     = useState<string | null>(null);
  const [connectedSections, setConnectedSections] = useState<typeof SECTIONS>([]);
  const [selectedId,        setSelectedId]        = useState<number | null>(null);
  const [scrubbingId,       setScrubbingId]       = useState<number | null>(null);
  const [scrollX,           setScrollX]           = useState(0);
  const outerScrollRef = useRef<ScrollView>(null);

  // Carica tutti i libri collegati (una volta) per popolare i tab sezione
  useEffect(() => {
    setConnectedSections([]);
    setSectionFilter(null);
    setPage(0);

    getConnectedBooksForBook(bookId)
      .then(bookIds => {
        const ids = new Set(bookIds);
        const secs = SECTIONS.filter(
          s => s.id !== sectionId && s.bookIds.some(bid => ids.has(bid))
        );
        setConnectedSections(secs);
      })
      .catch(console.warn);
  }, [bookId, sectionId]);

  // Carica connessioni quando bookId, sectionFilter o page cambiano
  useEffect(() => {
    setLoading(true);
    setSelectedId(null);

    const secBookIds = sectionFilter
      ? (SECTIONS.find(s => s.id === sectionFilter)?.bookIds ?? null)
      : null;

    // Con filtro sezione: carica tutto (max 2000), nessuna paginazione
    // Senza filtro: carica una pagina da 400
    const isFiltered = sectionFilter !== null;
    const limit  = isFiltered ? 2000 : PAGE_SIZE;
    const offset = isFiltered ? 0    : page * PAGE_SIZE;

    Promise.all([
      getConnectionsForBook(bookId, secBookIds, limit, offset),
      getConnectionsForBookCount(bookId, secBookIds),
    ])
      .then(([conns, count]) => {
        setConnections(conns);
        setTotalCount(count);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookId, sectionFilter, page, lang]);

  const selectedConnection = useMemo(
    () => (selectedId !== null ? connections.find(c => c.id === selectedId) ?? null : null),
    [selectedId, connections],
  );

  // Connections sharing the same book pair as the selected one (for prev/next nav)
  const pairConnections = useMemo(() => {
    if (!selectedConnection) return [];
    const a = selectedConnection.from;
    const b = selectedConnection.to;
    return connections.filter(c =>
      (c.from === a && c.to === b) || (c.from === b && c.to === a)
    );
  }, [selectedConnection, connections]);

  const pairIndex = useMemo(
    () => pairConnections.findIndex(c => c.id === selectedId),
    [pairConnections, selectedId],
  );

  const baseline = GRAPH_H - LABEL_AREA - 4;

  // Auto-scroll verso il detail panel quando si seleziona un arco
  useEffect(() => {
    if (selectedId !== null) {
      setTimeout(() => {
        outerScrollRef.current?.scrollTo({ y: GRAPH_H - 60, animated: true });
      }, 120);
    }
  }, [selectedId]);

  const handleSelect = useCallback((id: number | null) => {
    setSelectedId(prev => (id !== null && prev === id ? null : id));
  }, []);

  const handleSectionFilter = useCallback((newFilter: string | null) => {
    setSectionFilter(newFilter);
    setPage(0);
    setSelectedId(null);
  }, []);

  // ── Header count display ──────────────────────────────────────────────────
  const isFiltered = sectionFilter !== null;
  const fromIdx    = isFiltered ? 1 : page * PAGE_SIZE + 1;
  const toIdx      = isFiltered
    ? connections.length
    : Math.min((page + 1) * PAGE_SIZE, totalCount);
  const hasPrev = !isFiltered && page > 0;
  const hasNext = !isFiltered && (page + 1) * PAGE_SIZE < totalCount;

  if (!book || !section) return null;

  return (
    <View style={styles.container}>
      {/* Header — fisso in cima, fuori dallo scroll */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtnText}>‹ {sectionLabel(section.id)}</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>{t('connections')}</Text>
          <Text style={[styles.headerBook, { color: section.color }]}>
            {bookName(book.id).toUpperCase()}
          </Text>

          {!loading && (
            <View style={styles.headerCountRow}>
              {hasPrev && (
                <TouchableOpacity
                  onPress={() => setPage(p => p - 1)}
                  style={styles.pageBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Text style={styles.pageBtnText}>‹</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.headerCount}>
                {fromIdx.toLocaleString()}–{toIdx.toLocaleString()} : {totalCount.toLocaleString()} {t('arcs')}
              </Text>
              {hasNext && (
                <TouchableOpacity
                  onPress={() => setPage(p => p + 1)}
                  style={styles.pageBtn}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Text style={styles.pageBtnText}>›</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {loading && (
            <ActivityIndicator color={COLORS.gold} size="small" style={{ marginTop: 4 }} />
          )}
        </View>

        <TouchableOpacity style={styles.chapterBtn} onPress={() => onChapterPress(bookId)}>
          <Text style={styles.chapterBtnText}>{t('chapters')}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs — fissi, fuori dallo scroll */}
      {connectedSections.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll} contentContainerStyle={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, sectionFilter === null && styles.tabActive]}
            onPress={() => handleSectionFilter(null)}>
            <Text style={[styles.tabText, sectionFilter === null && styles.tabTextActive]}>
              {t('all')}
            </Text>
          </TouchableOpacity>
          {connectedSections.map(sec => (
            <TouchableOpacity key={sec.id}
              style={[
                styles.tab,
                sectionFilter === sec.id && {
                  backgroundColor: sec.color + '20',
                  borderColor:     sec.color + '60',
                },
              ]}
              onPress={() => handleSectionFilter(sectionFilter === sec.id ? null : sec.id)}>
              <Text style={[styles.tabText, sectionFilter === sec.id && { color: sec.color }]}>
                {sectionLabel(sec.id)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ScrollView verticale: grafico + panel + chips + hint */}
      <ScrollView
        ref={outerScrollRef}
        style={styles.outerScroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
      >
        {/* Grafico archi — altezza fissa */}
        <View style={styles.vizContainer}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={COLORS.gold} />
              <Text style={styles.loadingText}>{t('loading_arcs')}</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16} bounces={false}
              onScroll={e => setScrollX(e.nativeEvent.contentOffset.x)}>
              <View style={{ width: ARC_VIZ_W, height: GRAPH_H }}>
                <ArcVisualization
                  activeFilter="all"
                  selectedId={selectedId}
                  scrubbingId={scrubbingId}
                  focusBookId={bookId}
                  displayHeight={GRAPH_H}
                  connections={connections}
                />
                <ArcTouchLayer
                  svgDisplayWidth={ARC_VIZ_W}
                  svgDisplayHeight={GRAPH_H}
                  viewBoxW={ARC_VIZ_W}
                  viewBoxH={GRAPH_H}
                  baseline={baseline}
                  visibleConnections={connections}
                  scrollOffsetX={scrollX}
                  onSelect={handleSelect}
                  onScrub={setScrubbingId}
                />
              </View>
            </ScrollView>
          )}
        </View>

        {/* Hint sopra il panel */}
        <Text style={styles.hint}>{t('hint')}</Text>

        {/* Detail panel — inline sotto il grafico, nessun overlay */}
        {selectedConnection && (
          <DetailPanel
            connection={selectedConnection}
            onClose={() => setSelectedId(null)}
            scrollEnabled={false}
            siblingIndex={pairIndex}
            siblingTotal={pairConnections.length}
            onPrev={pairIndex > 0
              ? () => setSelectedId(pairConnections[pairIndex - 1].id)
              : undefined}
            onNext={pairIndex < pairConnections.length - 1
              ? () => setSelectedId(pairConnections[pairIndex + 1].id)
              : undefined}
          />
        )}

        {/* Connection list — verse-level, scrollable */}
        {!loading && connections.length > 0 && (
          <View style={styles.connListSection}>
            <View style={styles.connListHeader}>
              <Text style={styles.connListLabel}>
                {t('connections_list') + (sectionFilter
                  ? ` · ${sectionLabel(sectionFilter)}`
                  : '')}
              </Text>
              <Text style={styles.connListCount}>{connections.length.toLocaleString()}</Text>
            </View>

            {connections.map(conn => {
              const fromRef     = conn.from === bookId ? conn.refA : conn.refB;
              const toRef       = conn.from === bookId ? conn.refB : conn.refA;
              const otherBookId = conn.from === bookId ? conn.to   : conn.from;
              const otherSec    = SECTIONS.find(s => s.bookIds.includes(otherBookId));
              const hasExpl     = conn.hasExplanation !== false && (conn.explanation?.trim().length ?? 0) > 0;
              const isSelected  = selectedId === conn.id;

              return (
                <TouchableOpacity
                  key={conn.id}
                  style={[styles.connItem, isSelected && styles.connItemSelected]}
                  onPress={() => handleSelect(conn.id)}
                  activeOpacity={0.75}>
                  <View style={styles.connRefs}>
                    <Text style={styles.connRefFrom}>{fromRef}</Text>
                    <View style={[styles.connArrow, { backgroundColor: conn.color }]} />
                    <Text style={[styles.connRefTo, { color: otherSec?.color ?? COLORS.inkDim }]}>{toRef}</Text>
                    {conn.score !== undefined && (
                      <Text style={styles.scoreText}>{Math.round(conn.score * 100)}%</Text>
                    )}
                  </View>
                  {hasExpl
                    ? <Text style={styles.connExcerpt} numberOfLines={2}>{conn.explanation}</Text>
                    : <Text style={styles.connNoExpl}>{t('no_explanation_short')}</Text>}
                  {conn.link_type ? (
                    <View style={[styles.typeBadge, { borderColor: conn.color + '60' }]}>
                      <Text style={[styles.typeBadgeText, { color: conn.color }]}>{conn.link_type}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}

            {(hasPrev || hasNext) && (
              <View style={styles.pagRow}>
                {hasPrev && (
                  <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setPage(p => p - 1)}>
                    <Text style={styles.loadMoreText}>‹ {t('prev_page')}</Text>
                  </TouchableOpacity>
                )}
                {hasNext && (
                  <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setPage(p => p + 1)}>
                    <Text style={styles.loadMoreText}>{t('next_page')} ›</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
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
  headerLabel:  { fontFamily: 'Cinzel_400Regular', fontSize: 9, color: COLORS.inkDim, letterSpacing: 2 },
  headerBook:   { fontFamily: 'Cinzel_900Black', fontSize: 17, letterSpacing: 2, marginTop: 1 },

  headerCountRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3,
  },
  headerCount: {
    fontFamily: 'EBGaramond_400Regular', fontSize: 11, color: COLORS.inkDim,
  },
  pageBtn: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  pageBtnText: {
    fontFamily: 'Cinzel_400Regular', fontSize: 14, color: COLORS.gold, lineHeight: 16,
  },

  chapterBtn:     { width: 80, alignItems: 'flex-end' },
  chapterBtnText: { fontFamily: 'Cinzel_400Regular', fontSize: 11, color: COLORS.gold },

  tabsScroll: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.1)' },
  tabsRow:    { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  tab:        {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)',
  },
  tabActive:     { backgroundColor: 'rgba(201,168,76,0.15)', borderColor: 'rgba(201,168,76,0.5)' },
  tabText:       { fontFamily: 'Cinzel_400Regular', fontSize: 11, color: COLORS.inkDim },
  tabTextActive: { color: COLORS.gold },

  outerScroll:  { flex: 1 },
  vizContainer: { height: GRAPH_H, overflow: 'hidden' },
  center:       { height: GRAPH_H, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:  { fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 13, color: COLORS.inkDim },

  connListSection: {
    borderTopWidth: 1, borderTopColor: 'rgba(201,168,76,0.1)',
  },
  connListHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  connListLabel: {
    fontFamily: 'Cinzel_400Regular', fontSize: 8,
    color: COLORS.inkDim, letterSpacing: 1.5,
  },
  connListCount: {
    fontFamily: 'EBGaramond_400Regular', fontSize: 11, color: COLORS.inkDim,
  },
  connItem: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(201,168,76,0.06)',
  },
  connItemSelected: {
    backgroundColor: 'rgba(201,168,76,0.06)',
  },
  connRefs: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4,
  },
  connRefFrom: {
    fontFamily: 'Cinzel_400Regular', fontSize: 11, color: COLORS.ink, flex: 1,
  },
  connArrow: {
    width: 20, height: 2, borderRadius: 1, opacity: 0.7,
  },
  connRefTo: {
    fontFamily: 'Cinzel_400Regular', fontSize: 11, flex: 1, textAlign: 'right',
  },
  scoreText: {
    fontFamily: 'Cinzel_400Regular', fontSize: 9, color: COLORS.inkDim, marginLeft: 4,
  },
  connExcerpt: {
    fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 12,
    color: COLORS.inkDim, lineHeight: 18, marginBottom: 4,
  },
  connNoExpl: {
    fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 11,
    color: COLORS.inkDim, opacity: 0.5, marginBottom: 4,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  typeBadgeText: {
    fontFamily: 'Cinzel_400Regular', fontSize: 9, letterSpacing: 0.5,
  },
  pagRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(201,168,76,0.1)',
  },

  loadMoreBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
  },
  loadMoreText: {
    fontFamily: 'Cinzel_400Regular', fontSize: 11, color: COLORS.gold,
  },

  hint: {
    fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 11,
    color: COLORS.inkDim, textAlign: 'center', paddingVertical: 8, opacity: 0.7,
  },
});

export default BookArcView;
