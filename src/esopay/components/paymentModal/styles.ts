import { StyleSheet } from 'react-native';

import { spacing } from '@/esopay/theme/spacing';
import { fonts } from '@/esopay/theme/typography';

const BG = '#1C1C1E';
const SURFACE = '#2C2C2E';
const TEXT = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.55)';
const BORDER = 'rgba(255,255,255,0.12)';
const DANGER = '#FF6B6B';
const WARNING = '#F59E0B';

export const paymentModalStyles = StyleSheet.create({
  sheetBg: {
    backgroundColor: BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  handle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
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
    fontSize: 12,
    letterSpacing: 0.2,
    color: MUTED,
    textTransform: 'none',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: -0.4,
    color: TEXT,
  },
  fieldLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: MUTED,
    marginBottom: spacing.sm,
  },
  fieldGap: {
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontFamily: fonts.ui,
    fontSize: 16,
    color: TEXT,
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
    color: TEXT,
  },
  validationError: {
    marginTop: spacing.sm,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: DANGER,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: spacing.lg,
  },
  nairaPrefix: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: MUTED,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: fonts.display,
    fontSize: 28,
    color: TEXT,
  },
  walletHint: {
    marginTop: spacing.sm,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: MUTED,
  },
  walletHintWarn: {
    color: WARNING,
  },
  walletWarn: {
    marginTop: spacing.sm,
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 18,
    color: WARNING,
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
    color: TEXT,
  },
  rbacHint: {
    marginTop: spacing.md,
    fontFamily: fonts.ui,
    fontSize: 13,
    color: WARNING,
  },
  payBtn: {
    marginTop: spacing.xl,
  },
  disclaimer: {
    marginTop: spacing.md,
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 18,
    color: MUTED,
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
    color: TEXT,
    textAlign: 'center',
  },
  fulfillmentMessage: {
    fontFamily: fonts.ui,
    fontSize: 15,
    lineHeight: 23,
    color: TEXT,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  successAmount: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: TEXT,
  },
  refText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: MUTED,
  },
  statusPill: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: MUTED,
    textTransform: 'capitalize',
  },
  tokenBox: {
    width: '100%',
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  tokenLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    letterSpacing: 1,
    color: MUTED,
    textTransform: 'uppercase',
  },
  tokenValue: {
    fontFamily: fonts.ui,
    fontSize: 16,
    color: TEXT,
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  secondaryBtnText: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: TEXT,
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
    color: MUTED,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  backLinkText: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: '#4DA3FF',
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    alignItems: 'center',
    gap: 2,
  },
  bundleChipActive: {
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bundleLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: TEXT,
  },
  bundleLabelActive: {
    color: TEXT,
  },
  bundleSub: {
    fontFamily: fonts.ui,
    fontSize: 10,
    color: MUTED,
  },
});
