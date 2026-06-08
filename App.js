/**
 * Legacy fallback if a tool still loads `expo/AppEntry.js` → `../../App`.
 * Primary entry is `index.js` → `expo-router/entry`.
 */
import { LogBox } from 'react-native';

// Disable all yellow banner notifications on the device UI completely
LogBox.ignoreAllLogs(true);

export { App as default } from 'expo-router/build/qualified-entry';
