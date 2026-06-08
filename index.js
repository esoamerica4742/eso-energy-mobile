/**
 * Metro entry — boots Expo Router (routes live under `app/`).
 * Do not use `expo/AppEntry.js`; it requires a root `App.js` shim.
 */
import { LogBox } from 'react-native';

// Disable all yellow banner notifications on the device UI completely
LogBox.ignoreAllLogs(true);

require('expo-router/entry');
