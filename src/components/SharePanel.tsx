'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, Link2, X, Globe, MapPin, Download } from 'lucide-react';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '@/lib/brand';
import { downloadFile } from '@/lib/aoi-export';
import {
  resolveViewCenter,
  buildShareSearch,
  buildViewSnapshot,
  type MapView,
} from '@/lib/view-snapshot';

interface SharePanelProps {
  mapView: MapView;
  activeLayers: Record<string, boolean>;
  mapCenter?: { lat: number; lng: number } | null;
  data?: Record<string, unknown> | null;
  compact?: boolean;
}

export default function SharePanel({ mapView, activeLayers, mapCenter, data, compact }: SharePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const center = useMemo(() => resolveViewCenter(mapView, mapCenter), [mapView, mapCenter]);

  const generateShareUrl = useCallback(() => {
    const q = buildShareSearch(center, activeLayers);
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${base}/?${q}`;
  }, [center, activeLayers]);

  const copyToClipboard = useCallback(async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generateShareUrl]);

  const exportSnapshot = useCallback(() => {
    const snap = buildViewSnapshot(PRODUCT_NAME, center, activeLayers, data);
    downloadFile(
      `osiris-command-view-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(snap, null, 2),
      'application/json',
    );
  }, [center, activeLayers, data]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 's' && !e.ctrlKey && !e.metaKey && !['INPUT', 'TEXTAREA'].includes((e.target as Element)?.tagName)) {
        setIsOpen(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const shareText = `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`;
  const layerCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={compact
          ? 'glass-panel w-8 h-8 flex items-center justify-center pointer-events-auto hover:border-[var(--gold-primary)] transition-colors'
          : 'w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors'}
        title="Share view (S)"
      >
        <Share2 className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-12 right-0 w-72 glass-panel p-4 pointer-events-auto osiris-glow z-[300]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[var(--gold-primary)]" />
                <span className="hud-text text-[11px] text-[var(--text-primary)]">SHARE VIEW</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="mb-3 p-2 rounded-lg bg-[var(--bg-void)] border border-[var(--border-primary)]">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-2.5 h-2.5 text-[var(--gold-primary)]" />
                <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-widest">CAMERA</span>
              </div>
              <div className="text-[9px] font-mono text-[var(--text-secondary)]">
                {center.lat.toFixed(4)}°, {center.lng.toFixed(4)}° · Zoom {center.zoom.toFixed(1)}
              </div>
              <div className="text-[9px] font-mono text-[var(--text-muted)] mt-1">
                {layerCount} layers active
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Link2 className="w-2.5 h-2.5 text-[var(--text-muted)]" />
                <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-widest">SHAREABLE LINK</span>
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1 p-1.5 rounded bg-[var(--bg-void)] border border-[var(--border-primary)] text-[9px] font-mono text-[var(--gold-primary)] truncate">
                  {generateShareUrl()}
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`px-3 py-1.5 rounded text-[9px] font-mono tracking-widest transition-all ${copied ? 'bg-[var(--alert-green)]/20 text-[var(--alert-green)] border border-[var(--alert-green)]/30' : 'bg-[var(--gold-primary)]/10 text-[var(--gold-primary)] border border-[var(--gold-primary)]/30 hover:bg-[var(--gold-primary)]/20'}`}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <button
              onClick={exportSnapshot}
              className="w-full mb-3 flex items-center justify-center gap-1.5 py-1.5 rounded text-[9px] font-mono tracking-wider text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--gold-primary)]/40 hover:text-[var(--gold-primary)] transition-colors"
            >
              <Download className="w-3 h-3" />
              EXPORT SNAPSHOT JSON
            </button>

            <div className="flex gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(generateShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-1.5 rounded text-[9px] font-mono tracking-wider text-[var(--text-muted)] border border-[var(--border-primary)] hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-colors"
              >
                𝕏 POST
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(generateShareUrl())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-1.5 rounded text-[9px] font-mono tracking-wider text-[var(--text-muted)] border border-[var(--border-primary)] hover:border-[#0A66C2] hover:text-[#0A66C2] transition-colors"
              >
                IN SHARE
              </a>
              <a
                href={`https://reddit.com/submit?url=${encodeURIComponent(generateShareUrl())}&title=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-1.5 rounded text-[9px] font-mono tracking-wider text-[var(--text-muted)] border border-[var(--border-primary)] hover:border-[#FF4500] hover:text-[#FF4500] transition-colors"
              >
                REDDIT
              </a>
            </div>

            <div className="mt-3 text-center text-[9px] font-mono text-[var(--text-muted)] tracking-widest">
              PRESS [S] · LINK PRESERVES CAMERA + LAYERS
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
