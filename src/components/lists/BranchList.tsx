import { View, StyleSheet } from 'react-native';
import type { BranchRow as Branch } from '@/lib/aura';
import { BranchRow } from './BranchRow';
import { spacing } from '@/theme/tokens';

type Props = { branches: Branch[] };

export function BranchList({ branches }: Props) {
  return (
    <View style={styles.wrap}>
      {branches.map((b, index) => (
        <BranchRow key={b.id} branch={b} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xl,
  },
});
