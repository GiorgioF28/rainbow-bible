const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Aggiunge .db agli asset bundlati — necessario per rainbow_bible.db
config.resolver.assetExts = [
  ...(config.resolver.assetExts ?? []),
  'db',
];


// Rimpiazza react-native-reanimated con un mock vuoto.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-reanimated': require.resolve('./reanimated-mock.js'),
};

module.exports = config;
