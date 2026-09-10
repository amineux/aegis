import { describe, it, expect } from 'vitest';
import {
  DEFAULT_LAYERS,
  MISSION_PROFILES,
  applyMissionProfile,
  profileById,
} from './mission-profiles';

describe('mission profiles', () => {
  it('ships the focused jobs the HUD advertises', () => {
    expect(MISSION_PROFILES.map(p => p.id)).toEqual([
      'baseline', 'disaster', 'aviation', 'conflict', 'maritime', 'space',
    ]);
  });

  it('looks up a profile by id', () => {
    expect(profileById('disaster')?.label).toBe('DISASTER');
    expect(profileById('nope')).toBeUndefined();
  });

  it('baseline restores the default load set and drops extras', () => {
    const noisy = { ...DEFAULT_LAYERS, flights: true, malware: true, fires: true };
    const next = applyMissionProfile(noisy, profileById('baseline')!);
    expect(next).toEqual(DEFAULT_LAYERS);
  });

  it('disaster watch turns hazard layers on and aviation off', () => {
    const next = applyMissionProfile(DEFAULT_LAYERS, profileById('disaster')!);
    expect(next.earthquakes).toBe(true);
    expect(next.fires).toBe(true);
    expect(next.weather).toBe(true);
    expect(next.live_news).toBe(true);
    expect(next.cctv).toBe(true);
    expect(next.flights).toBe(false);
    expect(next.maritime).toBe(false);
  });

  it('aviation is exclusive — only air traffic and the terminator stay on', () => {
    const next = applyMissionProfile(DEFAULT_LAYERS, profileById('aviation')!);
    expect(next.flights && next.private && next.jets && next.military).toBe(true);
    expect(next.cctv).toBe(false);
    expect(next.earthquakes).toBe(false);
    expect(next.day_night).toBe(true);
  });

  it('keeps unknown custom keys when exclusive so future toggles survive', () => {
    const current = { ...DEFAULT_LAYERS, custom_layer: true };
    const next = applyMissionProfile(current, profileById('maritime')!);
    expect(next.custom_layer).toBe(false);
    expect(next.maritime).toBe(true);
    expect(next.cables).toBe(true);
  });

  it('non-exclusive apply only flips listed keys', () => {
    const profile = {
      id: 'add-fires',
      label: 'ADD',
      description: '',
      enable: ['fires'],
      disable: ['cctv'],
    };
    const next = applyMissionProfile(DEFAULT_LAYERS, profile);
    expect(next.fires).toBe(true);
    expect(next.cctv).toBe(false);
    expect(next.maritime).toBe(true);
    expect(next.earthquakes).toBe(true);
  });
});
