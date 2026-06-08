/**
 * Active site selection — persists across navigation.
 */
import { create } from 'zustand';

export interface Site {
  id: string;
  name: string;
  company_id: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  device_count?: number;
}

interface SiteState {
  sites: Site[];
  activeSiteId: string | null;

  setSites: (sites: Site[]) => void;
  setActiveSite: (id: string) => void;
  activeSite: () => Site | null;
}

export const useSiteStore = create<SiteState>((set, get) => ({
  sites: [],
  activeSiteId: null,

  setSites: (sites) =>
    set((s) => ({
      sites,
      activeSiteId: s.activeSiteId ?? sites[0]?.id ?? null,
    })),

  setActiveSite: (id) => set({ activeSiteId: id }),

  activeSite: () => {
    const { sites, activeSiteId } = get();
    return sites.find((s) => s.id === activeSiteId) ?? sites[0] ?? null;
  },
}));

/** Use this in components — returns a stable reference from the sites array. */
export const selectActiveSite = (s: SiteState): Site | null => {
  if (s.sites.length === 0) return null;
  return s.sites.find((site) => site.id === s.activeSiteId) ?? s.sites[0] ?? null;
};
