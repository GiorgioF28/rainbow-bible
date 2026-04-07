import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

interface VerseBlockProps {
  reference: string;
  text: string;
}

const VerseBlock: React.FC<VerseBlockProps> = ({ reference, text }) => (
  <View style={styles.container}>
    <Text style={styles.ref}>{reference}</Text>
    <Text style={styles.text}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gold,
    paddingLeft: 12,
    flex: 1,
  },
  ref: {
    ...TYPOGRAPHY.verseRef,
    marginBottom: 6,
  },
  text: {
    ...TYPOGRAPHY.verseText,
  },
});

export default VerseBlock;
