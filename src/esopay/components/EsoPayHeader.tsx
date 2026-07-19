import { memo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { EsoPayWordmark } from '@/esopay/components/EsoPayWordmark';
import {
  ESO_PAY_BG,
  ESO_PAY_TEXT_PRIMARY,
} from '@/esopay/theme/brandColors';
import { inter } from '@/theme/fonts';

type Props = {
  title: string;
  canGoBack?: boolean;
  onBack?: () => void;
  /** Optional trailing control (e.g. History). */
  rightAction?: ReactNode;
};

export const EsoPayHeader = memo(function EsoPayHeader({
  title,
  canGoBack = false,
  onBack,
  rightAction,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.shell, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {canGoBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={ESO_PAY_TEXT_PRIMARY} strokeWidth={2} />
          </Pressable>
        ) : (
          <EsoPayWordmark />
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {rightAction ? (
          <View style={styles.rightSlot}>{rightAction}</View>
        ) : (
          <View style={{ width: canGoBack ? 32 : 132 }} />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  shell: {
    backgroundColor: ESO_PAY_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  backBtn: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: inter.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: ESO_PAY_TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  rightSlot: {
    minWidth: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
