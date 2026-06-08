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



type PaymentModalContextValue = {

  openPayment: (target: PaymentModalTarget) => void;

  closePayment: () => void;

};



const PaymentModalContext = createContext<PaymentModalContextValue | null>(null);



export function PaymentModalProvider({ children }: { children: ReactNode }) {

  const modalRef = useRef<PaymentModalRef>(null);



  const openPayment = useCallback((target: PaymentModalTarget) => {

    modalRef.current?.present(target);

  }, []);



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


