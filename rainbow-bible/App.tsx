/**
 * App.tsx — 4-level navigation
 *
 * macro   → MacroView        (8 sezioni, archi aggregati)
 * section → SectionBooksPage (libri della sezione)
 * book    → BookArcView      (archi del libro con paginazione e filtri sezione)
 * chapter → ChapterView      (capitoli + lista collegamenti per capitolo/versetto)
 */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDB } from './contexts/DBContext';
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
import { DBProvider } from './contexts/DBContext';
import { LangProvider } from './contexts/LangContext';
import LoadingScreen from './components/LoadingScreen';
import MacroView from './components/MacroView';
import SectionBooksPage from './components/SectionBooksPage';
import BookArcView from './components/BookArcView';
import ChapterView from './components/ChapterView';

type AppView = 'macro' | 'section' | 'book' | 'chapter';

// ── Navigator (inside DBProvider) ─────────────────────────────────────────
function Navigator() {
  const { loading: dbLoading } = useDB();
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

  // Mostra la loading screen finché font e DB non sono pronti
  if (!fontsLoaded || dbLoading) {
    return <LoadingScreen />;
  }

  // ── Navigation handlers ──────────────────────────────────────────────────
  const goSection = (sid: string) => { setSectionId(sid); setView('section'); };
  const goBook    = (bid: string) => { setBookId(bid);    setView('book'); };
  const goChapter = (bid: string) => { setBookId(bid);    setView('chapter'); };

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
      <LangProvider>
        <DBProvider>
          <View style={styles.root}>
            <Navigator />
          </View>
        </DBProvider>
      </LangProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
});
