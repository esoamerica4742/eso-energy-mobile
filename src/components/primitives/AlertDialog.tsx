import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as AlertDialogPrimitive from '@rn-primitives/alert-dialog';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { getPortalHostName } from '@/components/primitives/PortalRoot';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  cancelLabel?: string;
  actionLabel: string;
  onAction: () => void;
  destructive?: boolean;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = 'Cancel',
  actionLabel,
  onAction,
  destructive,
  children,
}: Props) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children ? (
        <AlertDialogPrimitive.Trigger asChild>{children}</AlertDialogPrimitive.Trigger>
      ) : null}
      <AlertDialogPrimitive.Portal hostName={getPortalHostName()}>
        <AlertDialogPrimitive.Overlay style={styles.overlay}>
          <Animated.View entering={FadeIn.duration(160)}>
            <Animated.View entering={ZoomIn.duration(200).springify().damping(18).stiffness(260)}>
              <AlertDialogPrimitive.Content style={styles.content}>
                <AlertDialogPrimitive.Title style={styles.title}>{title}</AlertDialogPrimitive.Title>
                {description ? (
                  <AlertDialogPrimitive.Description style={styles.description}>
                    {description}
                  </AlertDialogPrimitive.Description>
                ) : null}
                <View style={styles.actions}>
                  <AlertDialogPrimitive.Cancel asChild>
                    <Pressable style={styles.cancelBtn}>
                      <Text style={styles.cancelText}>{cancelLabel}</Text>
                    </Pressable>
                  </AlertDialogPrimitive.Cancel>
                  <AlertDialogPrimitive.Action asChild>
                    <Pressable
                      style={[styles.actionBtn, destructive && styles.actionDestructive]}
                      onPress={onAction}
                    >
                      <Text style={[styles.actionText, destructive && styles.actionTextDestructive]}>
                        {actionLabel}
                      </Text>
                    </Pressable>
                  </AlertDialogPrimitive.Action>
                </View>
              </AlertDialogPrimitive.Content>
            </Animated.View>
          </Animated.View>
        </AlertDialogPrimitive.Overlay>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.card + 4,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.xl,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.title,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.button,
    backgroundColor: colors.goldBg,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDestructive: {
    backgroundColor: colors.offlineBg,
    borderColor: colors.offlineDot,
  },
  actionText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
    color: colors.gold,
  },
  actionTextDestructive: {
    color: colors.offlineText,
  },
});
