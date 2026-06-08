import type { UtilityProvider } from '@/esopay/api/types';

export type BillerBrandStyle = {
  logoText: string;
  logoBg: string;
  logoFg: string;
  accent: string;
};

const BRAND_RULES: { match: RegExp; style: BillerBrandStyle }[] = [
  {
    match: /mtn/i,
    style: { logoText: 'MTN', logoBg: '#FFCC00', logoFg: '#1A1400', accent: '#FFCC00' },
  },
  {
    match: /airtel/i,
    style: { logoText: 'AT', logoBg: '#E4002B', logoFg: '#FFFFFF', accent: '#E4002B' },
  },
  {
    match: /glo/i,
    style: { logoText: 'Glo', logoBg: '#00A651', logoFg: '#FFFFFF', accent: '#00A651' },
  },
  {
    match: /9mobile|etisalat/i,
    style: { logoText: '9M', logoBg: '#006848', logoFg: '#FFFFFF', accent: '#006848' },
  },
  {
    match: /ikeja|electric|disco|eedc|aedc|ekedc|phed|kedco|ibedc|eedc|bedc|yedc|jed/i,
    style: { logoText: '⚡', logoBg: '#F59E0B', logoFg: '#1A1200', accent: '#F59E0B' },
  },
  {
    match: /dstv|gotv|startimes|showmax/i,
    style: { logoText: 'TV', logoBg: '#E50914', logoFg: '#FFFFFF', accent: '#E50914' },
  },
  {
    match: /waec|jamb|neco|education/i,
    style: { logoText: 'EDU', logoBg: '#FB923C', logoFg: '#1A1200', accent: '#FB923C' },
  },
  {
    match: /bet9ja|sporty|betking|betting/i,
    style: { logoText: 'BET', logoBg: '#F43F5E', logoFg: '#FFFFFF', accent: '#F43F5E' },
  },
  {
    match: /water|lawma|waste|environ/i,
    style: { logoText: 'H2O', logoBg: '#0EA5E9', logoFg: '#FFFFFF', accent: '#0EA5E9' },
  },
];

const DEFAULT_STYLE: BillerBrandStyle = {
  logoText: '•',
  logoBg: '#1E293B',
  logoFg: '#C9A84C',
  accent: '#C9A84C',
};

export function getBillerBrandStyle(provider: UtilityProvider): BillerBrandStyle {
  const name = provider.name;
  for (const rule of BRAND_RULES) {
    if (rule.match.test(name)) {
      const text =
        rule.style.logoText === '•'
          ? name.trim().charAt(0).toUpperCase()
          : rule.style.logoText;
      return { ...rule.style, logoText: text };
    }
  }
  return {
    ...DEFAULT_STYLE,
    logoText: name.trim().charAt(0).toUpperCase() || '•',
  };
}
