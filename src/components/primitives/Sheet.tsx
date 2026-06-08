import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DialogPrimitive from '@rn-primitives/dialog';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getPortalHostName } from '@/components/primitives/PortalRoot';
import { motionSpring } from '@/lib/motion/presets';
import { colors, fontSize, fonts, radius, spacing } from '@/theme/tokens';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  snap?: number;
};

export function BottomSheetDialog({ open, onOpenChange, title, children, snap = 0.58 }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal hostName={getPortalHostName()}>
        <DialogPrimitive.Overlay style={styles.overlay} closeOnPress>
          <MotiView
            from={{ translateY: 48, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: 32, opacity: 0 }}
            transition={motionSpring.luxury}
            style={[
              styles.sheet,
              {
                maxHeight: `${Math.round(snap * 100)}%` as `${number}%`,
                paddingBottom: insets.bottom + spacing.md,
              },
            ]}
          >
            <DialogPrimitive.Content style={styles.content}>
              <View style={styles.handle} />
              <DialogPrimitive.Title style={styles.title}>{title}</DialogPrimitive.Title>
              <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {children}
              </ScrollView>
              <DialogPrimitive.Close asChild>
                <Pressable style={styles.closeHit} accessibilityLabel="Close">
                  <View style={styles.closeIcon} />
                </Pressable>
              </DialogPrimitive.Close>
            </DialogPrimitive.Content>
          </MotiView>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: radius.card + 8,
    borderTopRightRadius: radius.card + 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.title,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  closeHit: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 14,
    height: 2,
    backgroundColor: colors.textTertiary,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
});
