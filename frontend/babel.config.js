module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      // Agrega plugins adicionales si los necesitas
     // "react-native-reanimated/plugin", // Ejemplo: Plugin para Reanimated
    ],
  };
};
