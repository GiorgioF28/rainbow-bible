import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { FilterType } from '../data/types';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

interface FilterOption {
  label: string;
  value: FilterType;
}

const FILTERS: FilterOption[] = [
  { label: 'Tutti i collegamenti', value: 'all' },
  { label: 'Profezia → Compimento', value: 'prophecy' },
  { label: 'Saggezza', value: 'wisdom' },
  { label: 'Vangeli', value: 'gospel' },
  { label: 'Epistole', value: 'epistle' },
];

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  /** Compact mode: smaller padding for landscape layout */
  compact?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onFilterChange, compact }) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          compact && styles.scrollContentCompact,
        ]}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              style={[styles.btn, isActive && styles.btnActive, compact && styles.btnCompact]}
              onPress={() => onFilterChange(f.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnText, isActive && styles.btnTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separatorFaint,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  containerCompact: {
    borderBottomWidth: 0,
  },
  scrollContentCompact: {
    paddingVertical: 4,
  },
  btn: {
    borderWidth: 1,
    borderColor: COLORS.filterBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnCompact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  btnActive: {
    backgroundColor: COLORS.filterActiveBg,
    borderColor: COLORS.gold,
  },
  btnText: {
    ...TYPOGRAPHY.filterLabel,
    color: COLORS.inkDim,
  },
  btnTextActive: {
    color: COLORS.goldLight,
  },
});

export default FilterBar;
