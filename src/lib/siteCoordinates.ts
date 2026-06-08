const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  lagos: { latitude: 6.5244, longitude: 3.3792 },
  abuja: { latitude: 9.0765, longitude: 7.3986 },
  'port harcourt': { latitude: 4.8156, longitude: 7.0498 },
  kano: { latitude: 12.0022, longitude: 8.592 },
  ibadan: { latitude: 7.3775, longitude: 3.947 },
  enugu: { latitude: 6.5244, longitude: 7.5086 },
};

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function resolveSiteCoordinates(
  siteId: string,
  location?: string | null,
  city?: string | null,
  latitude?: number | null,
  longitude?: number | null,
): { latitude: number; longitude: number } | null {
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return { latitude, longitude };
  }

  const haystack = `${location ?? ''} ${city ?? ''}`.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (haystack.includes(key)) return coords;
  }

  const seed = hashSeed(siteId);
  return {
    latitude: 9.082 + ((seed % 100) - 50) * 0.018,
    longitude: 8.6753 + (((seed >> 8) % 100) - 50) * 0.018,
  };
}

export function buildSparklineTrend(siteId: string, loadKw: number): number[] {
  const seed = hashSeed(siteId);
  const base = Math.max(loadKw, 8);
  return Array.from({ length: 12 }, (_, i) => {
    const wave = Math.sin((seed + i) * 0.65) * 0.12 + Math.cos(i * 0.4) * 0.06 + 1;
    return Math.round(base * wave);
  });
}
