import { Dimensions } from 'react-native';

export const ONBOARDING_COLORS = {
  navy1: '#0B152B',
  navy2: '#081222',
  navy3: '#000000',
  tealDeep: '#050A14',
  glass: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.1)',
  gold: '#FFFFFF',
  green: 'rgba(255,255,255,0.72)',
  blue: '#4DA3FF',
  red: '#FF6B6B',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.55)',
} as const;

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const ONBOARDING_SLIDE_COUNT = 1;
