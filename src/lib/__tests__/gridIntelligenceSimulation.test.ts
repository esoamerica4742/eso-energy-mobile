import { createDashboardShell } from '@/lib/monitoring/dashboardShell';
import {
  applyGridIntelligenceDemoOverlay,
  buildSimulatedTopologyNodes,
  createInitialGridSimKw,
  formatTopologyPowerKw,
  shouldRunGridIntelligenceSimulation,
} from '@/lib/monitoring/gridIntelligenceSimulation';

describe('gridIntelligenceSimulation', () => {
  it('enables simulation when dashboard is offline', () => {
    const shell = createDashboardShell();
    expect(shouldRunGridIntelligenceSimulation(shell)).toBe(true);
  });

  it('builds active topology labels and kW readouts', () => {
    const nodes = buildSimulatedTopologyNodes(createInitialGridSimKw());
    expect(nodes[0].flowLabel).toBe('GENERATING');
    expect(nodes[0].powerKw).toBe(42.5);
    expect(nodes[1].flowLabel).toBe('CONVERTING');
    expect(nodes[2].flowLabel).toBe('FEEDING');
    expect(formatTopologyPowerKw(38.2)).toBe('38.2 kW');
  });

  it('overlays live demo health and savings metrics', () => {
    const shell = createDashboardShell();
    const overlay = applyGridIntelligenceDemoOverlay(shell, createInitialGridSimKw());
    expect(overlay.health.status).toBe('live');
    expect(overlay.nodes.every((n) => n.status === 'active')).toBe(true);
    expect(overlay.kpi.primaryValue).toBeGreaterThan(0);
    expect(overlay.battery.soc).toBeGreaterThan(0);
  });
});
