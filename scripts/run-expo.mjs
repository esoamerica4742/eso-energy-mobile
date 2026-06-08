/**
 * Start Expo with Metro env tuned to avoid EMFILE (too many open files).
 * Usage: node scripts/run-expo.mjs start --lan -c
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMetroEnv, logMetroEnvHint } from './metro-env.mjs';

const mobileRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);

logMetroEnvHint();

const child = spawn('npx', ['expo', ...args], {
  cwd: mobileRoot,
  env: buildMetroEnv(mobileRoot),
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 0));
