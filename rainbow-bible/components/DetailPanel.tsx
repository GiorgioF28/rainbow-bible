import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { Connection } from '../data/types';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import VerseBlock from './VerseBlock';
import MetaTags from './MetaTags';

interface DetailPanelProps {
  connection: Connection | null;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ connection, onClose }) => {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (connection) {
      translateY.setValue(20);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0,  duration: 350, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 1,  duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [connection]);

  if (!connection) return null;

  const hasExplanation = connection.hasExplanation !== false && connection.explanation?.trim().length > 0;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={onClose}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Verses */}
        <View style={styles.versesRow}>
          <VerseBlock reference={connection.refA} text={connection.textA} />
          <View style={styles.connector}>
            <View style={styles.connectorLine} />
            <Text style={styles.connectorSymbol}>⟷</Text>
            <View style={styles.connectorLine} />
          </View>
          <VerseBlock reference={connection.refB} text={connection.textB} />
        </View>

        {/* Explanation — only when present */}
        {hasExplanation ? (
          <View style={styles.explanationBlock}>
            <Text style={styles.explanationTitle}>Analisi del collegamento</Text>
            <Text style={styles.explanationText}>{connection.explanation}</Text>
            <MetaTags connection={connection} />
          </View>
        ) : (
          <View style={styles.noExplanationBlock}>
            <View style={[styles.noExplDot, { backgroundColor: connection.color }]} />
            <Text style={styles.noExplanationText}>
              Spiegazione non ancora disponibile per questo collegamento.
            </Text>
          </View>
        )}

        {/* Score badge (only for DB connections) */}
        {connection.score !== undefined && (
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Confidenza</Text>
            <View style={styles.scoreBarBg}>
              <View
                style={[
                  styles.scoreBarFill,
                  { width: `${Math.round(connection.score * 100)}%` as any, backgroundColor: connection.color },
                ]}
              />
            </View>
            <Text style={[styles.scoreValue, { color: connection.color }]}>
              {Math.round(connection.score * 100)}%
            </Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panelBg,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    padding: 20,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 12, right: 12,
    width: 28, height: 28,
    borderWidth: 1,
    borderColor: COLORS.filterBorder,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: COLORS.inkDim,
    fontSize: 14,
  },

  // ── Verses ────────────────────────────────────────────────────────────
  versesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    marginTop: 8,
  },
  connector: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  connectorLine: {
    width: 1, height: 24,
    backgroundColor: COLORS.gold,
    opacity: 0.5,
  },
  connectorSymbol: {
    color: COLORS.gold,
    fontSize: 18,
    opacity: 0.7,
    marginVertical: 2,
  },

  // ── Explanation present ───────────────────────────────────────────────
  explanationBlock: {
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
    paddingTop: 16,
  },
  explanationTitle: {
    ...TYPOGRAPHY.sectionTitle,
    marginBottom: 10,
  },
  explanationText: {
    ...TYPOGRAPHY.explanation,
  },

  // ── No explanation ────────────────────────────────────────────────────
  noExplanationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.separatorFaint,
    paddingTop: 14,
    paddingBottom: 4,
    opacity: 0.6,
  },
  noExplDot: {
    width: 6, height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
  noExplanationText: {
    fontFamily: 'EBGaramond_400Regular_Italic',
    fontSize: 12,
    color: COLORS.inkDim,
    flex: 1,
  },

  // ── Score bar ─────────────────────────────────────────────────────────
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.separatorFaint,
  },
  scoreLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 9,
    color: COLORS.inkDim,
    letterSpacing: 1,
    width: 64,
  },
  scoreBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: 4,
    borderRadius: 2,
    opacity: 0.7,
  },
  scoreValue: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 10,
    width: 34,
    textAlign: 'right',
  },
});

export default DetailPanel;
