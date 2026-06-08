import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { COUNTRIES } from '../theme/authTheme';

const COUNTRIES_DEFAULT = COUNTRIES[0];
const AuthFlowContext = createContext(null);

export function AuthFlowProvider({ children }) {
  const [module, setModule] = useState(null);
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    company: '',
    title: '',
    country: COUNTRIES_DEFAULT,
  });
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const resetFlow = useCallback(() => {
    setModule(null);
    setEmail('');
    setProfile({ name: '', company: '', title: '', country: COUNTRIES_DEFAULT });
    setOnboardingComplete(false);
  }, []);

  const value = useMemo(
    () => ({
      module,
      setModule,
      email,
      setEmail,
      profile,
      setProfile,
      onboardingComplete,
      setOnboardingComplete,
      resetFlow,
    }),
    [module, email, profile, onboardingComplete, resetFlow],
  );

  return <AuthFlowContext.Provider value={value}>{children}</AuthFlowContext.Provider>;
}

/** Onboarding auth flow state (email → OTP → register → welcome). */
export function useAuth() {
  const ctx = useContext(AuthFlowContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthFlowProvider');
  }
  return ctx;
}
