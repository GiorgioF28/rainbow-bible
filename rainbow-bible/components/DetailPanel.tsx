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
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (connection) {
      translateY.setValue(20);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [connection]);

  if (!connection) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Verses grid */}
        <View style={styles.versesRow}>
          <VerseBlock reference={connection.refA} text={connection.textA} />
          <View style={styles.connector}>
            <View style={styles.connectorLine} />
            <Text style={styles.connectorSymbol}>⟷</Text>
            <View style={styles.connectorLine} />
          </View>
          <VerseBlock reference={connection.refB} text={connection.textB} />
        </View>

        {/* Explanation */}
        <View style={styles.explanationBlock}>
          <Text style={styles.explanationTitle}>Analisi del collegamento</Text>
          <Text style={styles.explanationText}>{connection.explanation}</Text>
          <MetaTags connection={connection} />
        </View>
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
    top: 12,
    right: 12,
    width: 28,
    height: 28,
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
    width: 1,
    height: 24,
    backgroundColor: COLORS.gold,
    opacity: 0.5,
  },
  connectorSymbol: {
    color: COLORS.gold,
    fontSize: 18,
    opacity: 0.7,
    marginVertical: 2,
  },
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
});

export default DetailPanel;
