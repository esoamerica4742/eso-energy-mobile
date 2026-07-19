export type AuthVariant = 'default' | 'esopay' | 'monitoring' | 'master';

/** `default` maps to the gold primary CTA; `monitoring` maps to teal. */
export type AuthButtonVariant = AuthVariant | 'primary' | 'ghost';
