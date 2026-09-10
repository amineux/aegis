import type { Metadata } from 'next';
import DocsClient from './DocsClient';
import { ENDPOINT_COUNT } from './apiCatalog';

export const metadata: Metadata = {
  title: 'Documentation & API Reference',
  description: `Osiris HQ docs — Docker-first self-hosting, interface reference, and the complete API reference for all ${ENDPOINT_COUNT} endpoints covering aviation, maritime, seismic, conflict, cyber, and OSINT feeds. No API key required for core feeds.`,
  alternates: { canonical: '/docs' },
  openGraph: {
    title: 'Osiris HQ — Documentation & API Reference',
    description: `Self-hosting guide, interface reference, and the complete API reference for all ${ENDPOINT_COUNT} Osiris HQ endpoints.`,
    url: '/docs',
    type: 'article',
  },
};

export default function DocsPage() {
  return <DocsClient />;
}
