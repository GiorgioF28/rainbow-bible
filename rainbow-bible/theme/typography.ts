import { TextStyle } from 'react-native';
import { COLORS } from './colors';

export const TYPOGRAPHY = {
  appTitle: {
    fontFamily: 'Cinzel_900Black',
    fontSize: 28,
    color: COLORS.gold,
    letterSpacing: 4,
    textTransform: 'uppercase',
  } as TextStyle,

  subtitle: {
    fontFamily: 'EBGaramond_400Regular_Italic',
    fontSize: 14,
    color: COLORS.inkDim,
    letterSpacing: 1,
  } as TextStyle,

  filterLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } as TextStyle,

  verseRef: {
    fontFamily: 'Cinzel_600SemiBold',
    fontSize: 11,
    color: COLORS.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } as TextStyle,

  verseText: {
    fontFamily: 'EBGaramond_400Regular_Italic',
    fontSize: 16,
    color: COLORS.ink,
    lineHeight: 27,
  } as TextStyle,

  sectionTitle: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 10,
    color: COLORS.gold,
    letterSpacing: 3,
    textTransform: 'uppercase',
  } as TextStyle,

  explanation: {
    fontFamily: 'EBGaramond_400Regular',
    fontSize: 15,
    color: COLORS.inkDim,
    lineHeight: 26,
  } as TextStyle,

  metaTag: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  } as TextStyle,

  legendLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 9,
    color: COLORS.inkDim,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,

  hint: {
    fontFamily: 'EBGaramond_400Regular_Italic',
    fontSize: 13,
    color: COLORS.inkDim,
  } as TextStyle,
} as const;
