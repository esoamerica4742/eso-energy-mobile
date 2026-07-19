import { Activity, Wallet, type LucideIcon } from 'lucide-react-native';
import type { AppProduct } from '@/lib/navigation/productRoutes';
import type { CommandCenterModule, PlatformCardVariant } from '@/screens/access/types';

type ModuleSeed = {
  id: string;
  product: AppProduct;
  title: string;
  description: string;
  variant: PlatformCardVariant;
  icon: LucideIcon;
  defaultMetadata: string;
};

const MODULE_SEEDS: ModuleSeed[] = [
  {
    id: 'monitoring',
    product: 'monitoring',
    title: 'ESO Inverter Monitoring',
    description: 'Real-time solar and generator intelligence for your fleet.',
    defaultMetadata: 'Fleet command · Live telemetry',
    variant: 'monitoring',
    icon: Activity,
  },
  {
    id: 'esopay',
    product: 'esopay',
    title: 'Eso Pay',
    description: 'Manage your premium wallet, Monnify settlements, and utility billing.',
    defaultMetadata: 'Premium wallet · Utility payments',
    variant: 'esopay',
    icon: Wallet,
  },
];

/** Static module list used by older access cards. */
export const COMMAND_CENTER_MODULES: CommandCenterModule[] = MODULE_SEEDS.map(
  ({ defaultMetadata: _meta, ...module }) => module,
);

/** Build access modules with live monitoring metadata when available. */
export function buildCommandCenterModules(input: {
  signedIn: boolean;
  siteCount: number;
  lastSyncLabel: string | null;
}): CommandCenterModule[] {
  return MODULE_SEEDS.map((seed) => {
    if (seed.product !== 'monitoring') {
      return {
        id: seed.id,
        product: seed.product,
        title: seed.title,
        description: seed.description,
        variant: seed.variant,
        icon: seed.icon,
      };
    }

    const metadata = input.signedIn
      ? [
          input.siteCount > 0
            ? `${input.siteCount} active site${input.siteCount === 1 ? '' : 's'}`
            : 'No sites yet',
          input.lastSyncLabel,
        ]
          .filter(Boolean)
          .join(' · ')
      : seed.defaultMetadata;

    return {
      id: seed.id,
      product: seed.product,
      title: seed.title,
      description: seed.description,
      metadata,
      variant: seed.variant,
      icon: seed.icon,
    };
  });
}
