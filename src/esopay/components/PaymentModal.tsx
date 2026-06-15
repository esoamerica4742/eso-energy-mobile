import {

  forwardRef,

  useCallback,

  useEffect,

  useImperativeHandle,

  useMemo,

  useRef,

  useState,

} from 'react';

import {

  ActivityIndicator,

  Keyboard,

  Pressable,

  StyleSheet,

  Switch,

  Text,

  TextInput,

  View,

} from 'react-native';

import {

  BottomSheetBackdrop,

  BottomSheetModal,

  BottomSheetScrollView,

  type BottomSheetBackdropProps,

} from '@gorhom/bottom-sheet';

import * as Haptics from 'expo-haptics';

import { CheckCircle2, Fingerprint, Share2, Shield, X } from 'lucide-react-native';

import type { UtilityProvider } from '@/esopay/api/types';

import {

  getPaymentErrorMessage,

  isInsufficientWalletError,

  usePurchaseUtility,

  useUtilityPaymentPoll,

  useValidateUtilityAccount,

  useWallet,

} from '@/esopay/api/hooks/useBilling';

import { BeneficiaryChips } from '@/esopay/components/BeneficiaryChips';

import { EsoPayPrimaryButton } from '@/esopay/components/EsoPayButtons';
import { GoldCTAButton } from '@/esopay/components/GoldCTAButton';

import { PinEntry } from '@/esopay/components/PinEntry';

import { Skeleton } from '@/esopay/components/Skeleton';

import { canInitiateEsoPayPayment } from '@/esopay/context/roles';

import { useEsoPayHost } from '@/esopay/context/EsoPayHostContext';
import { recordQuickPayFromProvider } from '@/esopay/lib/quickPayRecord';

import { useBeneficiaries } from '@/esopay/hooks/useBeneficiaries';

import { useTransactionPin } from '@/esopay/hooks/useTransactionPin';
import { useBiometricPin } from '@/esopay/hooks/useBiometricPin';
import { useEsoPayAuthStore } from '@/esopay/auth/store';
import type { PaymentModalStep } from '@/esopay/components/paymentModal/types';
import { getPaymentBundles, type PaymentBundle } from '@/esopay/data/bundles';

import { isMonnifyAccountReady } from '@/esopay/services/monnify';


import type { EsoPayBeneficiary } from '@/esopay/storage/beneficiaries';

import { colors } from '@/esopay/theme/colors';

import { spacing } from '@/esopay/theme/spacing';

import { fonts } from '@/esopay/theme/typography';

import { formatCurrency, parseNairaInputToKobo } from '@/esopay/utils/currency';

import {

  printReceipt,

  shareReceiptPdf,

  type PaymentReceiptData,

} from '@/esopay/utils/receipt';

import { useRouter } from 'expo-router';

import { esopayFundWalletHref } from '@/esopay/navigation/routes';


import { useEnodeToast } from '@/providers/EnodeToastProvider';

import { useQueryClient } from '@tanstack/react-query';

import type { PowerShieldDashboard, PowerShieldMeter } from '@/esopay/api/types';

import { esoPayKeys } from '@/esopay/api/queryKeys';

import { PrepaidTokenDeliveryCard } from '@/esopay/components/PrepaidTokenDeliveryCard';
import { PowerShieldFeedbackPrompt } from '@/esopay/components/PowerShieldFeedbackPrompt';
import { formatPrepaidTokenDisplay } from '@/esopay/lib/prepaidTokenFormat';



export type PaymentModalTarget = {

  provider: UtilityProvider;

  accountNumber?: string;

  amountKobo?: number;

  billId?: string;

  /** Pre-validated customer name from utility flow */

  customerName?: string;

  /** Skip debounced re-validation when account was verified on flow screen */

  accountValidated?: boolean;

  /** Jump straight to PIN after OPay-style utility flow */

  initialStep?: 'form' | 'pin';

};



export type PaymentModalRef = {

  present: (target: PaymentModalTarget) => void;

  dismiss: () => void;

};



type Step = 'form' | 'pin' | 'success';



type Props = {

  onDismiss?: () => void;

};



export const PaymentModal = forwardRef<PaymentModalRef, Props>(function PaymentModal(

  { onDismiss },

  ref,

) {

  const router = useRouter();

  const toast = useEnodeToast();

  const host = useEsoPayHost();

  const queryClient = useQueryClient();

  const sheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['80%'], []);



  const [target, setTarget] = useState<PaymentModalTarget | null>(null);

  const [step, setStep] = useState<PaymentModalStep>('form');

  const [accountNumber, setAccountNumber] = useState('');

  const [amountInput, setAmountInput] = useState('');

  const [saveBeneficiary, setSaveBeneficiary] = useState(false);

  const [customerName, setCustomerName] = useState<string | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  const [receiptToken, setReceiptToken] = useState<string | null>(null);

  const [paymentRef, setPaymentRef] = useState<string | null>(null);

  const [transactionRef, setTransactionRef] = useState<string | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<string>('success');

  const [paidAt, setPaidAt] = useState<string>(new Date().toISOString());

  const [pinInput, setPinInput] = useState('');

  const [confirmPinInput, setConfirmPinInput] = useState('');

  const [pinMode, setPinMode] = useState<'verify' | 'create' | 'confirm'>('verify');

  const [pinError, setPinError] = useState<string | null>(null);

  const [isSharingReceipt, setIsSharingReceipt] = useState(false);
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [feedbackMeterSnapshot, setFeedbackMeterSnapshot] = useState<PowerShieldMeter | null>(null);
  const [paymentFeedbackDone, setPaymentFeedbackDone] = useState(false);
  const [fulfillmentMessage, setFulfillmentMessage] = useState<string | null>(null);
  const [tokenFormatted, setTokenFormatted] = useState<string | null>(null);
  const [tokenMeterName, setTokenMeterName] = useState<string | null>(null);
  const biometricAttemptedRef = useRef(false);



  const walletQuery = useWallet();

  const validateMutation = useValidateUtilityAccount();

  const purchaseMutation = usePurchaseUtility();

  const validateAccount = validateMutation.mutate;

  const { beneficiaries, save: saveBeneficiaryEntry } = useBeneficiaries(target?.provider.id);

  const {
    pinConfigured,
    isChecking: pinChecking,
    configurePin,
    verifyPin,
    userId,
    userIdReady,
  } = useTransactionPin();

  const setPinUnlocked = useEsoPayAuthStore((s) => s.setLoginPinUnlocked);

  const {
    available: biometricAvailable,
    enabled: biometricEnabled,
    label: biometricLabel,
    authenticate: authenticateBiometric,
  } = useBiometricPin();



  const pollQuery = useUtilityPaymentPoll(

    paymentRef,

    paymentStatus as
      | 'pending'
      | 'processing'
      | 'success'
      | 'failed'
      | 'reversed'
      | 'pending_fulfillment',

    step === 'success',

  );



  const amountKobo = parseNairaInputToKobo(amountInput);

  const paymentBundles = useMemo<PaymentBundle[] | null>(
    () => (target ? getPaymentBundles(target.provider) : null),
    [target],
  );

  const canPayRole = canInitiateEsoPayPayment(host.userRole);

  const walletBalance = walletQuery.data?.balance_kobo ?? 0;

  const insufficientFunds = amountKobo > 0 && walletBalance < amountKobo;

  const fundsNeededKobo = insufficientFunds ? amountKobo - walletBalance : 0;

  const resolvedStatus = pollQuery.data?.status ?? paymentStatus;

  const isPendingFulfillment = resolvedStatus === 'pending_fulfillment';

  const isProcessing =
    step === 'success' &&
    !isPendingFulfillment &&
    (paymentStatus === 'pending' || paymentStatus === 'processing' || pollQuery.isFetching);

  const isTerminalFailure = resolvedStatus === 'failed' || resolvedStatus === 'reversed';



  const receiptData = useMemo<PaymentReceiptData | null>(() => {

    if (!target || !paymentRef) return null;

    return {

      providerName: target.provider.name,

      customerName,

      accountNumber: accountNumber.trim(),

      amountKobo,

      paymentReference: paymentRef,

      transactionReference: transactionRef,

      tokenOrReceipt: receiptToken,

      paidAt,

      status: resolvedStatus,

    };

  }, [

    accountNumber,

    amountKobo,

    customerName,

    paidAt,

    paymentRef,

    receiptToken,

    resolvedStatus,

    target,

    transactionRef,

  ]);



  const resetForm = useCallback(() => {

    setStep('form');

    setAccountNumber('');

    setAmountInput('');

    setSaveBeneficiary(false);

    setCustomerName(null);

    setValidationError(null);

    setReceiptToken(null);

    setPaymentRef(null);

    setTransactionRef(null);

    setPaymentStatus('success');

    setPaidAt(new Date().toISOString());

    setPinInput('');

    setConfirmPinInput('');

    setPinMode('verify');

    setPinError(null);

    setIsSharingReceipt(false);
    setSelectedBundleId(null);
    setFeedbackMeterSnapshot(null);
    setPaymentFeedbackDone(false);
    biometricAttemptedRef.current = false;

    validateMutation.reset();

    purchaseMutation.reset();

  }, [purchaseMutation, validateMutation]);



  useImperativeHandle(ref, () => ({

    present(nextTarget) {

      resetForm();

      setTarget(nextTarget);

      setAccountNumber(nextTarget.accountNumber ?? '');

      if (nextTarget.amountKobo) {

        setAmountInput(String(nextTarget.amountKobo / 100));

      }

      if (nextTarget.customerName) {

        setCustomerName(nextTarget.customerName);

      }

      if (nextTarget.initialStep === 'pin') {

        setStep('pin');

      }

      sheetRef.current?.present();

    },

    dismiss() {

      sheetRef.current?.dismiss();

    },

  }));



  useEffect(() => {

    if (!pinChecking) {

      setPinMode(pinConfigured ? 'verify' : 'create');

    }

  }, [pinChecking, pinConfigured]);



  useEffect(() => {

    if (!target || !isMonnifyAccountReady(accountNumber)) {

      setCustomerName(null);

      setValidationError(null);

      return;

    }

    if (target.accountValidated && target.customerName) {

      return;

    }



    const timer = setTimeout(() => {

      validateAccount(

        {

          provider_id: target.provider.id,

          account_number: accountNumber.trim(),

          amount_kobo: amountKobo > 0 ? amountKobo : undefined,

        },

        {

          onSuccess: (result) => {

            if (result.valid) {

              setCustomerName(result.customer_name);

              setValidationError(null);

              if (!amountInput && result.minimum_amount_kobo) {

                setAmountInput(String(result.minimum_amount_kobo / 100));

              }

            } else {

              setCustomerName(null);

              setValidationError('Account not found. Check the meter or smartcard number.');

            }

          },

          onError: (error) => {

            setCustomerName(null);

            setValidationError(getPaymentErrorMessage(error));

          },

        },

      );

    }, 550);



    return () => clearTimeout(timer);

  }, [accountNumber, amountInput, amountKobo, target, validateAccount]);



  useEffect(() => {
    const polled = pollQuery.data;
    if (!polled) return;

    if (polled.status !== paymentStatus) {
      setPaymentStatus(polled.status);
      if (polled.status === 'success') {
        toast.show('Payment confirmed', 'success');
      } else if (polled.status === 'failed' || polled.status === 'reversed') {
        toast.show('Payment failed', 'error');
      }
    }

    if (polled.token_or_receipt) {
      setReceiptToken(polled.token_or_receipt);
      setTokenFormatted(polled.token_formatted ?? formatPrepaidTokenDisplay(polled.token_or_receipt));
      if (polled.meter_name) setTokenMeterName(polled.meter_name);
    }
  }, [paymentStatus, pollQuery.data, toast]);



  const executePurchase = useCallback(() => {

    if (!target || !canPayRole) return;

    if (!customerName || amountKobo <= 0) return;

    if (target.provider.category === 'electricity') {
      const dashboard = queryClient.getQueryData<PowerShieldDashboard>(
        esoPayKeys.powerShield(host.companyId),
      );
      const meter = dashboard?.meters.find(
        (m) =>
          m.account_number === accountNumber.trim() &&
          m.provider?.id === target.provider.id,
      );
      setFeedbackMeterSnapshot(meter ?? null);
    } else {
      setFeedbackMeterSnapshot(null);
    }

    purchaseMutation.mutate(

      {

        provider_id: target.provider.id,

        account_number: accountNumber.trim(),

        amount_kobo: amountKobo,

        bill_id: target.billId,

      },

      {

        onSuccess: async (response) => {

          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          setPaymentRef(response.payment_reference);

          setTransactionRef(response.transaction_reference);

          setReceiptToken(response.token_or_receipt);
          setTokenFormatted(
            response.token_formatted ??
              (response.token_or_receipt
                ? formatPrepaidTokenDisplay(response.token_or_receipt)
                : null),
          );
          setTokenMeterName(response.meter_name ?? target?.label ?? customerName);

          setPaymentStatus(response.status);

          setFulfillmentMessage(response.user_message ?? null);

          setPaidAt(new Date().toISOString());

          setStep('success');



          if (saveBeneficiary && target) {

            await saveBeneficiaryEntry({

              providerId: target.provider.id,

              providerName: target.provider.name,

              accountNumber: accountNumber.trim(),

              customerName,

            });

          }



          if (response.status === 'pending_fulfillment') {
            toast.show('Payment received — token queued', 'info');
          } else if (response.status === 'success') {

            toast.show('Payment successful', 'success');

            if (host.companyId && target.provider) {
              void recordQuickPayFromProvider(
                host.companyId,
                target.provider,
                amountKobo,
              );
            }

          } else {

            toast.show('Payment processing…', 'info');

          }

        },

        onError: async (error) => {

          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

          toast.show(getPaymentErrorMessage(error), 'error');

          setStep('form');

        },

      },

    );

  }, [

    accountNumber,

    amountKobo,

    canPayRole,

    customerName,

    purchaseMutation,

    router,

    saveBeneficiary,

    saveBeneficiaryEntry,

    target,

    toast,

    queryClient,

    host.companyId,

    walletBalance,

  ]);



  const handleAddFunds = useCallback(() => {

    const topUpKobo = amountKobo > walletBalance ? amountKobo - walletBalance : undefined;

    sheetRef.current?.dismiss();

    router.push(esopayFundWalletHref(topUpKobo != null ? { amountKobo: topUpKobo } : undefined));

  }, [amountKobo, router, walletBalance]);



  const handleContinueToPin = useCallback(() => {

    if (!target || !canPayRole) return;

    if (!customerName || amountKobo <= 0) return;

    if (!userIdReady || !userId) {
      toast.show('Account still loading — wait a moment and try again', 'info');
      return;
    }

    if (walletBalance < amountKobo) {

      toast.show('Add funds to your wallet to continue', 'warning');

      return;

    }

    setPinInput('');

    setConfirmPinInput('');

    setPinError(null);

    setPinMode(pinConfigured ? 'verify' : 'create');

    setStep('pin');

  }, [

    amountKobo,

    canPayRole,

    customerName,

    pinConfigured,

    target,

    toast,

    userId,
    userIdReady,
    walletBalance,

  ]);

  const handleSelectBundle = useCallback((bundle: PaymentBundle) => {
    setSelectedBundleId(bundle.id);
    setAmountInput(String(bundle.amountKobo / 100));
  }, []);



  const handlePinComplete = useCallback(

    async (pin: string) => {

      setPinError(null);

      if (!userId) {
        setPinError('Sign in to Eso Pay to use your transaction PIN');
        return;
      }

      if (pinMode === 'create') {

        setPinInput(pin);

        setConfirmPinInput('');

        setPinMode('confirm');

        return;

      }



      if (pinMode === 'confirm') {

        if (pin !== pinInput) {

          setPinError('PINs do not match. Try again.');

          setConfirmPinInput('');

          return;

        }

        try {

          await configurePin(pin);

          toast.show('Transaction PIN saved', 'success');

          setPinMode('verify');

          executePurchase();

        } catch (error) {

          setPinError(error instanceof Error ? error.message : 'Could not save PIN');

          setConfirmPinInput('');

        }

        return;

      }



      const valid = await verifyPin(pin);

      if (!valid) {

        setPinError('Incorrect PIN');

        setPinInput('');

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        return;

      }



      executePurchase();

    },

    [configurePin, executePurchase, pinInput, pinMode, setPinUnlocked, toast, userId, verifyPin],

  );



  const handleBeneficiarySelect = useCallback((beneficiary: EsoPayBeneficiary) => {

    setAccountNumber(beneficiary.accountNumber);

    setCustomerName(beneficiary.customerName);

    setValidationError(null);

  }, []);



  const handleShareReceipt = useCallback(async () => {

    if (!receiptData) return;

    setIsSharingReceipt(true);

    try {

      await shareReceiptPdf(receiptData);

    } catch (error) {

      toast.show(error instanceof Error ? error.message : 'Could not share receipt', 'error');

    } finally {

      setIsSharingReceipt(false);

    }

  }, [receiptData, toast]);



  const handlePrintReceipt = useCallback(async () => {

    if (!receiptData) return;

    try {

      await printReceipt(receiptData);

    } catch (error) {

      toast.show(error instanceof Error ? error.message : 'Could not print receipt', 'error');

    }

  }, [receiptData, toast]);



  const renderBackdrop = useCallback(

    (props: BottomSheetBackdropProps) => (

      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.72} />

    ),

    [],

  );



  const handleDismiss = useCallback(() => {

    Keyboard.dismiss();

    resetForm();

    setTarget(null);

    onDismiss?.();

  }, [onDismiss, resetForm]);



  const providerName = target?.provider.name ?? 'Utility payment';

  useEffect(() => {
    if (step !== 'pin' || pinMode !== 'verify' || !biometricEnabled || !biometricAvailable) {
      return;
    }
    if (biometricAttemptedRef.current) return;
    biometricAttemptedRef.current = true;

    let cancelled = false;
    void (async () => {
      const ok = await authenticateBiometric(
        `Authorize ${formatCurrency(amountKobo)} for ${providerName}`,
      );
      if (!cancelled && ok) executePurchase();
    })();

    return () => {
      cancelled = true;
    };
  }, [
    amountKobo,
    authenticateBiometric,
    biometricAvailable,
    biometricEnabled,
    executePurchase,
    pinMode,
    providerName,
    step,
  ]);



  const pinTitle =

    pinMode === 'create'

      ? 'Create transaction PIN'

      : pinMode === 'confirm'

        ? 'Confirm transaction PIN'

        : 'Enter transaction PIN';



  const pinSubtitle =

    pinMode === 'create'

      ? 'Secure wallet debits with a 4-digit PIN stored on this device.'

      : pinMode === 'confirm'

        ? 'Re-enter your PIN to confirm.'

        : `Authorize ${formatCurrency(amountKobo)} for ${providerName}.`;



  const pinValue = pinMode === 'confirm' ? confirmPinInput : pinInput;

  const setPinValue = pinMode === 'confirm' ? setConfirmPinInput : setPinInput;



  return (

    <BottomSheetModal

      ref={sheetRef}

      snapPoints={snapPoints}

      enablePanDownToClose

      backdropComponent={renderBackdrop}

      backgroundStyle={styles.sheetBg}

      handleIndicatorStyle={styles.handle}

      onDismiss={handleDismiss}

    >

      <BottomSheetScrollView contentContainerStyle={styles.content}>

        <View style={styles.header}>

          <View style={styles.headerCopy}>

            <Text style={styles.eyebrow}>Monnify · Wallet debit</Text>

            <Text style={styles.title}>{providerName}</Text>

          </View>

          <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={12}>

            <X size={22} color={colors.muted} strokeWidth={2} />

          </Pressable>

        </View>



        {step === 'success' ? (

          <View style={styles.successBlock}>

            {isProcessing ? (

              <ActivityIndicator color={colors.gold} size="large" />

            ) : isPendingFulfillment ? (

              <Shield size={56} color={colors.gold} strokeWidth={1.8} />

            ) : (

              <CheckCircle2

                size={56}

                color={isTerminalFailure ? colors.danger : colors.gold}

                strokeWidth={1.8}

              />

            )}

            <Text style={styles.successTitle}>

              {isPendingFulfillment

                ? 'Payment Received!'

                : isProcessing

                  ? 'Confirming payment…'

                  : isTerminalFailure

                    ? 'Payment failed'

                    : 'Payment submitted'}

            </Text>

            {isPendingFulfillment ? (
              <Text style={styles.fulfillmentMessage}>
                {fulfillmentMessage ??
                  'The DisCo network is currently undergoing brief maintenance. Your token is safely queued and our system will automatically deliver it via SMS and Push Notification the moment the grid pipes clear.'}
              </Text>
            ) : null}

            <Text style={styles.successAmount}>{formatCurrency(amountKobo)}</Text>

            {paymentRef ? <Text style={styles.refText}>Ref: {paymentRef}</Text> : null}

            {!isProcessing && !isPendingFulfillment ? (

              <Text style={styles.statusPill}>

                Status: {resolvedStatus.replace(/_/g, ' ')}

              </Text>

            ) : null}

            {isPendingFulfillment ? (
              <Text style={styles.statusPill}>Status: Queued for delivery</Text>
            ) : null}

            {receiptToken &&
            target?.provider.category === 'electricity' &&
            resolvedStatus === 'success' ? (
              <PrepaidTokenDeliveryCard
                token={receiptToken}
                tokenFormatted={tokenFormatted}
                meterName={tokenMeterName ?? target.label}
                amountKobo={amountKobo}
              />
            ) : receiptToken ? (
              <View style={styles.tokenBox}>
                <Text style={styles.tokenLabel}>Token / receipt</Text>
                <Text style={styles.tokenValue} selectable>
                  {receiptToken}
                </Text>
              </View>
            ) : null}



            {target?.provider.category === 'electricity' &&
            !isProcessing &&
            !isTerminalFailure &&
            resolvedStatus === 'success' &&
            !paymentFeedbackDone ? (
              <PowerShieldFeedbackPrompt
                context="post_payment"
                meter={feedbackMeterSnapshot}
                onSubmitted={() => setPaymentFeedbackDone(true)}
              />
            ) : null}



            <View style={styles.receiptActions}>

              <Pressable

                style={styles.secondaryBtn}

                onPress={() => void handleShareReceipt()}

                disabled={!receiptData || isSharingReceipt}

              >

                {isSharingReceipt ? (

                  <ActivityIndicator color={colors.gold} size="small" />

                ) : (

                  <>

                    <Share2 size={16} color={colors.gold} />

                    <Text style={styles.secondaryBtnText}>Share PDF</Text>

                  </>

                )}

              </Pressable>

              <Pressable

                style={styles.secondaryBtn}

                onPress={() => void handlePrintReceipt()}

                disabled={!receiptData}

              >

                <Text style={styles.secondaryBtnText}>Print</Text>

              </Pressable>

            </View>



            <EsoPayPrimaryButton label="Done" onPress={() => sheetRef.current?.dismiss()} />

          </View>

        ) : step === 'pin' ? (

          <View>

            <PinEntry

              title={pinTitle}

              subtitle={pinSubtitle}

              value={pinValue}

              onChange={setPinValue}

              onComplete={(pin) => void handlePinComplete(pin)}

              error={pinError}

            />

            {biometricAvailable && biometricEnabled && pinMode === 'verify' ? (
              <Pressable
                onPress={() => {
                  void authenticateBiometric(
                    `Authorize ${formatCurrency(amountKobo)} for ${providerName}`,
                  ).then((ok) => {
                    if (ok) executePurchase();
                  });
                }}
                style={styles.biometricBtn}
              >
                <Fingerprint size={18} color={colors.gold} strokeWidth={2} />
                <Text style={styles.biometricBtnText}>Use {biometricLabel}</Text>
              </Pressable>
            ) : null}

            {purchaseMutation.isPending ? (

              <View style={styles.processingRow}>

                <ActivityIndicator color={colors.gold} />

                <Text style={styles.processingText}>Processing payment…</Text>

              </View>

            ) : (

              <Pressable onPress={() => setStep('form')} style={styles.backLink}>

                <Text style={styles.backLinkText}>Back to payment details</Text>

              </Pressable>

            )}

          </View>

        ) : (

          <>

            <BeneficiaryChips

              beneficiaries={beneficiaries}

              onSelect={handleBeneficiarySelect}

              selectedAccountNumber={accountNumber.trim()}

            />



            <Text style={[styles.fieldLabel, styles.fieldGap]}>Meter / account number</Text>

            <TextInput

              value={accountNumber}

              onChangeText={setAccountNumber}

              placeholder="Enter smart meter or account number"

              placeholderTextColor={colors.muted}

              keyboardType="number-pad"

              style={styles.input}

            />



            {validateMutation.isPending && isMonnifyAccountReady(accountNumber) ? (

              <View style={styles.lookupRow}>

                <Skeleton height={14} width="55%" />

                <ActivityIndicator color={colors.gold} size="small" />

              </View>

            ) : customerName ? (

              <Text style={styles.customerName}>{customerName}</Text>

            ) : validationError ? (

              <Text style={styles.validationError}>{validationError}</Text>

            ) : null}



            {paymentBundles && paymentBundles.length > 0 ? (
              <>
                <Text style={[styles.fieldLabel, styles.fieldGap]}>
                  {target?.provider.category === 'airtime' ? 'Quick amounts' : 'Select plan'}
                </Text>
                <View style={styles.bundleGrid}>
                  {paymentBundles.map((bundle) => {
                    const active = selectedBundleId === bundle.id;
                    return (
                      <Pressable
                        key={bundle.id}
                        onPress={() => handleSelectBundle(bundle)}
                        style={[styles.bundleChip, active && styles.bundleChipActive]}
                      >
                        <Text style={[styles.bundleLabel, active && styles.bundleLabelActive]}>
                          {bundle.label}
                        </Text>
                        {bundle.sublabel ? (
                          <Text style={styles.bundleSub}>{bundle.sublabel}</Text>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}



            <Text style={[styles.fieldLabel, styles.fieldGap]}>Amount</Text>

            <View style={styles.amountRow}>

              <Text style={styles.nairaPrefix}>₦</Text>

              <TextInput

                value={amountInput}

                onChangeText={setAmountInput}

                placeholder="0.00"

                placeholderTextColor={colors.muted}

                keyboardType="decimal-pad"

                style={styles.amountInput}

              />

            </View>



            <Text style={[styles.walletHint, insufficientFunds && styles.walletHintWarn]}>

              Wallet balance: {formatCurrency(walletBalance)}

            </Text>



            {insufficientFunds ? (

              <>

                <Text style={styles.walletWarn}>

                  You need {formatCurrency(fundsNeededKobo)} more to complete this payment.

                </Text>

                <GoldCTAButton

                  label="Add funds"

                  onPress={handleAddFunds}

                  style={styles.addFundsBtn}

                />

              </>

            ) : null}



            <View style={styles.toggleRow}>

              <Text style={styles.toggleLabel}>Save beneficiary</Text>

              <Switch

                value={saveBeneficiary}

                onValueChange={setSaveBeneficiary}

                trackColor={{ false: colors.surface2, true: colors.goldGlow }}

                thumbColor={saveBeneficiary ? colors.gold : colors.muted}

              />

            </View>



            {!canPayRole ? (

              <Text style={styles.rbacHint}>

                Your role cannot initiate payments. Contact an account owner.

              </Text>

            ) : null}



            <GoldCTAButton

              label={

                amountKobo > 0 ? `Continue · ${formatCurrency(amountKobo)}` : 'Continue'

              }

              onPress={handleContinueToPin}

              isDisabled={!canPayRole || !customerName || amountKobo <= 0 || insufficientFunds}

              style={styles.payBtn}

            />



            <Text style={styles.disclaimer}>

              Debited from your Monnify wallet via server-side bill payment. No card data

              is stored on this device.

            </Text>

          </>

        )}

      </BottomSheetScrollView>

    </BottomSheetModal>

  );

});



const styles = StyleSheet.create({

  sheetBg: {

    backgroundColor: colors.surface,

    borderTopLeftRadius: 24,

    borderTopRightRadius: 24,

    borderWidth: 1,

    borderColor: colors.goldBorder,

  },

  handle: {

    backgroundColor: colors.goldDim,

    width: 44,

  },

  content: {

    paddingHorizontal: spacing.screen,

    paddingBottom: spacing.xxxl,

  },

  header: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'flex-start',

    marginBottom: spacing.lg,

    gap: spacing.md,

  },

  headerCopy: {

    flex: 1,

    gap: 4,

  },

  eyebrow: {

    fontFamily: fonts.uiMedium,

    fontSize: 10,

    letterSpacing: 1.5,

    color: colors.gold,

    textTransform: 'uppercase',

  },

  title: {

    fontFamily: fonts.display,

    fontSize: 26,

    color: colors.white,

  },

  fieldLabel: {

    fontFamily: fonts.uiMedium,

    fontSize: 12,

    color: colors.muted,

    marginBottom: spacing.sm,

  },

  fieldGap: {

    marginTop: spacing.lg,

  },

  input: {

    backgroundColor: colors.surface2,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: colors.goldBorder,

    paddingHorizontal: spacing.lg,

    paddingVertical: 14,

    fontFamily: fonts.ui,

    fontSize: 16,

    color: colors.white,

  },

  lookupRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginTop: spacing.sm,

  },

  customerName: {

    marginTop: spacing.sm,

    fontFamily: fonts.uiMedium,

    fontSize: 14,

    color: colors.gold,

  },

  validationError: {

    marginTop: spacing.sm,

    fontFamily: fonts.ui,

    fontSize: 13,

    color: colors.danger,

  },

  amountRow: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: colors.surface2,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: colors.goldBorder,

    paddingHorizontal: spacing.lg,

  },

  nairaPrefix: {

    fontFamily: fonts.display,

    fontSize: 22,

    color: colors.gold,

    marginRight: spacing.sm,

  },

  amountInput: {

    flex: 1,

    paddingVertical: 14,

    fontFamily: fonts.display,

    fontSize: 28,

    color: colors.white,

  },

  walletHint: {

    marginTop: spacing.sm,

    fontFamily: fonts.ui,

    fontSize: 13,

    color: colors.muted,

  },

  walletHintWarn: {

    color: colors.warning,

  },

  walletWarn: {

    marginTop: spacing.sm,

    fontFamily: fonts.ui,

    fontSize: 13,

    lineHeight: 18,

    color: colors.warning,

  },

  addFundsBtn: {

    marginTop: spacing.md,

  },

  toggleRow: {

    marginTop: spacing.lg,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

  },

  toggleLabel: {

    fontFamily: fonts.ui,

    fontSize: 14,

    color: colors.white,

  },

  rbacHint: {

    marginTop: spacing.md,

    fontFamily: fonts.ui,

    fontSize: 13,

    color: colors.warning,

  },

  payBtn: {

    marginTop: spacing.xl,

  },

  disclaimer: {

    marginTop: spacing.md,

    fontFamily: fonts.ui,

    fontSize: 12,

    lineHeight: 18,

    color: colors.muted,

    textAlign: 'center',

  },

  successBlock: {

    alignItems: 'center',

    gap: spacing.md,

    paddingVertical: spacing.xxl,

  },

  successTitle: {

    fontFamily: fonts.display,

    fontSize: 28,

    color: colors.white,

    textAlign: 'center',

  },

  fulfillmentMessage: {
    fontFamily: fonts.ui,
    fontSize: 15,
    lineHeight: 23,
    color: colors.white,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 4,
  },

  successAmount: {

    fontFamily: fonts.display,

    fontSize: 36,

    color: colors.gold,

  },

  refText: {

    fontFamily: fonts.ui,

    fontSize: 13,

    color: colors.muted,

  },

  statusPill: {

    fontFamily: fonts.uiMedium,

    fontSize: 12,

    color: colors.gold,

    textTransform: 'capitalize',

  },

  tokenBox: {

    width: '100%',

    backgroundColor: colors.surface2,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: colors.goldBorder,

    padding: spacing.lg,

    gap: spacing.sm,

  },

  tokenLabel: {

    fontFamily: fonts.uiMedium,

    fontSize: 11,

    letterSpacing: 1,

    color: colors.gold,

    textTransform: 'uppercase',

  },

  tokenValue: {

    fontFamily: fonts.ui,

    fontSize: 16,

    color: colors.white,

    lineHeight: 24,

  },

  receiptActions: {

    flexDirection: 'row',

    gap: spacing.sm,

    width: '100%',

  },

  secondaryBtn: {

    flex: 1,

    minHeight: 44,

    borderRadius: 12,

    borderWidth: 1,

    borderColor: colors.goldBorder,

    backgroundColor: colors.surface2,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: spacing.sm,

  },

  secondaryBtnText: {

    fontFamily: fonts.uiMedium,

    fontSize: 14,

    color: colors.gold,

  },

  processingRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: spacing.sm,

    marginTop: spacing.lg,

  },

  processingText: {

    fontFamily: fonts.ui,

    fontSize: 14,

    color: colors.muted,

  },

  backLink: {

    alignItems: 'center',

    paddingVertical: spacing.lg,

  },

  backLinkText: {

    fontFamily: fonts.uiMedium,

    fontSize: 14,

    color: colors.gold,

  },

  bundleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  bundleChip: {
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    gap: 2,
  },

  bundleChipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldGlow,
  },

  bundleLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.white,
  },

  bundleLabelActive: {
    color: colors.gold,
  },

  bundleSub: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: colors.muted,
  },

  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.surface2,
  },

  biometricBtnText: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: colors.gold,
  },

});


