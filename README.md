<div align="center">

# Osiris HQ

### Personal OSINT command center — by [amineux](https://github.com/amineux)

[![GitHub](https://img.shields.io/badge/amineux%2Fosiris--hq-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/amineux/osiris-hq)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MapLibre](https://img.shields.io/badge/MapLibre_GL-GPU_Rendered-396CB2?style=for-the-badge)](https://maplibre.org)
[![License](https://img.shields.io/badge/License-MIT-D4AF37?style=for-the-badge)](LICENSE)

**A self-hosted global intelligence dashboard.** Live flights, CCTV, earthquakes, wildfires, news, maritime chokepoints, and a RECON toolkit — on one GPU-accelerated map.

</div>

---

Osiris HQ is **amineux**’s personal standalone command center. It is based on the open-source [OSIRIS](https://github.com/simplifaisoul/osiris) project by [simplifaisoul](https://github.com/simplifaisoul) (MIT). Core map feeds run with **no API keys**.

## Quick start (Docker)

```bash
git clone https://github.com/amineux/osiris-hq.git
cd osiris-hq
cp .env.example .env          # optional — keys, scanner, host port
docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000).

The image is a multi-stage `node:22-alpine` standalone build (non-root). Compose also starts an optional nginx tile cache (`:8080`) and the intel sidecar (`:4000`). See [DOCKER.md](DOCKER.md) for ports, CasaOS metadata, and key notes.

```bash
docker compose logs -f        # follow logs
docker compose up -d --build  # rebuild after pulling
docker compose down           # stop
```

**Custom host port** — the container always listens on `3000`. Set `OSIRIS_PORT` in `.env` (for example `OSIRIS_PORT=3005`) without editing the compose file.

## Local development (optional)

Needs Node 20+ (npm or pnpm). No database.

```bash
git clone https://github.com/amineux/osiris-hq.git
cd osiris-hq
npm install                   # or: pnpm install
npm run dev                   # http://localhost:3000
```

```bash
npm run build && npm start
npm test
npm run lint
```

## What runs without keys

Aviation, satellites, fires, earthquakes, weather, news, CCTV, CVEs, crypto-wallet lookups, OFAC SDN search, and Telegram public-channel previews all use public, keyless sources. Copy [`.env.example`](.env.example) to `.env` only if you want extras.

| Variable | Needed for |
|----------|------------|
| `SCANNER_URL` / `SCANNER_KEY` | RECON scanner backend (leave empty → those routes return `503`) |
| `CLOUDFLARE_API_TOKEN` | Internet-outage / attack-origin map layers |
| `ETHERSCAN_API_KEY` / `HELIUS_API_KEY` | Deeper ETH / SOL wallet forensics |
| `FIRMS_API_KEY`, `OPENSKY_CLIENT_ID` / `SECRET`, `N2YO_API_KEY`, `AIS_API_KEY` | Higher rate limits / future sources — not required for the default feeds |
| `OSIRIS_PORT` | Host port published by Compose (default `3000`) |
| `OSIRIS_TELEGRAM_CHANNELS` | Override the default public Telegram channels |

Generate a scanner secret with `openssl rand -hex 32`. `.env` is gitignored.

## Capabilities

| Domain | What you see | Sources |
|--------|----------------|---------|
| **Aviation** | Commercial, private, military | OpenSky / ADS-B public feeds |
| **Maritime** | Ports and chokepoints | Static naval intel |
| **CCTV** | Public traffic / city cameras | TfL, WSDOT, Caltrans, and other agencies |
| **Seismic** | Real-time M2.5+ | USGS |
| **Fires** | Active hotspots | NASA FIRMS (open CSV) |
| **News** | 24/7 broadcaster streams | Public HLS / RSS |
| **Weather** | Severe events | NASA EONET |
| **Space** | Solar weather, satellites | NOAA SWPC, CelesTrak |
| **Cyber** | CVEs, optional RECON | NVD + optional scanner |
| **Conflict** | Active / tension zones | Curated OSINT markers |
| **Wallets** | BTC / ETH / SOL lookup + OFAC flag | mempool.space, Blockscout, public RPC |
| **Sanctions** | Person / org / vessel SDN search | OpenSanctions |
| **Telegram** | Geoparsed public-channel posts | `t.me/s/<channel>` previews |

The HUD exposes toggleable layers, a RECON toolkit (DNS, WHOIS, IP intel, certs, sanctions, optional port scan), live news, and region dossiers. Nothing in this fork requires a meme-coin wallet or a third-party “support” click-through.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen |
| `S` | Share current view |
| `L` | Toggle layer panel |
| `M` | Toggle markets panel |
| `I` | Toggle intel feed |
| `R` | Reset to global view |
| `?` | Show this list |
| `Escape` | Close panels |

## Stack

Next.js 16 (App Router) · TypeScript 5 · MapLibre GL · Framer Motion · Docker / Compose

## License

MIT — see [LICENSE](LICENSE).

Osiris HQ is a personal derivative of [OSIRIS](https://github.com/simplifaisoul/osiris) by [simplifaisoul](https://github.com/simplifaisoul). Upstream remains MIT; this repo keeps that license and adds amineux’s branding and hosting notes.

Use the tools only on systems you own or are authorized to monitor. See [SECURITY.md](SECURITY.md).
