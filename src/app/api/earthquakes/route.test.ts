import { describe, it, expect } from 'vitest';
import { normalizeUsgs } from './route';

describe('normalizeUsgs', () => {
  it('maps a GeoJSON feature onto the HUD shape and drops unused props', () => {
    const [eq] = normalizeUsgs([{
      id: 'us7000',
      geometry: { coordinates: [-71.6, -33.4, 35] },
      properties: {
        mag: 6.2,
        place: 'near the coast of Chile',
        time: 1_700_000_000_000,
        url: 'https://earthquake.usgs.gov/us7000',
        tsunami: 0,
        type: 'earthquake',
        felt: 12,
        alert: 'green',
      },
    }]);
    expect(eq).toEqual({
      id: 'us7000',
      lat: -33.4,
      lng: -71.6,
      depth: 35,
      magnitude: 6.2,
      place: 'near the coast of Chile',
      time: 1_700_000_000_000,
      url: 'https://earthquake.usgs.gov/us7000',
      tsunami: 0,
      type: 'earthquake',
      felt: 12,
      alert: 'green',
    });
  });

  it('tolerates a feature with no geometry', () => {
    const [eq] = normalizeUsgs([{ id: 'x', properties: { mag: 2.5 } }]);
    expect(eq.lat).toBe(0);
    expect(eq.lng).toBe(0);
    expect(eq.magnitude).toBe(2.5);
  });
});
