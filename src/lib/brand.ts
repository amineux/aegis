/**
 * Aegis — product identity.
 *
 * One place for the name, repo URL, and identifying User-Agent so docs,
 * metadata, and outbound requests cannot drift apart.
 */

export const PRODUCT_NAME = 'Aegis';
export const PRODUCT_SHORT = 'AEGIS';
export const PRODUCT_TAGLINE = 'Personal OSINT command center';
export const AUTHOR = 'amineux';
export const REPO_SLUG = 'amineux/aegis';
export const REPO_URL = 'https://github.com/amineux/aegis';
export const REPO_ISSUES_URL = `${REPO_URL}/issues`;
export const UPSTREAM_OSIRIS_URL = 'https://github.com/simplifaisoul/osiris';

/** Identifying User-Agent for OSM / public data endpoints. */
export const AEGIS_UA = `Aegis/1.0 (+${REPO_URL})`;
