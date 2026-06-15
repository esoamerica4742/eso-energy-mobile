import {
  getPaymentPinSubtitle,
  getPaymentPinTitle,
} from '@/esopay/components/paymentModal/pinCopy';

describe('paymentModal pin copy', () => {
  it('returns titles per mode', () => {
    expect(getPaymentPinTitle('create')).toMatch(/Create/i);
    expect(getPaymentPinTitle('confirm')).toMatch(/Confirm/i);
    expect(getPaymentPinTitle('verify')).toMatch(/Enter/i);
  });

  it('includes amount in verify subtitle', () => {
    const subtitle = getPaymentPinSubtitle('verify', '₦1,000.00', 'EKEDC');
    expect(subtitle).toContain('₦1,000.00');
    expect(subtitle).toContain('EKEDC');
  });
});
