import type { UtilityProvider } from '@/esopay/api/types';
import type { NigeriaBillerMeta } from '@/esopay/data/nigeriaBillers';

export type BillerBrandStyle = {
  logoText: string;
  logoBg: string;
  logoFg: string;
  accent: string;
};

/** Distinct DISCO marks for Opay-style electricity provider rows. */
const DISCO_BRANDS: { match: RegExp; style: BillerBrandStyle }[] = [
  {
    match: /ikeja|^ie\b|ikedc/i,
    style: { logoText: 'IE', logoBg: '#0B5CAB', logoFg: '#FFFFFF', accent: '#0B5CAB' },
  },
  {
    match: /eko|ekedc/i,
    style: { logoText: 'EKO', logoBg: '#E11D48', logoFg: '#FFFFFF', accent: '#E11D48' },
  },
  {
    match: /abuja|aedc/i,
    style: { logoText: 'AEDC', logoBg: '#16A34A', logoFg: '#FFFFFF', accent: '#16A34A' },
  },
  {
    match: /ibadan|ibedc/i,
    style: { logoText: 'IB', logoBg: '#CA8A04', logoFg: '#1A1400', accent: '#CA8A04' },
  },
  {
    match: /port\s*harcourt|phed/i,
    style: { logoText: 'PH', logoBg: '#0891B2', logoFg: '#FFFFFF', accent: '#0891B2' },
  },
  {
    match: /kano|kedco|kedc/i,
    style: { logoText: 'KN', logoBg: '#7C3AED', logoFg: '#FFFFFF', accent: '#7C3AED' },
  },
  {
    match: /\bjos\b|jedc|\bjed\b/i,
    style: { logoText: 'JED', logoBg: '#EA580C', logoFg: '#FFFFFF', accent: '#EA580C' },
  },
  {
    match: /benin|bedc/i,
    style: { logoText: 'BE', logoBg: '#059669', logoFg: '#FFFFFF', accent: '#059669' },
  },
  {
    match: /yola|yedc/i,
    style: { logoText: 'YO', logoBg: '#2563EB', logoFg: '#FFFFFF', accent: '#2563EB' },
  },
  {
    match: /\baba\b/i,
    style: { logoText: 'ABA', logoBg: '#DB2777', logoFg: '#FFFFFF', accent: '#DB2777' },
  },
  {
    match: /kaduna|knedc/i,
    style: { logoText: 'KD', logoBg: '#4F46E5', logoFg: '#FFFFFF', accent: '#4F46E5' },
  },
  {
    match: /enugu|eedc/i,
    style: { logoText: 'EE', logoBg: '#0D9488', logoFg: '#FFFFFF', accent: '#0D9488' },
  },
];

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
  ...DISCO_BRANDS,
  {
    match: /electric|disco/i,
    style: { logoText: 'EL', logoBg: '#F59E0B', logoFg: '#1A1200', accent: '#F59E0B' },
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
  logoFg: '#FFFFFF',
  accent: '#FFFFFF',
};

function resolveBrand(name: string): BillerBrandStyle {
  for (const rule of BRAND_RULES) {
    if (rule.match.test(name)) {
      return { ...rule.style };
    }
  }
  return {
    ...DEFAULT_STYLE,
    logoText: name.trim().charAt(0).toUpperCase() || '•',
  };
}

export function getBillerBrandStyle(provider: UtilityProvider): BillerBrandStyle {
  return resolveBrand(provider.name);
}

/** Prefer catalog shortLabel initials on electricity list logos. */
export function getDiscoBrandStyle(meta: NigeriaBillerMeta): BillerBrandStyle {
  const base = resolveBrand(`${meta.name} ${meta.shortLabel} ${meta.id}`);
  const initials = meta.shortLabel.replace(/\s*Post\s*$/i, '').trim() || base.logoText;
  return {
    ...base,
    logoText: initials.length > 4 ? initials.slice(0, 4) : initials,
  };
}
