/**
 * Start Expo for physical devices on the same Wi‑Fi.
 * Sets REACT_NATIVE_PACKAGER_HOSTNAME so the QR code uses your real LAN IP (not localhost).
 */
import { spawn } from 'node:child_process';
import net from 'node:net';
import { networkInterfaces } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMetroEnv, logMetroEnvHint } from './metro-env.mjs';

const mobileRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const SKIP_ADAPTER = /virtual|vpn|wintun|vethernet|hyper-v|loopback|expressvpn|tailscale|zerotier|hamachi|tap-/i;

function adapterPriority(name) {
  const lower = name.toLowerCase();
  if (/wi-?fi|wlan|airport/.test(lower)) return 0;
  if (/ethernet/.test(lower) && !/virtual/.test(lower)) return 10;
  if (/local area connection/.test(lower)) return 90;
  return 50;
}

/** Prefer Wi‑Fi/Ethernet over stale Windows "Local Area Connection" / VPN adapters. */
function pickLanIp() {
  const forced = process.env.EXPO_PUBLIC_METRO_HOST?.trim();
  if (forced) {
    console.log(`[ESO Energy] Using EXPO_PUBLIC_METRO_HOST=${forced}`);
    return forced;
  }

  const candidates = [];

  for (const [name, entries] of Object.entries(networkInterfaces())) {
    if (SKIP_ADAPTER.test(name)) continue;

    for (const entry of entries ?? []) {
      if (entry.family !== 'IPv4' || entry.internal) continue;
      if (entry.address.startsWith('100.64.')) continue;
      if (entry.address.startsWith('169.254.')) continue;

      candidates.push({
        address: entry.address,
        name,
        priority: adapterPriority(name),
      });
    }
  }

  candidates.sort((a, b) => a.priority - b.priority || a.address.localeCompare(b.address));

  if (candidates.length > 0) {
    const pick = candidates[0];
    console.log(`[ESO Energy] Network adapter: ${pick.name} → ${pick.address}`);
    if (candidates.length > 1) {
      console.log(
        `[ESO Energy] Other IPs ignored: ${candidates
          .slice(1, 4)
          .map((c) => `${c.name}=${c.address}`)
          .join(', ')}`,
      );
    }
    return pick.address;
  }

  console.warn('[ESO Energy] No LAN IP found — falling back to 127.0.0.1 (phone will not connect).');
  return '127.0.0.1';
}

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' });
    socket.setTimeout(400);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

/** Free stale Metro on 8081 so Expo Go QR always matches the default port. */
async function freePortWindows(port) {
  if (process.platform !== 'win32') return;
  try {
    const { execSync } = await import('node:child_process');
    execSync(
      `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
      { stdio: 'ignore' },
    );
  } catch {
    // ignore — port may already be free
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pickMetroPort(start = 8081, attempts = 10) {
  for (let p = start; p < start + 5; p += 1) {
    await freePortWindows(p);
  }
  await sleep(1200);
  for (let i = 0; i < attempts; i += 1) {
    const port = start + i;
    if (!(await portInUse(port))) return port;
  }
  throw new Error(
    `No free Metro port found (${start}–${start + attempts - 1}). Close old Expo/Metro windows and retry.`,
  );
}

const lanIp = pickLanIp();
console.log(`[ESO Energy] Metro LAN host: ${lanIp}`);
console.log('[ESO Energy] Phone must be on the same Wi‑Fi. Force-close Expo Go before scanning.');

const port = await pickMetroPort();
console.log(`[ESO Energy] Metro port: ${port}`);
console.log(`[ESO Energy] Expo URL: exp://${lanIp}:${port}`);
if (port !== 8081) {
  console.warn(
    `[ESO Energy] Using port ${port} (8081 busy). Use this exact URL in Expo Go — old QR codes will fail.`,
  );
}
console.log('[ESO Energy] Update Expo Go from the App Store (SDK 56 required).');
logMetroEnvHint();

const env = buildMetroEnv(mobileRoot, {
  REACT_NATIVE_PACKAGER_HOSTNAME: lanIp,
});

const child = spawn(
  'node',
  [
    path.join(mobileRoot, 'scripts', 'run-expo.mjs'),
    'start',
    '--lan',
    '-c',
    '--clear',
    '--port',
    String(port),
  ],
  {
    cwd: mobileRoot,
    env,
    stdio: 'inherit',
    shell: false,
  },
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
