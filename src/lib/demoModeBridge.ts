/**
 * Lets auth code exit demo mode without importing React context.
 * DemoModeProvider registers handlers on mount.
 */

let exitDemoForAuthHandler: (() => void) | null = null;
let exitDemoFullyHandler: (() => void) | null = null;
let rehydrateAuthHandler: (() => void) | null = null;

export function registerDemoExitForAuth(handler: (() => void) | null): void {
  exitDemoForAuthHandler = handler;
}

export function registerDemoExitFully(handler: (() => void) | null): void {
  exitDemoFullyHandler = handler;
}

export function registerAuthRehydrate(handler: (() => void) | null): void {
  rehydrateAuthHandler = handler;
}

/** Clears demo fleet data so a real Supabase session can populate the auth store. */
export function exitDemoModeForRealAuth(): void {
  exitDemoForAuthHandler?.();
  rehydrateAuthHandler?.();
}

/** Full demo teardown (sign-out, session expiry). */
export function exitDemoModeFully(): void {
  exitDemoFullyHandler?.();
}
