/**
 * Metro / Expo environment tuned to avoid EMFILE (too many open files) on Windows.
 * Used by run-expo.mjs and start-expo-phone.mjs — always start via `npm run start*`.
 */
import path from 'node:path';

const isWin = process.platform === 'win32';

/**
 * @param {string} mobileRoot — eso-energy-mobile directory
 * @param {Record<string, string | undefined>} [extra]
 */
export function buildMetroEnv(mobileRoot, extra = {}) {
  const cacheRoot = path.join(mobileRoot, '.metro-cache');

  return {
    ...process.env,
    ...extra,
    /** Keep cache inside the repo (not %TEMP%\\metro-cache) — fewer deep temp paths on Windows. */
    METRO_CACHE_ROOT: cacheRoot,
    /** One worker on Windows dramatically cuts parallel file handles during bundling. */
    METRO_MAX_WORKERS: extra.METRO_MAX_WORKERS ?? (isWin ? '1' : process.env.METRO_MAX_WORKERS ?? '2'),
    /** Hint for tooling; primary limit is set in metro.config.js maxWorkers. */
    EXPO_NO_METRO_WORKSPACE_ROOT: '1',
    EXPO_USE_METRO_WORKSPACE_ROOT: '0',
    /** Fewer native file watchers on Windows (slightly slower rebuilds, far fewer EMFILE). */
    CHOKIDAR_USEPOLLING: isWin ? 'true' : process.env.CHOKIDAR_USEPOLLING,
    CHOKIDAR_INTERVAL: isWin ? '1000' : process.env.CHOKIDAR_INTERVAL,
  };
}

export function logMetroEnvHint() {
  if (!isWin) return;
  console.log(
    '[ESO Energy] Windows Metro: maxWorkers=1, in-memory cache — use npm run start:dev:stable (not raw npx expo).',
  );
}
