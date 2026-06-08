# Metro on Windows (EMFILE fix)

If Expo shows **500 — EMFILE: too many open files**, Metro opened more file handles than Windows allows (common when the repo sits next to `eso-energy-com` or cache lives under `%TEMP%`).

## Always use npm scripts

From `eso-energy-mobile`:

```powershell
cd eso-energy-mobile
npm run kill:metro
npm run expo-go
```

`expo-go` is the same as `start:phone` — LAN IP + QR for **Expo Go SDK 56**.

Do **not** run `npx expo start` directly — it skips the tuned Metro env.

## What we configure

| Setting | Purpose |
|--------|---------|
| `watchFolders` = mobile only | Ignore parent monorepo |
| `.metro-cache/` in project | Avoid deep `%TEMP%\metro-cache` trees |
| `maxWorkers = 1` on Windows | Fewer parallel bundle file handles |
| `useWatchman = false` | Stable file map on Windows |
| `blockList` | Skip `.expo`, `android/build`, sibling projects |

## If it still happens

1. Close other Metro/Expo terminals, then `npm run kill:metro`.
2. Delete cache: `Remove-Item -Recurse -Force .metro-cache` (in `eso-energy-mobile`).
3. Restart: `npm run start:phone`.
4. Optional: move the project to a shorter path (e.g. `C:\dev\eso-mobile`).

Parent folder scripts (`npm run mobile` from `ESO ENERGY PROJECT`) already delegate to `eso-energy-mobile`.
