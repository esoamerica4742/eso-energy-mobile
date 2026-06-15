import { Pulse, Wallet } from 'phosphor-react-native';
import type { CommandCenterModule } from '@/screens/access/types';

/** Enterprise platform cards — mapped on the command center gateway. */
export const COMMAND_CENTER_MODULES: CommandCenterModule[] = [
  {
    id: 'monitoring',
    product: 'monitoring',
    title: 'ESO Inverter Monitoring',
    description: 'Real-time solar and generator intelligence for your fleet.',
    metadata: '12 active sites · Last sync 2 min ago',
    variant: 'monitoring',
    icon: Pulse,
  },
  {
    id: 'esopay',
    product: 'esopay',
    title: 'ESO Pay Bills',
    description: 'Manage your premium wallet, Monnify settlements, and utility billing.',
    metadata: 'Premium wallet · Utility payments',
    variant: 'esopay',
    icon: Wallet,
  },
];
