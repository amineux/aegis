/**
 * Mission profiles — one-click layer presets for a personal command center.
 *
 * Region presets only move the camera. These flip the feeds that actually
 * matter for a job (disaster watch, aviation, conflict, …) so the operator
 * does not have to toggle eight layers by hand.
 */

export type LayerFlags = Record<string, boolean>;

export interface MissionFlyTo {
  lat: number;
  lng: number;
  zoom: number;
}

export interface MissionProfile {
  id: string;
  label: string;
  description: string;
  /** Layers forced on. Unlisted keys keep their current state unless `exclusive`. */
  enable: string[];
  /** Layers forced off. */
  disable?: string[];
  /**
   * When true, every layer not listed in `enable` is turned off.
   * Used for focused jobs (aviation, disaster) so the map does not stay noisy.
   */
  exclusive?: boolean;
  flyTo?: MissionFlyTo;
}

/** Fast-load defaults: a few always-on situational layers, aviation off. */
export const DEFAULT_LAYERS: LayerFlags = {
  flights: false,
  private: false,
  jets: false,
  military: false,
  maritime: true,
  satellites: false,
  sat_comms: false,
  sat_military: false,
  sat_navigation: false,
  sat_earth: false,
  sat_science: false,
  balloons: false,
  cctv: true,
  cctv_previews: true,
  live_news: true,
  earthquakes: true,
  fires: false,
  weather: false,
  radiation: false,
  infrastructure: false,
  global_incidents: true,
  war_alerts: false,
  day_night: true,
  cables: true,
  sdk_sea: true,
  sdk_air: true,
  sdk_naval: true,
  terrain_3d: false,
  terrain_elevation: false,
  malware: false,
  cyber_attacks: false,
  gdelt_events: false,
  cf_outages: false,
  cf_attacks: false,
};

export const MISSION_PROFILES: MissionProfile[] = [
  {
    id: 'baseline',
    label: 'BASELINE',
    description: 'Default command picture — maritime, CCTV, news, quakes',
    enable: Object.entries(DEFAULT_LAYERS).filter(([, on]) => on).map(([k]) => k),
    exclusive: true,
  },
  {
    id: 'disaster',
    label: 'DISASTER',
    description: 'Earthquakes, fires, severe weather, news, cameras',
    enable: ['earthquakes', 'fires', 'weather', 'live_news', 'cctv', 'cctv_previews', 'day_night'],
    exclusive: true,
  },
  {
    id: 'aviation',
    label: 'AVIATION',
    description: 'Commercial, private, jets, and military traffic',
    enable: ['flights', 'private', 'jets', 'military', 'day_night'],
    exclusive: true,
    flyTo: { lat: 40, lng: -20, zoom: 3 },
  },
  {
    id: 'conflict',
    label: 'CONFLICT',
    description: 'Incidents, GDELT, nuclear sites, military, maritime',
    enable: [
      'global_incidents', 'gdelt_events', 'infrastructure',
      'military', 'maritime', 'live_news', 'day_night',
    ],
    exclusive: true,
    flyTo: { lat: 35, lng: 40, zoom: 4 },
  },
  {
    id: 'maritime',
    label: 'MARITIME',
    description: 'Ports, chokepoints, cables, and sea lines',
    enable: ['maritime', 'cables', 'sdk_sea', 'day_night'],
    exclusive: true,
  },
  {
    id: 'space',
    label: 'SPACE',
    description: 'Full satellite catalogue and terminator',
    enable: [
      'satellites', 'sat_comms', 'sat_military', 'sat_navigation',
      'sat_earth', 'sat_science', 'day_night',
    ],
    exclusive: true,
  },
];

export function profileById(id: string): MissionProfile | undefined {
  return MISSION_PROFILES.find(p => p.id === id);
}

/**
 * Apply a profile to the current layer map.
 * Unknown keys on `current` are preserved so custom / future toggles survive.
 */
export function applyMissionProfile(current: LayerFlags, profile: MissionProfile): LayerFlags {
  const next: LayerFlags = { ...current };
  const enable = new Set(profile.enable);
  const disable = new Set(profile.disable ?? []);

  if (profile.exclusive) {
    for (const key of Object.keys(next)) {
      next[key] = enable.has(key);
    }
  }

  for (const key of enable) next[key] = true;
  for (const key of disable) next[key] = false;
  return next;
}
