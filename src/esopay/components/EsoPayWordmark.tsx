import { memo } from 'react';
import { EsoPayBillsWordmark } from '@/esopay/components/EsoPayBillsWordmark';

/** Compact header wordmark — Eso Pay Bills */
export const EsoPayWordmark = memo(function EsoPayWordmark() {
  return <EsoPayBillsWordmark size="header" />;
});
