/**
 * SectionBooksPage — Level 1.5
 * Griglia dei libri di una sezione con conteggio connessioni dal DB.
 */
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { BOOKS } from '../data/books';
import { SECTIONS } from '../data/sections';
import { COLORS } from '../theme/colors';
import { getConnectionCountsForBooks } from '../utils/database';
import { useLang } from '../contexts/LangContext';
import { t, sectionLabel } from '../i18n';

interface Props {
  sectionId: string;
  onBookPress: (bookId: string) => void;
  onBack: () => void;
}

const SectionBooksPage: React.FC<Props> = ({ sectionId, onBookPress, onBack }) => {
  const section = SECTIONS.find(s => s.id === sectionId);
  useLang(); // subscribe to lang changes for re-render

  const [counts,  setCounts]  = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const books = useMemo(
    () => BOOKS.filter(b => section?.bookIds.includes(b.id)),
    [section],
  );

  useEffect(() => {
    if (!section) return;
    getConnectionCountsForBooks(section.bookIds)
      .then(c => { setCounts(c); setLoading(false); })
      .catch(() => setLoading(false));
  }, [section]);

  if (!section) return null;

  const totalConnections = Object.values(counts).reduce((a, b) => a + b, 0) / 2 | 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backBtnText}>‹ {t('back_sections')}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.sectionName, { color: section.color }]}>
            {sectionLabel(section.id).toUpperCase()}
          </Text>
          {!loading && (
            <Text style={styles.sectionMeta}>
              {books.length} {t('books')} · {totalConnections.toLocaleString()} {t('connections_abbr')}
            </Text>
          )}
        </View>
        <View style={{ width: 70 }} />
      </View>

      <Text style={styles.instruction}>
        {t('select_book')}
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.gold} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}>
          {books.map(book => {
            const count = counts[book.id] ?? 0;
            const active = count > 0;
            const label = count >= 1000
              ? `${(count / 1000).toFixed(1)}k`
              : count > 0 ? String(count) : null;

            return (
              <TouchableOpacity key={book.id}
                style={[
                  styles.bookCard,
                  { borderColor: active ? section.color + '60' : 'rgba(168,144,96,0.2)' },
                  active && styles.bookCardActive,
                ]}
                onPress={() => onBookPress(book.id)}
                activeOpacity={0.75}>
                <Text
                  style={[styles.bookName, { color: active ? section.color : COLORS.inkDim }]}
                  numberOfLines={2}>
                  {book.name}
                </Text>
                {label !== null ? (
                  <View style={[styles.countBadge, { borderColor: section.color + '50' }]}>
                    <Text style={[styles.countText, { color: section.color }]}>{label}</Text>
                  </View>
                ) : (
                  <Text style={styles.noData}>—</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.parchment },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.2)',
  },
  backBtn:    { width: 70 },
  backBtnText: {
    fontFamily: 'Cinzel_400Regular', fontSize: 13,
    color: COLORS.gold, letterSpacing: 0.5,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  sectionName: {
    fontFamily: 'Cinzel_900Black', fontSize: 18, letterSpacing: 3,
  },
  sectionMeta: {
    fontFamily: 'EBGaramond_400Regular', fontSize: 12,
    color: COLORS.inkDim, marginTop: 2,
  },
  instruction: {
    fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 13,
    color: COLORS.inkDim, textAlign: 'center',
    paddingVertical: 14, paddingHorizontal: 20,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingBottom: 32, gap: 10,
  },
  bookCard: {
    width: '30%', minHeight: 80,
    borderWidth: 1, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12, justifyContent: 'space-between',
  },
  bookCardActive: { backgroundColor: 'rgba(201,168,76,0.05)' },
  bookName: {
    fontFamily: 'Cinzel_400Regular', fontSize: 11,
    letterSpacing: 0.5, lineHeight: 16,
  },
  countBadge: {
    marginTop: 8, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start',
  },
  countText: { fontFamily: 'Cinzel_400Regular', fontSize: 10 },
  noData: {
    fontFamily: 'EBGaramond_400Regular', fontSize: 12,
    color: 'rgba(168,144,96,0.3)', marginTop: 8,
  },
});

export default SectionBooksPage;
