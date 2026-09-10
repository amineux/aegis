import { describe, it, expect } from 'vitest';
import {
  resolveViewCenter,
  buildShareSearch,
  parseShareSearch,
  buildViewSnapshot,
  activeLayerKeys,
} from './view-snapshot';

describe('resolveViewCenter', () => {
  it('prefers the map camera over a stale cursor', () => {
    expect(resolveViewCenter({ latitude: 20, zoom: 3 }, { lat: 48.85, lng: 2.35 })).toEqual({
      lat: 48.85, lng: 2.35, zoom: 3,
    });
  });

  it('falls back to mapView longitude when no center is known', () => {
    expect(resolveViewCenter({ latitude: 35, longitude: 40, zoom: 4 })).toEqual({
      lat: 35, lng: 40, zoom: 4,
    });
  });
});

describe('share search params', () => {
  it('round-trips lat/lon/zoom and active layers', () => {
    const q = buildShareSearch({ lat: 48.8566, lng: 2.3522, zoom: 6.5 }, {
      flights: true, cctv: false, earthquakes: true,
    });
    const parsed = parseShareSearch(q);
    expect(parsed.flyTo).toEqual({ lat: 48.8566, lng: 2.3522, zoom: 6.5 });
    expect(parsed.layers).toEqual(['earthquakes', 'flights']);
  });

  it('accepts lng as an alias for lon', () => {
    expect(parseShareSearch('lat=10&lng=20&zoom=5').flyTo).toEqual({ lat: 10, lng: 20, zoom: 5 });
  });

  it('omits flyTo when coordinates are missing', () => {
    expect(parseShareSearch('layers=cctv').flyTo).toBeUndefined();
    expect(parseShareSearch('layers=cctv').layers).toEqual(['cctv']);
  });
});

describe('buildViewSnapshot', () => {
  it('records the camera, sorted layers, and non-empty counts', () => {
    const snap = buildViewSnapshot(
      'Aegis',
      { lat: 1.234567, lng: 2.345678, zoom: 8.125 },
      { flights: true, cctv: true, fires: false },
      { commercial_flights: [{}, {}], cameras: [], earthquakes: [1] },
      new Date('2026-09-10T12:00:00Z'),
    );
    expect(snap.product).toBe('Aegis');
    expect(snap.generated_at).toBe('2026-09-10T12:00:00.000Z');
    expect(snap.view).toEqual({ lat: 1.23457, lng: 2.34568, zoom: 8.13 });
    expect(snap.layers).toEqual(['cctv', 'flights']);
    expect(snap.counts).toEqual({ commercial_flights: 2, earthquakes: 1 });
  });

  it('sorts active layer keys stably', () => {
    expect(activeLayerKeys({ z: true, a: true, m: false })).toEqual(['a', 'z']);
  });
});
