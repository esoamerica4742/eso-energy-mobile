import { Dimensions } from 'react-native';
import { GOLD } from '@/theme/colors';

export const ONBOARDING_COLORS = {
  navy1: '#0B1628',
  navy2: '#0D2137',
  navy3: '#071220',
  tealDeep: '#0A1F2E',
  glass: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  gold: GOLD,
  green: '#00C48C',
  blue: '#3B9EFF',
  red: '#FF4D6A',
  text: '#FFFFFF',
  muted: '#8A99B3',
} as const;

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const ONBOARDING_SLIDE_COUNT = 1;
