/**
 * Kill stale Metro, clear cache, then start the development build server.
 * Preferred on Windows when bundles fail with EMFILE or HTTP 500.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mobileRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function runNodeScript(scriptName) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [path.join(mobileRoot, 'scripts', scriptName)], {
      cwd: mobileRoot,
      stdio: 'inherit',
      shell: false,
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptName} exited with code ${code ?? 1}`));
    });
  });
}

await runNodeScript('kill-metro.mjs');
await runNodeScript('clear-metro-cache.mjs');

const dev = spawn('node', [path.join(mobileRoot, 'scripts', 'start-expo-dev.mjs')], {
  cwd: mobileRoot,
  stdio: 'inherit',
  shell: false,
});

dev.on('exit', (code) => {
  process.exit(code ?? 0);
});
