/**
 * Monitoring PIN is re-required on cold start only.
 * `app/index.tsx` calls `clearMonitoringPinSession()` before routing to monitoring.
 * We intentionally do not clear on background/inactive — that caused the unlock
 * screen to reappear constantly while the app stayed open.
 */
export function useMonitoringPinLock() {
  // No-op — session lock is handled at app launch, not on AppState changes.
}
