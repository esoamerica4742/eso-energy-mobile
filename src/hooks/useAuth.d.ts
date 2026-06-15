import type { ReactNode } from 'react';

export type AuthModule = 'inverter' | 'bills' | 'esopay';

export type CountryOption = { flag: string; name: string };

export type AuthProfile = {
  name: string;
  company: string;
  title: string;
  country: CountryOption;
};

export function AuthFlowProvider(props: { children: ReactNode }): JSX.Element;

export function useAuth(): {
  module: AuthModule | null;
  setModule: (m: AuthModule | null) => void;
  email: string;
  setEmail: (e: string) => void;
  profile: AuthProfile;
  setProfile: (p: AuthProfile) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  resetFlow: () => void;
};
