import { Activity, Wallet } from 'lucide-react-native';
import type { CommandCenterModule } from '@/screens/access/types';

/** Enterprise platform cards — mapped on the command center gateway. */
export const COMMAND_CENTER_MODULES: CommandCenterModule[] = [
  {
    id: 'monitoring',
    product: 'monitoring',
    title: 'Eso Inverter Monitoring',
    description: 'Real-time solar and generator intelligence for your fleet.',
    variant: 'monitoring',
    icon: Activity,
  },
  {
    id: 'esopay',
    product: 'esopay',
    title: 'Eso Pay Bills',
    description: 'Manage your premium wallet, Monnify settlements, and utility billing.',
    variant: 'esopay',
    icon: Wallet,
  },
];
