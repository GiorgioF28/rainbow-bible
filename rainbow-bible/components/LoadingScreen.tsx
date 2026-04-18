/**
 * LoadingScreen — schermata di caricamento iniziale.
 * Mostra l'immagine del grafo, il nome dell'app e una citazione
 * adattata alla lingua del dispositivo.
 */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, ActivityIndicator, Animated,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { getLang } from '../i18n';
import { t } from '../i18n';

// ── Citazioni per lingua ───────────────────────────────────────────────────
const QUOTES: Record<string, string> = {
  it: 'La Bibbia è così complessa e così connessa che risulta difficile non pensare sia stata scritta da persone ispirate dallo Spirito Santo e guidata da Dio.',
  en: 'The Bible is so complex and so interconnected that it is hard not to think it was written by people inspired by the Holy Spirit and guided by God.',
  es: 'La Biblia es tan compleja y tan conectada que resulta difícil no pensar que fue escrita por personas inspiradas por el Espíritu Santo y guiadas por Dios.',
  fr: 'La Bible est si complexe et si interconnectée qu\'il est difficile de ne pas penser qu\'elle a été écrite par des personnes inspirées par le Saint-Esprit et guidées par Dieu.',
  ar: 'الكتاب المقدس معقد ومترابط لدرجة يصعب فيها عدم التفكير بأنه كُتب بإلهام من الروح القدس وتوجيه من الله.',
  zh: '《圣经》如此复杂、如此相互关联，使人不得不认为它是由受圣灵感动、蒙神引导的人所写成的。',
  ja: '聖書はあまりにも複雑で相互につながっており、聖霊に感動され、神に導かれた人々によって書かれたと思わずにはいられない。',
};

function getQuote(): string {
  const appLang = getLang();
  return QUOTES[appLang] ?? QUOTES.it;
}

const LoadingScreen: React.FC = () => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.title}>RAINBOW BIBLE</Text>
        <Text style={styles.subtitle}>{t('loading_subtitle')}</Text>

        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('../assets/loading screen.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <ActivityIndicator color={COLORS.gold} size="small" style={styles.spinner} />

        <Text style={styles.quote}>{getQuote()}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1208',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  inner: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: 'Cinzel_900Black',
    fontSize: 26,
    color: COLORS.gold,
    letterSpacing: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'EBGaramond_400Regular_Italic',
    fontSize: 13,
    color: 'rgba(201,168,76,0.55)',
    marginTop: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 260,
    marginTop: 28,
    marginBottom: 24,
    opacity: 0.88,
  },
  spinner: {
    marginBottom: 24,
  },
  quote: {
    fontFamily: 'EBGaramond_400Regular_Italic',
    fontSize: 14,
    color: 'rgba(201,168,76,0.60)',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default LoadingScreen;
