import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { FleetSiteCard } from '@/components/fleet/FleetSiteCard';
import type { FleetSite } from '@/types/fleet';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

const baseSite: FleetSite = {
  id: 'LOS-01',
  name: 'Lagos Plant',
  city: 'Lagos',
  source: 'solar',
  load: 649,
  battery: 68,
  uptime: 99.2,
  status: 'live',
  inverterCount: 2,
  onlineInverters: 2,
  alerts: 0,
  latitude: 6.5244,
  longitude: 3.3792,
  sparklineTrend: [620, 640, 655, 649, 660, 645, 638, 652, 649, 661, 655, 649],
};

describe('FleetSiteCard', () => {
  it('renders live site snapshot', () => {
    let tree: renderer.ReactTestRendererJSON | renderer.ReactTestRendererJSON[] | null = null;
    act(() => {
      tree = renderer.create(<FleetSiteCard site={baseSite} onPress={jest.fn()} />).toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders offline site snapshot', () => {
    let tree: renderer.ReactTestRendererJSON | renderer.ReactTestRendererJSON[] | null = null;
    act(() => {
      tree = renderer
        .create(
          <FleetSiteCard
            site={{
              ...baseSite,
              status: 'offline',
              onlineInverters: 0,
              lastSeenAt: '2026-05-20T10:00:00.000Z',
              lastSeenLabel: '2 days ago',
            }}
            onPress={jest.fn()}
          />,
        )
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });

  it('renders stale site snapshot', () => {
    let tree: renderer.ReactTestRendererJSON | renderer.ReactTestRendererJSON[] | null = null;
    act(() => {
      tree = renderer
        .create(
          <FleetSiteCard
            site={{
              ...baseSite,
              status: 'degraded',
              lastSeenAt: '2026-05-22T08:00:00.000Z',
              lastSeenLabel: '12 minutes ago',
            }}
            onPress={jest.fn()}
          />,
        )
        .toJSON();
    });
    expect(tree).toMatchSnapshot();
  });
});
