/**
 * MacroView — Level-1 home screen.
 * Se il DB è disponibile, carica i conteggi reali (344k connessioni).
 * Altrimenti ricade sui 32 collegamenti statici.
 */
import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions,
} from 'react-native';
import Svg, {
  Defs, RadialGradient, LinearGradient, Stop,
  Rect, Line, Path, G, Text as SvgText, Circle,
} from 'react-native-svg';
import { SECTIONS, BibleSection } from '../data/sections';
import { CONNECTIONS } from '../data/connections';         // fallback statico
import { COLORS } from '../theme/colors';
import { getBookPairCounts, BookPairCount } from '../utils/database';

const DESIGN_W     = 900;
const BASELINE_FRAC = 0.80;

interface SectionArc {
  fromSection: BibleSection;
  toSection:   BibleSection;
  count:       number;
  color:       string;
}

// Mappa book → sezione
const BOOK_TO_SECTION: Record<string, BibleSection> = {};
for (const s of SECTIONS) for (const bid of s.bookIds) BOOK_TO_SECTION[bid] = s;

function pairsToSectionArcs(pairs: BookPairCount[]): SectionArc[] {
  const map: Record<string, SectionArc> = {};
  for (const p of pairs) {
    const fSec = BOOK_TO_SECTION[p.fromBook];
    const tSec = BOOK_TO_SECTION[p.toBook];
    if (!fSec || !tSec || fSec.id === tSec.id) continue;
    const key = `${fSec.id}__${tSec.id}`;
    if (map[key]) map[key].count += p.count;
    else map[key] = { fromSection: fSec, toSection: tSec, count: p.count, color: fSec.color };
  }
  return Object.values(map);
}

function staticSectionArcs(): SectionArc[] {
  const map: Record<string, SectionArc> = {};
  for (const conn of CONNECTIONS) {
    const fSec = BOOK_TO_SECTION[conn.from];
    const tSec = BOOK_TO_SECTION[conn.to];
    if (!fSec || !tSec || fSec.id === tSec.id) continue;
    const key = `${fSec.id}__${tSec.id}`;
    if (map[key]) map[key].count++;
    else map[key] = { fromSection: fSec, toSection: tSec, count: 1, color: fSec.color };
  }
  return Object.values(map);
}

function staticCountPerSection(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const conn of CONNECTIONS) {
    const fId = BOOK_TO_SECTION[conn.from]?.id;
    const tId = BOOK_TO_SECTION[conn.to]?.id;
    if (fId) counts[fId] = (counts[fId] ?? 0) + 1;
    if (tId && tId !== fId) counts[tId] = (counts[tId] ?? 0) + 1;
  }
  return counts;
}

function scaledX(macroX: number, svgW: number): number {
  const margin = svgW * 0.04;
  return margin + (macroX / DESIGN_W) * (svgW - margin * 2);
}

function arcPath(x1: number, x2: number, baseline: number): string {
  const midX    = (x1 + x2) / 2;
  const maxRise = baseline * 0.90;
  const controlY = baseline - Math.min(Math.abs(x2 - x1) * 0.9, maxRise);
  return `M${x1},${baseline} Q${midX},${controlY} ${x2},${baseline}`;
}

interface MacroViewProps {
  onSectionPress: (sectionId: string) => void;
}

const MacroView: React.FC<MacroViewProps> = ({ onSectionPress }) => {
  const { width: screenW } = useWindowDimensions();
  const [svgH, setSvgH] = useState(0);

  const [sectionArcs,     setSectionArcs]     = useState<SectionArc[]>(() => staticSectionArcs());
  const [countPerSection, setCountPerSection] = useState<Record<string, number>>(() => staticCountPerSection());

  // Carica dati reali da Supabase
  useEffect(() => {
    getBookPairCounts().then(pairs => {
      setSectionArcs(pairsToSectionArcs(pairs));

      const counts: Record<string, number> = {};
      for (const p of pairs) {
        const fId = BOOK_TO_SECTION[p.fromBook]?.id;
        const tId = BOOK_TO_SECTION[p.toBook]?.id;
        if (fId) counts[fId] = (counts[fId] ?? 0) + p.count;
        if (tId && tId !== fId) counts[tId] = (counts[tId] ?? 0) + p.count;
      }
      setCountPerSection(counts);
    }).catch(console.warn);
  }, []);

  const svgW     = screenW;
  const baseline = svgH > 0 ? svgH * BASELINE_FRAC : 0;

  // Scala lo strokeWidth degli archi: con 344k connessioni i conteggi sono enormi
  const maxArcCount = useMemo(
    () => Math.max(...sectionArcs.map(a => a.count), 1),
    [sectionArcs]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RAINBOW BIBLE</Text>
        <Text style={styles.subtitle}>Seleziona una sezione per esplorare</Text>
        <Text style={[styles.dbBadge, { color: '#7ad4a7' }]}>
          ● DB 344k
        </Text>
      </View>

      <View style={styles.svgFlex} onLayout={e => setSvgH(e.nativeEvent.layout.height)}>
        {svgH > 0 && (
          <Svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
            <Defs>
              <RadialGradient id="macroBg" cx="50%" cy="100%" r="75%">
                <Stop offset="0%"   stopColor="#2e1d07" stopOpacity={1} />
                <Stop offset="100%" stopColor="#1a1208" stopOpacity={1} />
              </RadialGradient>
              <LinearGradient id="spineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%"   stopColor="rgba(201,168,76,0)"   stopOpacity={1} />
                <Stop offset="15%"  stopColor="rgba(201,168,76,0.4)" stopOpacity={1} />
                <Stop offset="85%"  stopColor="rgba(201,168,76,0.4)" stopOpacity={1} />
                <Stop offset="100%" stopColor="rgba(201,168,76,0)"   stopOpacity={1} />
              </LinearGradient>
            </Defs>

            <Rect width={svgW} height={svgH} fill="url(#macroBg)" />

            {/* Testament labels */}
            {baseline > 60 && (
              <>
                <SvgText x={scaledX(240, svgW)} y={18}
                  fill="rgba(201,168,76,0.25)" fontSize={8}
                  fontFamily="Cinzel_400Regular" textAnchor="middle" letterSpacing={2}>
                  ANTICO TESTAMENTO
                </SvgText>
                <SvgText x={scaledX(700, svgW)} y={18}
                  fill="rgba(201,168,76,0.25)" fontSize={8}
                  fontFamily="Cinzel_400Regular" textAnchor="middle" letterSpacing={2}>
                  NUOVO TESTAMENTO
                </SvgText>
                <Line
                  x1={scaledX(503, svgW)} y1={8}
                  x2={scaledX(503, svgW)} y2={baseline + 46}
                  stroke="rgba(201,168,76,0.10)" strokeWidth={1} strokeDasharray="4,5"
                />
              </>
            )}

            <Line x1={0} y1={baseline} x2={svgW} y2={baseline}
              stroke="url(#spineGrad)" strokeWidth={1.5} />

            {/* Aggregated arcs */}
            {sectionArcs.map((arc, i) => {
              const x1 = scaledX(arc.fromSection.macroX, svgW);
              const x2 = scaledX(arc.toSection.macroX,   svgW);
              // Normalizza strokeWidth tra 1 e 6
              const sw = 1 + (arc.count / maxArcCount) * 5;
              return (
                <Path key={i} d={arcPath(x1, x2, baseline)}
                  stroke={arc.color} strokeWidth={sw}
                  fill="none" opacity={0.55} />
              );
            })}

            {/* Section nodes + labels */}
            {SECTIONS.map(section => {
              const cx  = scaledX(section.macroX, svgW);
              const cnt = countPerSection[section.id] ?? 0;
              const label = cnt >= 1000
                ? `${(cnt / 1000).toFixed(0)}k`
                : cnt > 0 ? String(cnt) : '';

              return (
                <G key={section.id}>
                  <Circle cx={cx} cy={baseline} r={10} fill={section.color} opacity={0.07} />
                  <Circle cx={cx} cy={baseline} r={4.5} fill={section.color} opacity={0.85} />
                  <SvgText x={cx} y={baseline + 18}
                    fill={section.color} fontSize={9}
                    fontFamily="Cinzel_400Regular" textAnchor="middle" opacity={0.9}>
                    {section.label}
                  </SvgText>
                  {label !== '' && (
                    <SvgText x={cx} y={baseline + 30}
                      fill="rgba(201,168,76,0.45)" fontSize={8}
                      fontFamily="Cinzel_400Regular" textAnchor="middle">
                      {label}
                    </SvgText>
                  )}
                </G>
              );
            })}

          </Svg>
        )}
        {/* Tap targets come overlay RN — fill="transparent" in SVG non registra tocchi */}
        {svgH > 0 && SECTIONS.map(section => {
          const cx = scaledX(section.macroX, svgW);
          return (
            <TouchableOpacity
              key={`tap_${section.id}`}
              style={{
                position: 'absolute',
                left: cx - 34,
                top: 0,
                width: 68,
                height: svgH,
              }}
              onPress={() => onSectionPress(section.id)}
              activeOpacity={0.6}
            />
          );
        })}
      </View>

      {/* Button row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.btnScroll} contentContainerStyle={styles.btnRow}>
        {SECTIONS.map(section => (
          <TouchableOpacity key={section.id}
            style={[styles.btn, { borderColor: section.color + '70' }]}
            onPress={() => onSectionPress(section.id)} activeOpacity={0.7}>
            <Text style={[styles.btnLabel, { color: section.color }]}>
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.parchment },
  header: {
    alignItems: 'center',
    paddingTop: 52, paddingBottom: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.15)',
  },
  title: {
    fontFamily: 'Cinzel_900Black', fontSize: 22,
    color: COLORS.gold, letterSpacing: 4,
  },
  subtitle: {
    fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 12,
    color: COLORS.inkDim, marginTop: 3,
  },
  dbBadge: {
    fontFamily: 'Cinzel_400Regular', fontSize: 9,
    letterSpacing: 0.5, marginTop: 4, opacity: 0.8,
  },
  svgFlex: { flex: 1, overflow: 'hidden' },
  btnScroll: {
    flexGrow: 0,
    borderTopWidth: 1, borderTopColor: 'rgba(201,168,76,0.12)',
  },
  btnRow: {
    flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, gap: 8,
  },
  btn: {
    paddingHorizontal: 13, paddingVertical: 7,
    borderRadius: 18, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  btnLabel: {
    fontFamily: 'Cinzel_400Regular', fontSize: 11, letterSpacing: 0.6,
  },
});

export default MacroView;
