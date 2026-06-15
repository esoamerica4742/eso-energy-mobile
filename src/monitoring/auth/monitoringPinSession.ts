/** In-memory PIN unlock for the current app session (monitoring). */
let pinUnlocked = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function setMonitoringPinUnlocked(value: boolean): void {
  pinUnlocked = value;
  notify();
}

export function isMonitoringPinUnlocked(): boolean {
  return pinUnlocked;
}

export function clearMonitoringPinSession(): void {
  pinUnlocked = false;
  notify();
}

export function subscribeMonitoringPinSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
