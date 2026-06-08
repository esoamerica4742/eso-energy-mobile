/**
 * Stops stale Metro/Expo listeners on ports 8081–8085 (Windows).
 * Run before `npm run start:phone` if Expo Go shows "Something went wrong".
 */
import { execSync } from 'node:child_process';

const ports = [8081, 8082, 8083, 8084, 8085];

if (process.platform === 'win32') {
  for (const port of ports) {
    try {
      execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
        { stdio: 'ignore' },
      );
      console.log(`[kill-metro] Freed port ${port}`);
    } catch {
      console.log(`[kill-metro] Port ${port} already free`);
    }
  }
} else {
  console.log('[kill-metro] Non-Windows: close Metro terminals manually.');
}

console.log('[kill-metro] Done. Run: npm run start:phone');
