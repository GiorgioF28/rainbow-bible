const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Rimpiazza react-native-reanimated con un mock vuoto.
// react-native-gesture-handler fa require('react-native-reanimated') opzionale:
// se useSharedValue è undefined, disabilita silenziosamente l'integrazione
// Reanimated e usa i gesture handler v1 (quelli che usiamo in ZoomableView).
// Questo evita l'errore TurboModule "installTurboModule called with 1 arg"
// causato dalla versione di react-native-worklets inclusa in Expo Go SDK 54.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-reanimated': require.resolve('./reanimated-mock.js'),
};

module.exports = config;
