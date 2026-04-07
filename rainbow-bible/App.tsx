import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
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
import { FilterType } from './data/types';
import { CONNECTIONS } from './data/connections';
import { COLORS } from './theme/colors';
import { TYPOGRAPHY } from './theme/typography';
import ArcVisualization from './components/ArcVisualization';
import FilterBar from './components/FilterBar';
import DetailPanel from './components/DetailPanel';
import Legend from './components/Legend';
import ZoomableView from './components/ZoomableView';

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [svgZoomed, setSvgZoomed] = useState(false);
  // Height of the SVG container measured via onLayout (landscape only)
  const [svgContainerH, setSvgContainerH] = useState(0);

  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_600SemiBold,
    Cinzel_900Black,
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
  });

  const selectedConnection =
    selectedId !== null
      ? CONNECTIONS.find((c) => c.id === selectedId) ?? null
      : null;

  const handleArcPress = useCallback((id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    setSelectedId(null);
  }, []);

  const handleZoomChange = useCallback((zoomed: boolean) => {
    setSvgZoomed(zoomed);
  }, []);

  if (!fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>✦</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  // ── LANDSCAPE layout ────────────────────────────────────────────────────────
  if (isLandscape) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.root, styles.landscapeRoot]}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.parchment} />

          {/* Compact header */}
          <View style={styles.landscapeHeader}>
            <Text style={styles.landscapeTitle}>RAINBOW BIBLE</Text>
            <Text style={styles.landscapeSubtitle}>
              Tocca un arco · Pizzica per zoom · Doppio tap per reset
            </Text>
          </View>

          {/* Compact filter bar */}
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            compact
          />

          {/* SVG fills all remaining height */}
          <View
            style={styles.landscapeVizContainer}
            onLayout={(e) => setSvgContainerH(e.nativeEvent.layout.height)}
          >
            <ZoomableView
              style={styles.zoomContainer}
              onZoomChange={handleZoomChange}
            >
              <ArcVisualization
                activeFilter={activeFilter}
                selectedId={selectedId}
                onArcPress={handleArcPress}
                svgDisplayHeight={svgContainerH > 0 ? svgContainerH : undefined}
              />
            </ZoomableView>
          </View>

          {/* Detail panel: overlay at bottom when an arc is selected */}
          {selectedConnection && (
            <View style={styles.landscapeDetailOverlay}>
              <DetailPanel
                connection={selectedConnection}
                onClose={handleClose}
              />
            </View>
          )}
        </View>
      </GestureHandlerRootView>
    );
  }

  // ── PORTRAIT layout ─────────────────────────────────────────────────────────
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.parchment} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>RAINBOW BIBLE</Text>
          <Text style={styles.subtitle}>
            Visualizzazione dei collegamenti tra i libri sacri
          </Text>
        </View>

        {/* Filter bar */}
        <FilterBar activeFilter={activeFilter} onFilterChange={handleFilterChange} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!svgZoomed}
        >
          {/* Hint */}
          <Text style={styles.hint}>
            Tocca un arco · Pizzica per zoom · Doppio tap per reset
          </Text>

          {/* SVG Visualization */}
          <ZoomableView
            style={styles.zoomWrapper}
            onZoomChange={handleZoomChange}
          >
            <ArcVisualization
              activeFilter={activeFilter}
              selectedId={selectedId}
              onArcPress={handleArcPress}
            />
          </ZoomableView>

          {/* Detail panel */}
          {selectedConnection && (
            <DetailPanel
              connection={selectedConnection}
              onClose={handleClose}
            />
          )}

          {/* Legend */}
          <Legend />
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },

  // ── Loading ──────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.parchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.gold,
    fontSize: 40,
  },

  // ── Portrait ─────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  title: {
    ...TYPOGRAPHY.appTitle,
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  hint: {
    ...TYPOGRAPHY.hint,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  zoomWrapper: {
    marginHorizontal: 8,
    marginBottom: 8,
  },

  // ── Landscape ────────────────────────────────────────────────────────────
  landscapeRoot: {
    flexDirection: 'column',
  },
  landscapeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  landscapeTitle: {
    fontFamily: 'Cinzel_900Black',
    fontSize: 16,
    color: COLORS.gold,
    letterSpacing: 3,
  },
  landscapeSubtitle: {
    fontFamily: 'EBGaramond_400Regular_Italic',
    fontSize: 11,
    color: COLORS.inkDim,
    letterSpacing: 0.3,
  },
  landscapeVizContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  zoomContainer: {
    flex: 1,
  },
  landscapeDetailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '52%',
    zIndex: 100,
  },
});
