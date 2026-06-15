/**
 * Delete project-local Metro cache (fixes EMFILE / stale bundler cache on Windows).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mobileRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cacheRoot = path.join(mobileRoot, '.metro-cache');

if (fs.existsSync(cacheRoot)) {
  fs.rmSync(cacheRoot, { recursive: true, force: true });
  console.log(`[clear-metro-cache] Removed ${cacheRoot}`);
} else {
  console.log('[clear-metro-cache] No .metro-cache folder found.');
}
