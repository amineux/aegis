/**
 * Keyboard shortcuts shown in the HUD overlay, README, and docs.
 * Keep this list in lockstep with the handlers in `src/app/page.tsx`.
 */
export interface Shortcut {
  key: string;
  desc: string;
}

export const SHORTCUTS: Shortcut[] = [
  { key: 'F', desc: 'Toggle fullscreen' },
  { key: 'S', desc: 'Share current view' },
  { key: 'L', desc: 'Toggle layer panel' },
  { key: 'M', desc: 'Toggle markets panel' },
  { key: 'I', desc: 'Toggle RECON toolkit' },
  { key: 'P', desc: 'Pause / resume live feeds' },
  { key: 'G', desc: 'Toggle globe / flat map' },
  { key: 'R', desc: 'Reset to global view' },
  { key: 'Ctrl+F', desc: 'Locate places and entities' },
  { key: '?', desc: 'Show this list' },
  { key: 'ESC', desc: 'Close panels / popups' },
];
