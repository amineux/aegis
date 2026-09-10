/**
 * Search currently loaded map entities (flights, quakes, cameras, ports…).
 * Place geocoding stays on /api/geosearch; this is the in-memory half so
 * "MH17" or "M6.2" locates what is already on the glass.
 */

export interface EntityHit {
  id: string;
  label: string;
  detail: string;
  kind: string;
  lat: number;
  lng: number;
  zoom: number;
}

export type EntityBuckets = Record<string, unknown>;

interface Source {
  bucket: string;
  kind: string;
  zoom: number;
  pick: (row: Record<string, unknown>, i: number) => Omit<EntityHit, 'kind' | 'lat' | 'lng' | 'zoom'> & {
    lat?: number;
    lng?: number;
    zoom?: number;
  } | null;
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function str(...parts: unknown[]): string {
  return parts.filter(p => typeof p === 'string' && p.trim()).join(' · ');
}

const SOURCES: Source[] = [
  {
    bucket: 'commercial_flights',
    kind: 'flight',
    zoom: 8,
    pick: (f, i) => ({
      id: String(f.icao24 || f.callsign || `cf-${i}`),
      label: String(f.callsign || f.registration || 'Aircraft'),
      detail: str(f.model, f.registration, f.icao24),
    }),
  },
  {
    bucket: 'private_flights',
    kind: 'flight',
    zoom: 8,
    pick: (f, i) => ({
      id: String(f.icao24 || f.callsign || `pf-${i}`),
      label: String(f.callsign || f.registration || 'Private'),
      detail: str('Private', f.model, f.registration),
    }),
  },
  {
    bucket: 'private_jets',
    kind: 'flight',
    zoom: 8,
    pick: (f, i) => ({
      id: String(f.icao24 || f.callsign || `pj-${i}`),
      label: String(f.callsign || f.registration || 'Jet'),
      detail: str('Jet', f.model, f.registration),
    }),
  },
  {
    bucket: 'military_flights',
    kind: 'flight',
    zoom: 8,
    pick: (f, i) => ({
      id: String(f.icao24 || f.callsign || `mf-${i}`),
      label: String(f.callsign || f.registration || 'Military'),
      detail: str('Military', f.model, f.registration),
    }),
  },
  {
    bucket: 'earthquakes',
    kind: 'quake',
    zoom: 7,
    pick: (q, i) => ({
      id: String(q.id || `eq-${i}`),
      label: `M${Number(q.magnitude ?? 0).toFixed(1)} ${q.place || 'Earthquake'}`,
      detail: str(q.place, q.magnitude != null ? `M${q.magnitude}` : ''),
    }),
  },
  {
    bucket: 'cameras',
    kind: 'cctv',
    zoom: 14,
    pick: (c, i) => ({
      id: String(c.id || `cam-${i}`),
      label: String(c.name || 'Camera'),
      detail: str(c.city, c.country, c.source),
    }),
  },
  {
    bucket: 'maritime_ports',
    kind: 'port',
    zoom: 9,
    pick: (p, i) => ({
      id: String(p.name || `port-${i}`),
      label: String(p.name || 'Port'),
      detail: str(p.country, p.type, p.volume),
    }),
  },
  {
    bucket: 'maritime_chokepoints',
    kind: 'choke',
    zoom: 6,
    pick: (c, i) => ({
      id: String(c.name || `choke-${i}`),
      label: String(c.name || 'Chokepoint'),
      detail: str(c.traffic, c.risk),
    }),
  },
  {
    bucket: 'maritime_ships',
    kind: 'ship',
    zoom: 9,
    pick: (s, i) => ({
      id: String(s.mmsi || s.id || `ship-${i}`),
      label: String(s.name || s.mmsi || 'Vessel'),
      detail: str(s.type, s.destination, s.flag),
    }),
  },
  {
    bucket: 'live_feeds',
    kind: 'news',
    zoom: 8,
    pick: (f, i) => ({
      id: String(f.name || `news-${i}`),
      label: String(f.name || 'Feed'),
      detail: str(f.city, f.country, f.category),
    }),
  },
  {
    bucket: 'infrastructure',
    kind: 'nuclear',
    zoom: 10,
    pick: (n, i) => ({
      id: String(n.name || `nuc-${i}`),
      label: String(n.name || 'Facility'),
      detail: str(n.city, n.country, n.status),
    }),
  },
  {
    bucket: 'gdelt',
    kind: 'incident',
    zoom: 7,
    pick: (e, i) => ({
      id: String(e.name || `gdelt-${i}`),
      label: String(e.name || 'Incident'),
      detail: str(e.type, e.kind),
    }),
  },
  {
    bucket: 'weather_events',
    kind: 'weather',
    zoom: 7,
    pick: (w, i) => ({
      id: String(w.id || w.title || `wx-${i}`),
      label: String(w.title || w.type || 'Weather'),
      detail: str(w.type, w.severity, w.source),
    }),
  },
];

function haystack(hit: Pick<EntityHit, 'label' | 'detail' | 'id' | 'kind'>): string {
  return `${hit.label} ${hit.detail} ${hit.id} ${hit.kind}`.toLowerCase();
}

/**
 * Rank loaded entities against a query. Short queries (2+ chars) match
 * callsigns, place names, ICAO hex, and camera titles. Results are capped
 * so the locate bar stays usable with tens of thousands of flights.
 */
export function searchEntities(data: EntityBuckets | null | undefined, query: string, limit = 8): EntityHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2 || !data) return [];

  const hits: EntityHit[] = [];
  for (const src of SOURCES) {
    const rows = data[src.bucket];
    if (!Array.isArray(rows)) continue;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || typeof row !== 'object') continue;
      const rec = row as Record<string, unknown>;
      const picked = src.pick(rec, i);
      if (!picked) continue;
      const lat = num(picked.lat) ?? num(rec.lat);
      const lng = num(picked.lng) ?? num(rec.lng);
      if (lat == null || lng == null) continue;

      const hit: EntityHit = {
        id: `${src.kind}:${picked.id}`,
        label: picked.label,
        detail: picked.detail,
        kind: src.kind,
        lat,
        lng,
        zoom: picked.zoom ?? src.zoom,
      };
      if (!haystack(hit).includes(q)) continue;
      hits.push(hit);
      if (hits.length >= limit * 4) break;
    }
    if (hits.length >= limit * 4) break;
  }

  // Prefer exact / prefix matches (callsign "UAL123") over a substring in a city.
  hits.sort((a, b) => {
    const aLabel = a.label.toLowerCase();
    const bLabel = b.label.toLowerCase();
    const aExact = aLabel === q || a.id.toLowerCase().endsWith(`:${q}`) ? 0 : aLabel.startsWith(q) ? 1 : 2;
    const bExact = bLabel === q || b.id.toLowerCase().endsWith(`:${q}`) ? 0 : bLabel.startsWith(q) ? 1 : 2;
    return aExact - bExact;
  });

  return hits.slice(0, limit);
}
