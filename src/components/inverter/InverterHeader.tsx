import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/tokens/design';
import { Fonts } from '@/tokens/fonts';

import type { ConnectionStatus } from '@/types/dashboard';

type Props = {
  title: string;
  site: string;
  isLive: boolean;
  connectionStatus?: ConnectionStatus;
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  live: 'Live',
  offline: 'Offline',
  stale: 'Stale',
  fault: 'Fault',
};

export function InverterHeader({ title, site, isLive, connectionStatus }: Props) {
  const status = connectionStatus ?? (isLive ? 'live' : 'offline');
  const label = STATUS_LABEL[status];

  return (
    <View>
      <View style={styles.titleRow}>
        <View style={styles.accentBar} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.subtitleRow}>
        <Text style={styles.site}>{site?.trim() || 'Fleet site'}</Text>
        <Text style={styles.separator}>·</Text>
        <Text
          style={[
            styles.status,
            status === 'live' && styles.statusLive,
            status === 'stale' && styles.statusStale,
            status === 'fault' && styles.statusFault,
          ]}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accentBar: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textPrimary,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginLeft: 15,
  },
  site: {
    fontFamily: Fonts.light,
    fontSize: 13,
    color: Colors.textMuted,
  },
  separator: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  status: {
    fontFamily: Fonts.light,
    fontSize: 13,
    color: Colors.textMuted,
  },
  statusLive: {
    color: Colors.mint,
  },
  statusStale: {
    color: Colors.goldSoft,
  },
  statusFault: {
    color: '#E05555',
  },
});
