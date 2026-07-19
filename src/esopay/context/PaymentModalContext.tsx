import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import {
  PaymentModal,
  type PaymentModalRef,
  type PaymentModalTarget,
} from '@/esopay/components/PaymentModal';
import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';
import { resolveTrustedPaymentTarget } from '@/esopay/lib/resolveTrustedPaymentTarget';

type PaymentModalContextValue = {
  openPayment: (target: PaymentModalTarget) => void;
  closePayment: () => void;
};

const PaymentModalContext = createContext<PaymentModalContextValue | null>(null);

export function PaymentModalProvider({ children }: { children: ReactNode }) {
  const modalRef = useRef<PaymentModalRef>(null);
  const host = useEsoPayHost();

  const openPayment = useCallback(
    (target: PaymentModalTarget) => {
      const complete =
        Boolean(target.provider) &&
        Boolean(target.accountNumber?.trim()) &&
        typeof target.amountKobo === 'number' &&
        target.amountKobo > 0;

      const present = (next: PaymentModalTarget) => {
        modalRef.current?.present({
          ...next,
          initialStep: next.initialStep ?? (complete ? 'pin' : 'form'),
        });
      };

      if (!complete || (target.accountValidated && target.customerName?.trim())) {
        present(target);
        return;
      }

      void resolveTrustedPaymentTarget(host.companyId, target).then(present);
    },
    [host.companyId],
  );

  const closePayment = useCallback(() => {
    modalRef.current?.dismiss();
  }, []);

  const value = useMemo(
    () => ({ openPayment, closePayment }),
    [closePayment, openPayment],
  );

  return (
    <PaymentModalContext.Provider value={value}>
      {children}
      <PaymentModal ref={modalRef} />
    </PaymentModalContext.Provider>
  );
}

export function usePaymentModal(): PaymentModalContextValue {
  const ctx = useContext(PaymentModalContext);
  if (!ctx) {
    throw new Error('usePaymentModal must be used within PaymentModalProvider');
  }
  return ctx;
}

export type { PaymentModalTarget };
