/**
 * App.tsx — 4-level navigation con DB SQLite
 *
 * macro   → MacroView        (8 sezioni aggregated arcs)
 * section → SectionBooksPage (libri della sezione)
 * book    → BookArcView      (archi del libro con filtri sezione)
 * chapter → ChapterView      (capitoli + lista collegamenti)
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Cinzel_400Regular,
  Cinzel_600SemiBold,
  Cinzel_900Black,
} from '@expo-google-fonts/cinzel';
import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
} from '@expo-google-fonts/eb-garamond';

import { COLORS } from './theme/colors';
import { DBProvider, useDB } from './contexts/DBContext';
import MacroView from './components/MacroView';
import SectionBooksPage from './components/SectionBooksPage';
import BookArcView from './components/BookArcView';
import ChapterView from './components/ChapterView';

type AppView = 'macro' | 'section' | 'book' | 'chapter';

// ── Navigator (inside DBProvider) ─────────────────────────────────────────
function Navigator() {
  const { loading, error, db } = useDB();

  const [view,      setView]      = useState<AppView>('macro');
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [bookId,    setBookId]    = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_600SemiBold,
    Cinzel_900Black,
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
  });

  // ── Splash: fonts + DB ──────────────────────────────────────────────────
  if (!fontsLoaded || loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashGlyph}>✦</Text>
        <Text style={styles.splashLabel}>
          {loading ? 'Caricamento database…' : ''}
        </Text>
        {loading && (
          <ActivityIndicator
            color={COLORS.gold}
            size="small"
            style={{ marginTop: 16 }}
          />
        )}
      </View>
    );
  }

  // ── DB error banner (non blocca la navigazione — usa fallback statico) ───
  if (error) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashGlyph}>⚠</Text>
        <Text style={[styles.splashLabel, { color: '#e07a7a', textAlign: 'center', paddingHorizontal: 24 }]}>
          DB non caricato — modalità statica (32 connessioni){'\n\n'}
          {error}
        </Text>
      </View>
    );
  }

  // ── Navigation handlers ──────────────────────────────────────────────────
  const goSection = (sid: string) => {
    setSectionId(sid);
    setView('section');
  };

  const goBook = (bid: string) => {
    setBookId(bid);
    setView('book');
  };

  const goChapter = (bid: string) => {
    setBookId(bid);
    setView('chapter');
  };

  const goBack = () => {
    switch (view) {
      case 'chapter': setView('book');    break;
      case 'book':    setView('section'); break;
      case 'section': setView('macro');   break;
      default:        setView('macro');
    }
  };

  // ── Views ────────────────────────────────────────────────────────────────
  return (
    <>
      {view === 'macro' && (
        <MacroView onSectionPress={goSection} />
      )}
      {view === 'section' && sectionId && (
        <SectionBooksPage
          sectionId={sectionId}
          onBookPress={goBook}
          onBack={goBack}
        />
      )}
      {view === 'book' && bookId && sectionId && (
        <BookArcView
          bookId={bookId}
          sectionId={sectionId}
          onBack={goBack}
          onChapterPress={goChapter}
        />
      )}
      {view === 'chapter' && bookId && sectionId && (
        <ChapterView
          bookId={bookId}
          sectionId={sectionId}
          onBack={goBack}
        />
      )}
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DBProvider>
        <View style={styles.root}>
          <Navigator />
        </View>
      </DBProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
  splash: {
    flex: 1,
    backgroundColor: COLORS.parchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashGlyph: {
    color: COLORS.gold,
    fontSize: 42,
  },
  splashLabel: {
    fontFamily: 'EBGaramond_400Regular_Italic',
    fontSize: 14,
    color: COLORS.inkDim,
    marginTop: 12,
    letterSpacing: 0.5,
  },
});
