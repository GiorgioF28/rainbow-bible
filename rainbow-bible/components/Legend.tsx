import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

const LEGEND_ITEMS = [
  { color: COLORS.arcOT,      label: 'AT → AT' },
  { color: COLORS.arcLaw,     label: 'Legge → Profezia' },
  { color: COLORS.arcProphet, label: 'Profezia → Vangeli' },
  { color: COLORS.arcGospel,  label: 'Vangeli → Epistole' },
  { color: COLORS.arcEpistle, label: 'AT → NT' },
  { color: COLORS.arcWisdom,  label: 'Saggezza' },
] as const;

const Legend: React.FC = () => (
  <View style={styles.container}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {LEGEND_ITEMS.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: COLORS.separatorFaint,
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 18,
    height: 3,
    borderRadius: 2,
  },
  label: {
    ...TYPOGRAPHY.legendLabel,
  },
});

export default Legend;
