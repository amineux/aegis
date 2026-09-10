'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, MapPin, Navigation, Building2, Globe2, Landmark, Radar, Plane, Camera, Ship, AlertTriangle } from 'lucide-react';
import { searchEntities, type EntityHit } from '@/lib/entity-search';

interface PlaceHit {
  label: string;
  detail: string;
  lat: number;
  lng: number;
  kind: string;
  zoom: number;
  source: 'place' | 'coords';
}

type Result =
  | { group: 'place'; hit: PlaceHit }
  | { group: 'entity'; hit: EntityHit };

interface SearchBarProps {
  onLocate: (lat: number, lng: number, zoom?: number) => void;
  alwaysExpanded?: boolean;
  /** Currently loaded map entities — searched locally, no extra request. */
  entities?: Record<string, unknown> | null;
  bias?: { lat: number; lng: number } | null;
}

function zoomForKind(kind: string): number {
  if (kind === 'address' || kind === 'poi') return 17;
  if (kind === 'street') return 16;
  if (kind === 'city') return 12;
  if (kind === 'region') return 7;
  if (kind === 'country') return 5;
  return 13;
}

function PlaceIcon({ kind }: { kind: string }) {
  if (kind === 'address' || kind === 'poi') return <Building2 className="w-3 h-3 text-[var(--cyan-primary)] flex-shrink-0" />;
  if (kind === 'street') return <Navigation className="w-3 h-3 text-[var(--alert-green)] flex-shrink-0" />;
  if (kind === 'country' || kind === 'region') return <Globe2 className="w-3 h-3 text-[var(--gold-primary)] flex-shrink-0" />;
  if (kind === 'city') return <Landmark className="w-3 h-3 text-[#FF9500] flex-shrink-0" />;
  return <MapPin className="w-3 h-3 text-[var(--gold-primary)] flex-shrink-0" />;
}

function EntityIcon({ kind }: { kind: string }) {
  if (kind === 'flight') return <Plane className="w-3 h-3 text-[var(--cyan-primary)] flex-shrink-0" />;
  if (kind === 'cctv') return <Camera className="w-3 h-3 text-[var(--gold-primary)] flex-shrink-0" />;
  if (kind === 'port' || kind === 'ship' || kind === 'choke') return <Ship className="w-3 h-3 text-[var(--alert-green)] flex-shrink-0" />;
  if (kind === 'quake' || kind === 'incident' || kind === 'weather') return <AlertTriangle className="w-3 h-3 text-[#FF5722] flex-shrink-0" />;
  return <Radar className="w-3 h-3 text-[var(--gold-primary)] flex-shrink-0" />;
}

function parseCoords(s: string): { lat: number; lng: number } | null {
  const m = s.trim().match(/^([+-]?\d+\.?\d*)[,\s]+([+-]?\d+\.?\d*)$/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };
  return null;
}

export default function SearchBar({ onLocate, alwaysExpanded = false, entities, bias }: SearchBarProps) {
  const [open, setOpen] = useState(alwaysExpanded);
  const [value, setValue] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 50);
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);

  useEffect(() => {
    if (!open || alwaysExpanded) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, alwaysExpanded]);

  const handleSearch = useCallback((q: string) => {
    setValue(q);
    setSelectedIdx(-1);
    setError(null);

    const coords = parseCoords(q);
    if (coords) {
      setResults([{
        group: 'place',
        hit: {
          label: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
          detail: 'Coordinates',
          ...coords,
          kind: 'coordinate',
          zoom: 15,
          source: 'coords',
        },
      }]);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();
    if (q.trim().length < 2) { setResults([]); return; }

    const local = searchEntities(entities, q, 6).map(hit => ({ group: 'entity' as const, hit }));

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const params = new URLSearchParams({ q: q.trim() });
        if (bias && Number.isFinite(bias.lat) && Number.isFinite(bias.lng)) {
          params.set('lat', String(bias.lat));
          params.set('lng', String(bias.lng));
        }
        const res = await fetch(`/api/geosearch?${params}`, { signal: ac.signal });
        if (!res.ok) throw new Error('search failed');
        const data = await res.json();
        const places: Result[] = (data.results || []).map((r: { name: string; context?: string; lat: number; lng: number; kind?: string }) => ({
          group: 'place' as const,
          hit: {
            label: r.name,
            detail: r.context || '',
            lat: r.lat,
            lng: r.lng,
            kind: r.kind || 'place',
            zoom: zoomForKind(r.kind || 'place'),
            source: 'place' as const,
          },
        }));
        setResults([...local, ...places]);
        if (!places.length && !local.length) setError('No matches');
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setResults(local);
        setError(local.length ? null : 'Search unavailable');
      } finally {
        setLoading(false);
      }
    }, 280);
  }, [entities, bias]);

  const locate = (lat: number, lng: number, zoom: number) => {
    onLocate(lat, lng, zoom);
    if (!alwaysExpanded) setOpen(false);
    setValue('');
    setResults([]);
    setSelectedIdx(-1);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (alwaysExpanded) {
        setValue(''); setResults([]); setError(null); inputRef.current?.blur();
      } else {
        setOpen(false); setValue(''); setResults([]); setError(null);
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const pick = selectedIdx >= 0 ? results[selectedIdx] : results[0];
      if (pick) locate(pick.hit.lat, pick.hit.lng, pick.hit.zoom);
    }
  };

  if (!open && !alwaysExpanded) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 glass-panel-sm px-3 py-2 text-[10px] font-mono tracking-[0.15em] text-[var(--text-muted)] hover:text-[var(--gold-primary)] hover:border-[var(--border-active)] transition-all hover:shadow-[0_0_12px_rgba(212,175,55,0.08)]"
      >
        <Search className="w-3 h-3" />
        CMD: LOCATE
      </button>
    );
  }

  const placeHits = results.filter(r => r.group === 'place');
  const entityHits = results.filter(r => r.group === 'entity');

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center gap-2 glass-panel px-3 py-2.5 !border-[var(--border-active)] transition-all"
        style={{ boxShadow: '0 0 20px rgba(212,175,55,0.05), inset 0 0 20px rgba(0,0,0,0.2)' }}
      >
        <Search className="w-3.5 h-3.5 text-[var(--gold-primary)] flex-shrink-0" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="PLACE, CALLSIGN, CAMERA, OR COORDINATES…"
          className="flex-1 bg-transparent text-[11px] text-[var(--text-primary)] font-mono tracking-wider outline-none placeholder:text-[var(--text-muted)]"
          autoComplete="off"
          spellCheck={false}
        />
        {loading && <div className="w-3 h-3 border border-[var(--gold-primary)] border-t-transparent rounded-full animate-spin" />}
        <span className="text-[9px] text-[var(--text-muted)] font-mono opacity-50 hidden md:inline">CTRL+F</span>
        {(value || !alwaysExpanded) && (
          <button onClick={() => {
            if (alwaysExpanded) { setValue(''); setResults([]); setError(null); }
            else { setOpen(false); setValue(''); setResults([]); setError(null); }
          }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {(results.length > 0 || error) && (
        <div
          className="absolute top-full left-0 right-0 mt-1 glass-panel overflow-hidden max-h-[360px] overflow-y-auto styled-scrollbar z-[9999]"
          style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 1px rgba(212,175,55,0.2)' }}
        >
          {error && (
            <div className="px-3 py-2 text-[10px] font-mono text-[var(--text-muted)] tracking-wider">{error}</div>
          )}
          {entityHits.length > 0 && (
            <div className="px-3 pt-2 pb-1 text-[9px] font-mono tracking-[0.2em] text-[var(--cyan-primary)]/70">ON THE MAP</div>
          )}
          {entityHits.map((r) => {
            const idx = results.indexOf(r);
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={r.hit.id}
                onClick={() => locate(r.hit.lat, r.hit.lng, r.hit.zoom)}
                onMouseEnter={() => setSelectedIdx(idx)}
                className={`w-full text-left px-3 py-2.5 transition-colors border-b border-[var(--border-secondary)] last:border-0 flex items-start gap-2.5 ${
                  isSelected ? 'bg-[rgba(212,175,55,0.08)]' : 'hover:bg-[var(--hover-accent)]'
                }`}
              >
                <div className="mt-0.5"><EntityIcon kind={r.hit.kind} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-[var(--text-primary)] font-mono truncate leading-tight">{r.hit.label}</div>
                  {r.hit.detail && <div className="text-[9px] text-[var(--text-muted)] font-mono truncate mt-0.5">{r.hit.detail}</div>}
                </div>
                <span className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-wider">{r.hit.kind}</span>
              </button>
            );
          })}
          {placeHits.length > 0 && (
            <div className="px-3 pt-2 pb-1 text-[9px] font-mono tracking-[0.2em] text-[var(--gold-primary)]/70">PLACES</div>
          )}
          {placeHits.map((r) => {
            const idx = results.indexOf(r);
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={`${r.hit.label}-${r.hit.lat}`}
                onClick={() => locate(r.hit.lat, r.hit.lng, r.hit.zoom)}
                onMouseEnter={() => setSelectedIdx(idx)}
                className={`w-full text-left px-3 py-2.5 transition-colors border-b border-[var(--border-secondary)] last:border-0 flex items-start gap-2.5 ${
                  isSelected ? 'bg-[rgba(212,175,55,0.08)]' : 'hover:bg-[var(--hover-accent)]'
                }`}
              >
                <div className="mt-0.5"><PlaceIcon kind={r.hit.kind} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-[var(--text-primary)] font-mono truncate leading-tight">{r.hit.label}</div>
                  {r.hit.detail && <div className="text-[9px] text-[var(--text-muted)] font-mono truncate mt-0.5">{r.hit.detail}</div>}
                </div>
                <span className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                  {r.hit.kind === 'coordinate' ? 'COORDS' : r.hit.kind}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
