import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import {
  clearEsoPaySessionBackup,
  persistEsoPaySessionBackup,
} from '@/esopay/auth/esoPaySessionBackup';

type State = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  hydrated: boolean;
  /**
   * Set on successful Eso Pay login; cleared only by signOutEsoPay / clearEsoPaySession.
   * Auth gates use this — not transient Supabase client state.
   */
  signedIn: boolean;
  /**
   * Local device lock for Eso Pay Bills. When enabled (PIN exists),
   * this must be true to view Eso Pay screens.
   */
  loginPinUnlocked: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  lockSignedIn: () => void;
  unlockSignedIn: () => void;
  setLoginPinUnlocked: (unlocked: boolean) => void;
};

export const useEsoPayAuthStore = create<State>((set) => ({
  session: null,
  user: null,
  loading: true,
  hydrated: false,
  signedIn: false,
  loginPinUnlocked: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
    if (session) void persistEsoPaySessionBackup(session);
  },

  setLoading: (loading) => set({ loading }),
  setHydrated: (hydrated) => set({ hydrated }),
  lockSignedIn: () => set({ signedIn: true }),
  unlockSignedIn: () => set({ signedIn: false, loginPinUnlocked: false }),
  setLoginPinUnlocked: (unlocked) => set({ loginPinUnlocked: unlocked }),

  /** @deprecated Use unlockSignedIn + clearEsoPaySession — kept for internal sync only */
  reset: () => {
    void clearEsoPaySessionBackup();
    set({
      session: null,
      user: null,
      loading: false,
      hydrated: true,
      signedIn: false,
      loginPinUnlocked: false,
    });
  },
}));

/** Billing access — survives spurious SIGNED_OUT / token refresh races. */
export const selectEsoPayHasAccess = (s: State) => s.signedIn;

export const selectEsoPayIsLoggedIn = (s: State) => s.signedIn;

export const selectEsoPayAuthReady = (s: State) => s.hydrated && !s.loading;
