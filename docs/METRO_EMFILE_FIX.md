# Fix: EMFILE — too many open files (Metro / Expo)

## Always do this

1. **Run Expo only from the mobile app folder:**
   ```powershell
   cd "C:\Users\Preci\ESO ENERGY PROJECT\eso-energy-mobile"
   npm run start:phone
   ```
   Do **not** run `npx expo start` from `ESO ENERGY PROJECT` (parent) or `eso-energy-com`.

2. **Kill stale Metro before starting:**
   ```powershell
   npm run kill:metro
   npm run start:phone
   ```

3. **One Metro at a time** — close other Expo/Metro terminals.

## What we changed in the repo

- `metro.config.js` — watches **only** `eso-energy-mobile`, ignores `../eso-energy-com` and `../node_modules`
- `METRO_MAX_WORKERS=2` — fewer parallel file handles
- Parent `package.json` — no `expo` dependency (was pulling a second huge `node_modules` tree)

## If it still happens (Windows)

1. Restart PC (clears leaked handles from old Metro processes).
2. Exclude project folders from **Windows Defender** real-time scan (Settings → Virus & threat protection → Exclusions).
3. Install dependencies only in mobile:
   ```powershell
   cd eso-energy-mobile
   npm install
   ```
4. Avoid opening the whole `ESO ENERGY PROJECT` folder in multiple IDEs at once.

## macOS (optional)

Install Watchman: `brew install watchman` — Metro uses it instead of thousands of raw file watchers.
