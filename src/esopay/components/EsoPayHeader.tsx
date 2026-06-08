import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { EsoPayWordmark } from '@/esopay/components/EsoPayWordmark';
import { esopayFonts } from '@/esopay/theme/fonts';
import { EsoPayTokens as T } from '@/esopay/theme/tokens';

type Props = {
  title: string;
  canGoBack?: boolean;
  onBack?: () => void;
};

export const EsoPayHeader = memo(function EsoPayHeader({
  title,
  canGoBack = false,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.shell, { paddingTop: insets.top + T.spacing.sm }]}>
      <View style={styles.row}>
        {canGoBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={T.color.gold.primary} strokeWidth={2.2} />
          </Pressable>
        ) : (
          <EsoPayWordmark />
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={{ width: canGoBack ? 32 : 132 }} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  shell: {
    backgroundColor: T.color.bg.surface,
    borderBottomWidth: 1,
    borderBottomColor: T.color.border.subtle,
    paddingHorizontal: T.layout.screenMargin,
    paddingBottom: T.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  backBtn: {
    marginRight: T.spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: esopayFonts.subheading,
    fontSize: T.type.h3.size,
    lineHeight: T.type.h3.lineHeight,
    color: T.color.text.primary,
    letterSpacing: 0.5,
  },
});
