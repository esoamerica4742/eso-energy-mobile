export const C = {
  DARK_1: '#060809',
  DARK_2: '#0C1015',
  DARK_3: '#131920',
  DARK_4: '#1A2330',
  GOLD_LIGHT: '#F5D483',
  GOLD_MID: '#D4AF37',
  GOLD_DARK: '#8B6914',
  GOLD_TINT: 'rgba(201,168,76,0.12)',
  GOLD_BORDER: 'rgba(201,168,76,0.35)',
  TEAL: '#00E5CC',
  TEAL_DIM: 'rgba(0,229,204,0.09)',
  WHITE: '#FFFFFF',
  OFF_WHITE: '#E8E8E0',
  ERROR: '#FF4444',
  SUCCESS: '#00E5CC',
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
      label: '💳 Eso Pay Bills',
      borderColor: C.TEAL,
      bg: C.TEAL_DIM,
      textColor: C.TEAL,
    };
  }
  return {
    label: '⚡ Eso Inverter Monitoring',
    borderColor: C.GOLD_MID,
    bg: C.GOLD_TINT,
    textColor: C.GOLD_LIGHT,
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
