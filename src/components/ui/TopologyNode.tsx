import { View, Text, StyleSheet, Animated } from 'react-native';
import { Building2, Network, Sun, type LucideIcon } from 'lucide-react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '@/tokens/design';
import { fonts } from '@/theme/tokens';
import { useNodePulse } from '@/hooks/useNodePulse';
import type { TopologyNode as TopologyNodeData } from '@/types/dashboard';

type Props = {
  node: TopologyNodeData;
  size?: number;
};

const ICONS: Record<string, LucideIcon> = {
  'sunny-outline': Sun,
  'git-network-outline': Network,
  'business-outline': Building2,
};

function nodeRole(node: TopologyNodeData): 'solar' | 'grid' | 'inverter' {
  if (node.iconName === 'sunny-outline') return 'solar';
  if (node.iconName === 'business-outline') return 'grid';
  return 'inverter';
}

function statusColors(node: TopologyNodeData) {
  const role = nodeRole(node);
  if (node.status === 'active') {
    if (role === 'solar') {
      return { border: Colors.goldBorder, bg: Colors.goldWhisper, icon: Colors.gold, dot: Colors.gold };
    }
    if (role === 'grid') {
      return { border: Colors.gridBorder, bg: Colors.gridWhisper, icon: Colors.grid, dot: Colors.grid };
    }
    return { border: Colors.mintBorder, bg: Colors.mintGlow, icon: Colors.mint, dot: Colors.mint };
  }
  if (node.status === 'warning') {
    return {
      border: Colors.warningBorder,
      bg: Colors.warningWhisper,
      icon: Colors.warning,
      dot: Colors.warning,
    };
  }
  return { border: Colors.borderSubtle, bg: Colors.surfaceRaised, icon: Colors.textMuted, dot: Colors.textMuted };
}

export function TopologyNode({ node, size = 48 }: Props) {
  const palette = statusColors(node);
  const Icon = ICONS[node.iconName] ?? Network;
  const pulse = useNodePulse(node.isCenter && node.status === 'active');
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.12] });

  const tileSize = node.isCenter ? size + 8 : size;

  return (
    <View style={[styles.wrap, { width: tileSize + 16 }]}>
      <View style={styles.tileStack}>
        {node.isCenter && node.status === 'active' ? (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                width: tileSize + 10,
                height: tileSize + 10,
                borderRadius: Radius.md + 2,
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
        ) : null}
        <View
          style={[
            styles.tile,
            node.isCenter ? styles.tileCenter : null,
            {
              width: tileSize,
              height: tileSize,
              borderColor: node.isCenter ? Colors.goldBorderStrong : palette.border,
              backgroundColor: node.isCenter ? Colors.goldWhisper : palette.bg,
            },
          ]}
        >
          <Icon size={node.isCenter ? 22 : 18} color={node.isCenter ? Colors.gold : palette.icon} strokeWidth={1.8} />
          <View style={[styles.statusDot, { backgroundColor: palette.dot }]} />
        </View>
      </View>
      <Text style={[styles.label, node.isCenter && styles.labelCenter]} numberOfLines={2}>
        {node.label}
      </Text>
      <Text style={styles.status}>{(node.flowLabel ?? node.status).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  tileStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  tile: {
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tileCenter: {
    ...Shadow.goldGlow,
  },
  statusDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: FontSize.label,
    fontFamily: fonts.medium,
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: 0.3,
  },
  labelCenter: {
    color: Colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: FontSize.caption,
  },
  status: {
    marginTop: 2,
    color: Colors.textMuted,
    fontSize: FontSize.micro,
    fontFamily: fonts.medium,
    letterSpacing: 0.8,
  },
});
