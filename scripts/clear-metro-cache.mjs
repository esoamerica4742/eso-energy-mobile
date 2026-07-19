/**
 * Delete project-local AND system-level Metro/Haste cache.
 * Fixes the 99% stuck bundler hang on Windows (stale %TEMP%\metro-* entries).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mobileRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// 1. Project-local cache
const localCache = path.join(mobileRoot, '.metro-cache');
if (fs.existsSync(localCache)) {
  fs.rmSync(localCache, { recursive: true, force: true });
  console.log(`[clear-metro-cache] Removed ${localCache}`);
} else {
  console.log('[clear-metro-cache] No .metro-cache folder found.');
}

// 2. System temp Metro/Haste cache (Windows %TEMP%, Linux/Mac /tmp)
const tempDir = os.tmpdir();
let removedCount = 0;
try {
  const entries = fs.readdirSync(tempDir);
  for (const entry of entries) {
    if (/^(metro|haste)-/i.test(entry)) {
      const full = path.join(tempDir, entry);
      try {
        fs.rmSync(full, { recursive: true, force: true });
        removedCount++;
      } catch {
        // Some entries may be locked — skip silently.
      }
    }
  }
} catch {
  // If we can't read temp dir, skip — not fatal.
}
if (removedCount > 0) {
  console.log(`[clear-metro-cache] Removed ${removedCount} temp cache entries from ${tempDir}`);
} else {
  console.log(`[clear-metro-cache] No Metro temp entries found in ${tempDir}`);
}
