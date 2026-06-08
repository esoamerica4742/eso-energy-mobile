import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type ToastKind = 'info' | 'success' | 'warning' | 'error';

type Toast = {
  id: string;
  message: string;
  kind: ToastKind;
};

type ToastContextValue = {
  show: (message: string, kind?: ToastKind) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const KIND_COLORS: Record<ToastKind, string> = {
  info: colors.gridDot,
  success: colors.solarDot,
  warning: colors.warningDot,
  error: colors.offlineDot,
};

export function EnodeToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = `${Date.now()}`;
    setToast({ id, message, kind });
  }, []);

  useEffect(() => {
    if (!toast) return;
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2800),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [toast, opacity]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View
          style={[
            styles.wrap,
            { opacity, borderLeftColor: KIND_COLORS[toast.kind] },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useEnodeToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useEnodeToast must be used within EnodeToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 56,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderLeftWidth: 3,
    borderRadius: radius.card,
    padding: spacing.md,
    zIndex: 9999,
    elevation: 8,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
});
