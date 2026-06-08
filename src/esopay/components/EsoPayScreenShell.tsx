import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { luxury } from '@/esopay/theme/luxury';

type Props = {
  children: ReactNode;
};

/** Forces Eso Pay void background regardless of parent theme (spec §1.7). */
export function EsoPayScreenShell({ children }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: luxury.bg,
  },
});
