module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Plugin Reanimated rimosso: il mock in metro.config.js intercetta
    // react-native-reanimated prima che il plugin lo trasformi.
  };
};
