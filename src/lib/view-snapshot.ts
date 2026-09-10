/**
 * Shareable map view + a downloadable layer snapshot.
 *
 * The share URL used to encode the *cursor* instead of the camera, so a link
 * opened on a different machine landed wherever the mouse last idled. The
 * snapshot JSON is the same state as a file — useful when a URL is too thin.
 */

export interface MapView {
  latitude: number;
  longitude?: number;
  zoom: number;
}

export interface ViewCenter {
  lat: number;
  lng: number;
  zoom: number;
}

export interface ViewSnapshot {
  product: string;
  generated_at: string;
  view: ViewCenter;
  layers: string[];
  counts: Record<string, number>;
}

export function resolveViewCenter(
  mapView: MapView,
  mapCenter?: { lat: number; lng: number } | null,
): ViewCenter {
  const lat = mapCenter?.lat ?? mapView.latitude ?? 20;
  const lng = mapCenter?.lng ?? mapView.longitude ?? 0;
  return {
    lat: Number(lat),
    lng: Number(lng),
    zoom: Number(mapView.zoom ?? 2.5),
  };
}

export function activeLayerKeys(layers: Record<string, boolean>): string[] {
  return Object.entries(layers)
    .filter(([, on]) => on)
    .map(([k]) => k)
    .sort();
}

export function buildShareSearch(center: ViewCenter, layers: Record<string, boolean>): string {
  const params = new URLSearchParams();
  params.set('lat', center.lat.toFixed(4));
  params.set('lon', center.lng.toFixed(4));
  params.set('zoom', center.zoom.toFixed(2));
  const keys = activeLayerKeys(layers);
  if (keys.length) params.set('layers', keys.join(','));
  return params.toString();
}

export function parseShareSearch(search: string): {
  layers?: string[];
  flyTo?: ViewCenter;
} {
  const p = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const layers = p.get('layers');
  const lat = parseFloat(p.get('lat') || '');
  const lon = parseFloat(p.get('lon') || p.get('lng') || '');
  const zoom = parseFloat(p.get('zoom') || '');
  const flyTo = Number.isFinite(lat) && Number.isFinite(lon)
    ? { lat, lng: lon, zoom: Number.isFinite(zoom) ? zoom : 8 }
    : undefined;
  return {
    layers: layers ? layers.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    flyTo,
  };
}

export function countArrays(data: Record<string, unknown> | null | undefined): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!data) return counts;
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v) && v.length) counts[k] = v.length;
  }
  return counts;
}

export function buildViewSnapshot(
  product: string,
  center: ViewCenter,
  layers: Record<string, boolean>,
  data?: Record<string, unknown> | null,
  now = new Date(),
): ViewSnapshot {
  return {
    product,
    generated_at: now.toISOString(),
    view: {
      lat: Number(center.lat.toFixed(5)),
      lng: Number(center.lng.toFixed(5)),
      zoom: Number(center.zoom.toFixed(2)),
    },
    layers: activeLayerKeys(layers),
    counts: countArrays(data),
  };
}
