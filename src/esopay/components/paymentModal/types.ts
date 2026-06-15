import type { UtilityProvider } from '@/esopay/api/types';

export type PaymentModalTarget = {
  provider: UtilityProvider;
  accountNumber?: string;
  amountKobo?: number;
  billId?: string;
  customerName?: string;
  accountValidated?: boolean;
  initialStep?: 'form' | 'pin';
  label?: string;
};

export type PaymentModalRef = {
  present: (target: PaymentModalTarget) => void;
  dismiss: () => void;
};

export type PaymentModalStep = 'form' | 'pin' | 'success';

export type PaymentPinMode = 'create' | 'confirm' | 'verify';
