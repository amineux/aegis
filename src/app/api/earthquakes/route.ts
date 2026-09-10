import { NextResponse } from 'next/server';
import { httpJson } from '@/lib/httpJson';
import { cachedJson } from '@/lib/sourceCache';

/**
 * Osiris Command — Earthquake Data API
 * Real-time seismic events from USGS (last 24h, M2.5+). No API key required.
 *
 * The HUD used to hit USGS twice from the browser (map + ticker). This route
 * is the single hop: in-memory TTL + inflight coalescing so a cold start and
 * the status bar share one upstream download.
 */

const USGS = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
const TTL_MS = 2 * 60 * 1000;

interface UsgsFeature {
  id?: string;
  geometry?: { coordinates?: number[] };
  properties?: {
    mag?: number;
    place?: string;
    time?: number;
    url?: string;
    tsunami?: number;
    type?: string;
    felt?: number;
    alert?: string;
  };
}

export interface Earthquake {
  id: string;
  lat: number;
  lng: number;
  depth: number;
  magnitude: number;
  place: string;
  time: number;
  url?: string;
  tsunami?: number;
  type?: string;
  felt?: number | null;
  alert?: string | null;
}

export function normalizeUsgs(features: UsgsFeature[]): Earthquake[] {
  return features.map(f => {
    const coords = f.geometry?.coordinates || [0, 0, 0];
    const props = f.properties || {};
    return {
      id: f.id || `${coords[1]},${coords[0]},${props.time || 0}`,
      lat: coords[1] ?? 0,
      lng: coords[0] ?? 0,
      depth: coords[2] ?? 0,
      magnitude: props.mag ?? 0,
      place: props.place || '',
      time: props.time || 0,
      url: props.url,
      tsunami: props.tsunami,
      type: props.type,
      felt: props.felt ?? null,
      alert: props.alert ?? null,
    };
  });
}

export async function GET() {
  try {
    const payload = await cachedJson(
      'earthquakes:usgs:2.5_day',
      async () => {
        const data = await httpJson<{ features?: UsgsFeature[] }>(USGS, { timeoutMs: 10000 });
        const earthquakes = normalizeUsgs(data.features || []);
        return {
          earthquakes,
          total: earthquakes.length,
          timestamp: new Date().toISOString(),
        };
      },
      TTL_MS,
      v => !v.earthquakes.length,
    )();

    if (!payload) {
      return NextResponse.json({ earthquakes: [], error: 'USGS unavailable' }, { status: 502 });
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[OSIRIS] Earthquake fetch error:', error);
    return NextResponse.json({ earthquakes: [], error: 'Failed to fetch earthquake data' }, { status: 500 });
  }
}
