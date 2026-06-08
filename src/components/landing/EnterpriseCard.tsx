import { type ReactNode } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

/** Stripe-grade obsidian card shell with charcoal gradient fill. */
export function EnterpriseCard({ children, className = '', contentClassName = 'p-4' }: Props) {
  return (
    <View className={`overflow-hidden rounded-xl border border-zinc-800/60 ${className}`}>
      <LinearGradient
        colors={['#0D0D10', '#141419']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className={contentClassName}
      >
        {children}
      </LinearGradient>
    </View>
  );
}
