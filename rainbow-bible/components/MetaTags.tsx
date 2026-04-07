import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Connection } from '../data/types';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

interface MetaTagsProps {
  connection: Connection;
}

const MetaTags: React.FC<MetaTagsProps> = ({ connection }) => (
  <View style={styles.container}>
    <View style={[styles.tag, styles.tagAuthor]}>
      <Text style={[styles.tagText, { color: COLORS.gold }]}>
        ✍ {connection.author_a}
      </Text>
    </View>
    <View style={[styles.tag, styles.tagAuthor]}>
      <Text style={[styles.tagText, { color: COLORS.gold }]}>
        ✍ {connection.author_b}
      </Text>
    </View>
    <View style={[styles.tag, styles.tagPeriod]}>
      <Text style={[styles.tagText, { color: COLORS.tagPeriodText }]}>
        ⏱ {connection.period}
      </Text>
    </View>
    <View style={[styles.tag, styles.tagType]}>
      <Text style={[styles.tagText, { color: COLORS.tagTypeText }]}>
        🔗 {connection.link_type}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagAuthor: {
    borderColor: COLORS.tagAuthorBorder,
  },
  tagPeriod: {
    borderColor: COLORS.tagPeriodBorder,
  },
  tagType: {
    borderColor: COLORS.tagTypeBorder,
  },
  tagText: {
    ...TYPOGRAPHY.metaTag,
  },
});

export default MetaTags;
