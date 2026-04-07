/**
 * Mock di react-native-reanimated usato da Metro in sviluppo con Expo Go.
 * Expo Go SDK 54 ha react-native-worklets nativo in versione incompatibile
 * con worklets@0.8.1 (firma di installTurboModule cambiata).
 *
 * react-native-gesture-handler fa require('react-native-reanimated') in un
 * try/catch opzionale: se il modulo esporta undefined/null per le API che
 * controlla (useSharedValue), RNGH disabilita silenziosamente
 * l'integrazione Reanimated e usa il percorso legacy (esattamente quello
 * che vogliamo — usiamo solo i gesture handler v1 che non la richiedono).
 */

// Nessuna inizializzazione nativa. RNGH controlla solo useSharedValue.
module.exports = {
  useSharedValue: undefined,
};
