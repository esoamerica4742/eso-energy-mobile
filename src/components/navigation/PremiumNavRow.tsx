import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: LucideIcon;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  trailing?: React.ReactNode;
  style?: ViewStyle;
  embedded?: boolean;
  embeddedLast?: boolean;
};

export type PremiumNavRowProps = Props;

export function PremiumNavRow({
  title,
  subtitle,
  value,
  icon: Icon,
  onPress,
  destructive = false,
  showChevron = Boolean(onPress),
  trailing,
  style,
  embedded = false,
  embeddedLast = false,
}: Props) {
  const content = (
    <>
      {Icon ? (
        <View style={[styles.iconBox, destructive && styles.iconBoxDestructive]}>
          <Icon
            size={18}
            color={destructive ? Colors.alert : Colors.gold}
            strokeWidth={1.8}
          />
        </View>
      ) : null}
      <View style={styles.textCol}>
        <Text
          style={[styles.title, destructive && styles.titleDestructive]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {trailing}
      {showChevron && onPress ? (
        <ChevronRight size={18} color={Colors.textMuted} strokeWidth={1.8} />
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View
        style={[
          styles.row,
          embedded && styles.rowEmbedded,
          embedded && !embeddedLast && styles.rowEmbeddedDivider,
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        embedded && styles.rowEmbedded,
        embedded && !embeddedLast && styles.rowEmbeddedDivider,
        !embedded && pressed && styles.rowPressed,
        embedded && pressed && styles.rowEmbeddedPressed,
        style,
      ]}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    minHeight: 56,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.card,
  },
  rowPressed: {
    borderColor: Colors.goldBorderStrong,
    backgroundColor: Colors.surfaceRaised,
    transform: [{ scale: 0.985 }],
  },
  rowEmbedded: {
    marginHorizontal: 0,
    marginBottom: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    minHeight: 52,
  },
  rowEmbeddedDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  rowEmbeddedPressed: {
    backgroundColor: Colors.surfaceRaised,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
    backgroundColor: Colors.goldWhisper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxDestructive: {
    borderColor: Colors.alertBorder,
    backgroundColor: Colors.alertMuted,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  titleDestructive: {
    color: Colors.alert,
  },
  subtitle: {
    marginTop: 3,
    fontFamily: fonts.regular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  value: {
    fontFamily: fonts.bold,
    fontSize: FontSize.caption,
    color: Colors.gold,
    fontVariant: ['tabular-nums'],
  },
});
