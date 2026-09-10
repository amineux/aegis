'use client';

import { Crosshair } from 'lucide-react';
import { MISSION_PROFILES, type MissionProfile } from '@/lib/mission-profiles';

interface MissionProfilesProps {
  activeId?: string | null;
  onApply: (profile: MissionProfile) => void;
  compact?: boolean;
}

export default function MissionProfiles({ activeId, onApply, compact = false }: MissionProfilesProps) {
  return (
    <div className={compact ? '' : 'glass-panel p-2.5 pointer-events-auto'}>
      <div className="flex items-center gap-2 mb-2">
        <Crosshair className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
        <span className="hud-text text-[11px] text-[var(--text-primary)] tracking-widest">MISSION PROFILES</span>
      </div>
      <div className={`grid gap-1 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {MISSION_PROFILES.map(p => {
          const on = activeId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              title={p.description}
              onClick={() => onApply(p)}
              className={`px-2 py-1.5 rounded text-[10px] font-mono tracking-wider border transition-all ${
                on
                  ? 'text-[var(--gold-primary)] border-[var(--gold-primary)]/40 bg-[var(--gold-primary)]/10'
                  : 'text-[var(--text-muted)] border-transparent hover:border-[var(--border-primary)] hover:text-[var(--gold-primary)] hover:bg-[var(--hover-accent)]'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
