import { useEffect, useRef, useState } from 'react';
import {
  createInitialGridSimKw,
  nextGridSimKw,
  type GridSimKw,
} from '@/lib/monitoring/gridIntelligenceSimulation';

const TICK_MS = 2_000;
const GRID_LABEL_FLIP_EVERY = 4;

export function useGridIntelligenceSimulation(enabled: boolean): GridSimKw {
  const [kw, setKw] = useState<GridSimKw>(createInitialGridSimKw);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setKw(createInitialGridSimKw());
      tickRef.current = 0;
      return;
    }

    const id = setInterval(() => {
      tickRef.current += 1;
      setKw((prev) => {
        const stepped = nextGridSimKw(prev);
        if (tickRef.current % GRID_LABEL_FLIP_EVERY === 0) {
          return { ...stepped, gridBalanced: !prev.gridBalanced };
        }
        return stepped;
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [enabled]);

  return kw;
}
