import { memo, useMemo } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  ChartBar,
  ChevronDown,
  GraduationCap,
  Phone,
  Radio,
  Target,
  Tv,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import type { UtilityProvider } from '@/esopay/api/types';
import {
  BILLER_GROUP_META,
  BILLER_GROUP_ORDER,
  getBillerCardLabel,
  isOfflineStaticProvider,
  type BillerDisplayGroup,
  groupBillers,
} from '@/esopay/data/utilities';
import { getBillerBrandStyle } from '@/esopay/data/billerBrands';
import { fonts } from '@/esopay/theme/typography';
import { spacing } from '@/esopay/theme/spacing';

const GOLD = '#C9A84C';
const GOLD_DIM = '#8A6E2F';
const SURFACE = '#0D0F17';
const SURFACE2 = '#12151F';
const COL_GAP = 12;
const CARD_H = 88;

const FOLDER_THEME: Record<
  BillerDisplayGroup,
  { Icon: LucideIcon; accent: string; gradient: [string, string] }
> = {
  electricity: { Icon: Zap, accent: GOLD, gradient: [GOLD, GOLD_DIM] },
  airtime: { Icon: Phone, accent: '#10B981', gradient: ['#10B981', '#047857'] },
  data: { Icon: ChartBar, accent: '#38BDF8', gradient: ['#38BDF8', '#0369A1'] },
  cable_tv: { Icon: Tv, accent: '#A855F7', gradient: ['#A855F7', '#6B21A8'] },
  education: { Icon: GraduationCap, accent: '#FB923C', gradient: ['#FB923C', '#C2410C'] },
  betting: { Icon: Target, accent: '#F43F5E', gradient: ['#F43F5E', '#BE123C'] },
  others: { Icon: Radio, accent: '#94A3B8', gradient: ['#64748B', '#334155'] },
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  providers: UtilityProvider[];
  expandedFolder: BillerDisplayGroup | null;
  onExpandFolder: (folder: BillerDisplayGroup | null) => void;
  onSelect: (provider: UtilityProvider) => void;
  offline?: boolean;
};

function chunkPairs<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return rows;
}

const BillerTile = memo(function BillerTile({
  provider,
  width,
  offline,
  onPress,
}: {
  provider: UtilityProvider;
  width: number;
  offline: boolean;
  onPress: () => void;
}) {
  const disabled = offline && isOfflineStaticProvider(provider);
  const label = getBillerCardLabel(provider.name);
  const brand = getBillerBrandStyle(provider);

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.billerTile,
        { width, opacity: disabled ? 0.45 : 1 },
        pressed && !disabled && styles.billerTilePressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={provider.name}
      accessibilityState={{ disabled }}
    >
      <View style={[styles.billerLogo, { backgroundColor: brand.logoBg }]}>
        <Text style={[styles.billerLogoText, { color: brand.logoFg }]}>{brand.logoText}</Text>
      </View>
      <Text style={styles.billerName} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
});

const CategoryFolder = memo(function CategoryFolder({
  groupKey,
  providers,
  expanded,
  cardWidth,
  offline,
  onToggle,
  onSelect,
}: {
  groupKey: BillerDisplayGroup;
  providers: UtilityProvider[];
  expanded: boolean;
  cardWidth: number;
  offline: boolean;
  onToggle: () => void;
  onSelect: (provider: UtilityProvider) => void;
}) {
  const meta = BILLER_GROUP_META[groupKey];
  const theme = FOLDER_THEME[groupKey];
  const { Icon } = theme;
  const rows = useMemo(() => chunkPairs(providers), [providers]);

  return (
    <View style={[styles.folder, expanded && styles.folderExpanded]}>
      <Pressable
        onPress={() => {
          void Haptics.selectionAsync();
          onToggle();
        }}
        style={({ pressed }) => [styles.folderHeader, pressed && styles.folderHeaderPressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <LinearGradient colors={theme.gradient} style={styles.folderOrb}>
          <Icon size={18} color="#FFFFFF" strokeWidth={2.2} />
        </LinearGradient>

        <View style={styles.folderCopy}>
          <Text style={styles.folderTitle}>{meta.title}</Text>
          <Text style={styles.folderHint} numberOfLines={1}>
            {meta.hint} · {providers.length} biller{providers.length === 1 ? '' : 's'}
          </Text>
        </View>

        <View style={styles.folderRight}>
          <Text style={[styles.countBadge, { color: theme.accent, borderColor: `${theme.accent}55` }]}>
            {providers.length}
          </Text>
          <ChevronDown
            size={18}
            color={GOLD}
            strokeWidth={2}
            style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.folderBody}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((provider) => (
                <BillerTile
                  key={provider.id}
                  provider={provider}
                  width={cardWidth}
                  offline={offline}
                  onPress={() => onSelect(provider)}
                />
              ))}
              {row.length === 1 ? <View style={{ width: cardWidth }} /> : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
});

export const BillerFolderCatalog = memo(function BillerFolderCatalog({
  providers,
  expandedFolder,
  onExpandFolder,
  onSelect,
  offline = false,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - spacing.lg * 2 - COL_GAP) / 2;
  const grouped = useMemo(() => groupBillers(providers), [providers]);

  const visibleGroups = BILLER_GROUP_ORDER.filter((key) => grouped[key].length > 0);

  const toggle = (key: BillerDisplayGroup) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onExpandFolder(expandedFolder === key ? null : key);
  };

  return (
    <View style={styles.wrap}>
      {offline ? (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            Offline catalog — connect to pay. Live billers load when Monnify is reachable.
          </Text>
        </View>
      ) : null}

      {visibleGroups.map((groupKey) => (
        <CategoryFolder
          key={groupKey}
          groupKey={groupKey}
          providers={grouped[groupKey]}
          expanded={expandedFolder === groupKey}
          cardWidth={cardWidth}
          offline={offline}
          onToggle={() => toggle(groupKey)}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
});

export function BillerCatalogEmpty({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={emptyStyles.wrap}>
      <Text style={emptyStyles.text}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={emptyStyles.retryBtn}>
          <Text style={emptyStyles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** @deprecated Use BillerFolderCatalog */
export const BillerCatalog = BillerFolderCatalog;

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  offlineBanner: {
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  offlineText: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 18,
    color: '#C9A84C',
  },
  folder: {
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.12)',
    overflow: 'hidden',
  },
  folderExpanded: {
    borderColor: 'rgba(201,168,76,0.35)',
    backgroundColor: SURFACE2,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.md,
  },
  folderHeaderPressed: {
    backgroundColor: 'rgba(201,168,76,0.06)',
  },
  folderOrb: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderCopy: {
    flex: 1,
    gap: 2,
  },
  folderTitle: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    color: '#F4F4F6',
  },
  folderHint: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: '#7A7F96',
  },
  folderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    minWidth: 24,
    textAlign: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  folderBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: COL_GAP,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,168,76,0.08)',
  },
  row: {
    flexDirection: 'row',
    gap: COL_GAP,
  },
  billerTile: {
    height: CARD_H,
    borderRadius: 14,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  billerTilePressed: {
    backgroundColor: 'rgba(201,168,76,0.1)',
    transform: [{ scale: 0.97 }],
  },
  billerLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billerLogoText: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  billerName: {
    fontFamily: fonts.uiMedium,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.4,
    color: '#F4F4F6',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

const emptyStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GOLD,
  },
  retryText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: GOLD,
  },
});
