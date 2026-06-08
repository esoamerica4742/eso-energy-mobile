/**
 * Expo Go parses dev bundles as plain JS. RN 0.81 + worklets + TanStack ship private
 * class fields (#x, #registry, …) that must be transpiled before they reach the device.
 * babel-preset-expo with unstable_transformProfile: 'default' handles app + dependencies.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          // hermes-stable skips private-field transforms; default always strips them.
          unstable_transformProfile: 'default',
        },
      ],
      'nativewind/babel',
    ],
    // Must stay last — required for Reanimated worklets on Expo Go.
    plugins: ['react-native-reanimated/plugin'],
  };
};
