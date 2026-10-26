const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = withNativewind(getDefaultConfig(__dirname));

// NativeWind's resolver points `react-native` at react-native-css's wrapper,
// whose export list lacks AssetRegistry (public since RN 0.88). expo-asset
// imports it, so runtime asset loads (Android Material Symbol tab icons) fail.
// Resolve expo-asset's `react-native` with Metro's default resolver instead.
// Remove once react-native-css exports AssetRegistry.
const EXPO_ASSET = `${path.sep}node_modules${path.sep}expo-asset${path.sep}`;
const resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react-native" && context.originModulePath.includes(EXPO_ASSET)) {
    return context.resolveRequest(context, moduleName, platform);
  }
  return resolveRequest(context, moduleName, platform);
};

module.exports = config;
