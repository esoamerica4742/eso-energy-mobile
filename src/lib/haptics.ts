import * as Haptics from 'expo-haptics';

/**
 * Light impact — fire immediately before a primary CTA action starts.
 * Provides consistent tactile confirmation across the auth flow.
 *
 * Usage:
 *   triggerHaptic();
 *   setBusy(true);
 *   await doSomething();
 */
export function triggerHaptic(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
