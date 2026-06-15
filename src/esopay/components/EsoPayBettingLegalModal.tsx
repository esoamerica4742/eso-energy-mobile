import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/esopay/theme/colors';
import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

type Props = {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export function EsoPayBettingLegalModal({ open, onAccept, onDecline }: Props) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onDecline}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Betting payments</Text>
          <Text style={styles.body}>
            You must be 18 or older. Betting wallet funding is subject to Nigerian licensing rules
            and your operator&apos;s terms. Eso Pay only processes payments — we do not operate
            betting services.
          </Text>
          <Text style={styles.body}>
            By continuing, you confirm you are funding a licensed betting account for personal use.
          </Text>

          <Pressable style={styles.acceptBtn} onPress={onAccept}>
            <Text style={styles.acceptText}>I understand — continue</Text>
          </Pressable>
          <Pressable style={styles.declineBtn} onPress={onDecline}>
            <Text style={styles.declineText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.white,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  acceptBtn: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: colors.gold,
    paddingVertical: 14,
    alignItems: 'center',
  },
  acceptText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: colors.black,
  },
  declineBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  declineText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.muted,
  },
});
