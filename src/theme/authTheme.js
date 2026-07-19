export const C = {
  DARK_1: '#000000',
  DARK_2: '#0C0C0E',
  DARK_3: '#1C1C1E',
  DARK_4: '#2C2C2E',
  GOLD_LIGHT: '#FFFFFF',
  GOLD_MID: '#FFFFFF',
  GOLD_DARK: 'rgba(255,255,255,0.72)',
  GOLD_TINT: 'rgba(255,255,255,0.08)',
  GOLD_BORDER: 'rgba(255,255,255,0.22)',
  TEAL: '#FFFFFF',
  TEAL_DIM: 'rgba(255,255,255,0.08)',
  WHITE: '#FFFFFF',
  OFF_WHITE: 'rgba(255,255,255,0.72)',
  ERROR: '#FF6B6B',
  SUCCESS: '#FFFFFF',
};

export const F = {
  cormorant: 'Inter_600SemiBold',
  sansLight: 'Inter_400Regular',
  sansMed: 'Inter_500Medium',
  mono: 'Inter_400Regular',
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const COUNTRIES = [
  { flag: '🇳🇬', name: 'Nigeria' },
  { flag: '🇬🇭', name: 'Ghana' },
  { flag: '🇰🇪', name: 'Kenya' },
  { flag: '🇿🇦', name: 'South Africa' },
  { flag: '🇪🇬', name: 'Egypt' },
  { flag: '🌍', name: 'Other' },
];

export function modulePillConfig(module = 'inverter') {
  if (module === 'esopay') {
    return {
      label: '💳 Eso Pay',
      borderColor: 'rgba(255,255,255,0.22)',
      bg: 'rgba(255,255,255,0.08)',
      textColor: C.WHITE,
    };
  }
  return {
    label: '⚡ Eso Inverter Monitoring',
    borderColor: 'rgba(255,255,255,0.22)',
    bg: 'rgba(255,255,255,0.08)',
    textColor: C.WHITE,
  };
}

export function welcomeSubtitle(returning = false, module = 'inverter') {
  if (module === 'esopay') {
    if (returning) {
      return 'Welcome back. Your wallet and bills are ready.';
    }
    return 'Your personal Eso Pay wallet\nis ready to use.';
  }
  if (returning) {
    return 'Welcome back. Your dashboard is ready.';
  }
  return 'Your inverter intelligence\ndashboard is being prepared.';
}
