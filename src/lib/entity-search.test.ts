import { describe, it, expect } from 'vitest';
import { searchEntities } from './entity-search';

const data = {
  commercial_flights: [
    { callsign: 'UAL123', icao24: 'a1b2c3', registration: 'N123UA', model: 'B738', lat: 40.7, lng: -74.0 },
    { callsign: 'BAW9', icao24: '400123', registration: 'G-BNLY', model: 'B744', lat: 51.5, lng: -0.4 },
  ],
  earthquakes: [
    { id: 'us7000', magnitude: 6.2, place: 'near the coast of Chile', lat: -33.4, lng: -71.6 },
    { id: 'us7001', magnitude: 3.1, place: 'Oklahoma', lat: 35.5, lng: -97.5 },
  ],
  cameras: [
    { id: 'cam-1', name: 'Times Square North', city: 'New York', country: 'US', lat: 40.758, lng: -73.985 },
  ],
  maritime_chokepoints: [
    { name: 'Strait of Hormuz', traffic: '21M bpd', risk: 'HIGH', lat: 26.57, lng: 56.25 },
  ],
  maritime_ports: [
    { name: 'Singapore', country: 'SG', type: 'container', lat: 1.26, lng: 103.84 },
  ],
};

describe('searchEntities', () => {
  it('finds a flight by callsign', () => {
    const hits = searchEntities(data, 'UAL123');
    expect(hits[0]?.label).toBe('UAL123');
    expect(hits[0]?.kind).toBe('flight');
    expect(hits[0]?.lat).toBe(40.7);
  });

  it('finds a flight by ICAO hex', () => {
    expect(searchEntities(data, '400123')[0]?.label).toBe('BAW9');
  });

  it('finds a quake by place and ranks the Chile event for "chile"', () => {
    const hits = searchEntities(data, 'chile');
    expect(hits[0]?.kind).toBe('quake');
    expect(hits[0]?.label).toContain('M6.2');
  });

  it('finds a camera by name', () => {
    expect(searchEntities(data, 'times square')[0]?.kind).toBe('cctv');
  });

  it('finds a chokepoint', () => {
    expect(searchEntities(data, 'hormuz')[0]?.label).toBe('Strait of Hormuz');
  });

  it('returns nothing for short or empty queries', () => {
    expect(searchEntities(data, 'u')).toEqual([]);
    expect(searchEntities(data, '   ')).toEqual([]);
    expect(searchEntities(null, 'UAL')).toEqual([]);
  });

  it('skips rows without coordinates', () => {
    const broken = { commercial_flights: [{ callsign: 'NONE', lat: null }] };
    expect(searchEntities(broken, 'NONE')).toEqual([]);
  });

  it('caps the result list', () => {
    const many = {
      cameras: Array.from({ length: 40 }, (_, i) => ({
        id: `c${i}`, name: `Camera ${i}`, lat: 1, lng: 1,
      })),
    };
    expect(searchEntities(many, 'camera', 5)).toHaveLength(5);
  });
});
