import { create } from 'zustand';

type MasterSessionState = {
  /** App lock cleared for this foreground session. */
  pinUnlocked: boolean;
  bootstrapped: boolean;
  setPinUnlocked: (unlocked: boolean) => void;
  setBootstrapped: (ready: boolean) => void;
  reset: () => void;
};

export const useMasterSessionStore = create<MasterSessionState>((set) => ({
  pinUnlocked: false,
  bootstrapped: false,
  setPinUnlocked: (pinUnlocked) => set({ pinUnlocked }),
  setBootstrapped: (bootstrapped) => set({ bootstrapped }),
  reset: () => set({ pinUnlocked: false, bootstrapped: false }),
}));

export const selectMasterPinUnlocked = (s: MasterSessionState) => s.pinUnlocked;
