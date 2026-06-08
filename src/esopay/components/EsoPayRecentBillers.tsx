import { memo } from 'react';
import { QuickPayCarousel } from '@/esopay/components/QuickPayCarousel';
import { QuickPayErrorBoundary } from '@/esopay/components/QuickPayErrorBoundary';

type Props = {
  onSeeAll?: () => void;
};

/** Top shortcuts on Home — 2-column Pay a Bill grid. */
export const EsoPayRecentBillers = memo(function EsoPayRecentBillers({ onSeeAll }: Props) {
  return (
    <QuickPayErrorBoundary>
      <QuickPayCarousel onSeeAll={onSeeAll} />
    </QuickPayErrorBoundary>
  );
});
