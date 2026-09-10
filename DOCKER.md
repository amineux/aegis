# Self-hosting Aegis with Docker

Aegis ships as a self-contained Next.js standalone build — amineux’s
personal command center. Core feeds run without API keys. The repository
includes MIT-licensed work originally published as [OSIRIS](https://github.com/simplifaisoul/osiris).

> **TL;DR:** Core feeds run **without any API keys**. Aviation, satellites,
> fires, earthquakes, weather, news, CCTV, and CVEs use public sources. Keys
> only matter for the optional RECON scanner, Cloudflare Radar layers, deeper
> chain intel, or higher rate limits.

## 1. Docker Compose (recommended)

```bash
git clone https://github.com/amineux/aegis.git
cd aegis

# optional: keys / scanner / host port
cp .env.example .env

docker compose up -d --build
```

Open <http://localhost:3000>.

What the compose file does:

- **`aegis`** — builds locally from the `Dockerfile` so you run this clone.
- **`aegis-cache`** — nginx on host port `8080` for compressed API / tile
  caching. Optional for a first look; the UI on `3000` works without it.
- **`aegis-intel`** — ontology sidecar on host port `4000`.
- **`env_file: .env` (`required: false`)** — missing `.env` is fine; keyless
  feeds still start.
- **`ports: ${AEGIS_PORT:-3000}:3000`** — container listens on 3000; set
  `AEGIS_PORT` in `.env` to remap the host port.
- **`restart: unless-stopped`** — survives reboots.

There is no required external Docker network. A stock `docker compose up -d --build`
on a clean host is enough.

```bash
docker compose logs -f
docker compose up -d --build
docker compose down
```

### Plain `docker run` (UI only)

```bash
docker build -t aegis:latest .
docker run -d --name aegis -p 3000:3000 --env-file .env --restart unless-stopped aegis:latest
```

If `.env` does not exist yet, drop `--env-file .env`.

### Image details

Multi-stage build on `node:22-alpine`, runs as `nextjs` (uid 1001), serves
`node server.js` on port 3000. Build excludes `node_modules`, `.next`, and
`.git` via `.dockerignore`.

## 2. CasaOS

The compose file includes an `x-casaos:` block (title, description, icon, port
map, env descriptions) that plain Compose ignores.

1. Clone this repo somewhere persistent (for example `/DATA/AppData/aegis`).
2. CasaOS → **Install a customized app** → paste `docker-compose.yml`, or run
   `docker compose up -d --build` from the clone.
3. The UI is on host port `3000` (or `AEGIS_PORT`).

Icon and screenshots are served from this repo:

`https://raw.githubusercontent.com/amineux/aegis/master/public/casaos-icon.png`

CasaOS stores imported compose files under `/var/lib/casaos/apps/`, so a
relative `build:` context may not resolve there. If importing the YAML
directly, build first:

```bash
docker build -t aegis:latest /path/to/aegis
```

then point the service at `image: aegis:latest` instead of `build:`.

## 3. API keys and data sources

Copy `.env.example` to `.env` and fill in only what you need. The file itself
explains which variables the code actually reads.

### Read by the application

| Variable | Purpose |
|----------|---------|
| `SCANNER_URL` | RECON scanner backend (e.g. `http://scanner:7700`) |
| `SCANNER_KEY` | Shared secret; must equal the backend’s scanner key |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Radar “Internet Outages” / “Attack Origins” layers |
| `ETHERSCAN_API_KEY` | Richer ETH internals (RECON chain tab still works without it) |
| `HELIUS_API_KEY` | Parsed Solana transfers |

Without `SCANNER_URL` / `SCANNER_KEY`, RECON scan routes return `503` and the
rest of the dashboard works. Generate a key with `openssl rand -hex 32`.

### Optional / reserved (higher limits or future sources)

| Variable | Service |
|----------|---------|
| `FIRMS_API_KEY` | NASA FIRMS — [map key](https://firms.modaps.eosdis.nasa.gov/api/map_key/) |
| `OPENSKY_CLIENT_ID` / `OPENSKY_CLIENT_SECRET` | OpenSky OAuth2 (since Mar 2025) |
| `N2YO_API_KEY` | N2YO satellites |
| `AIS_API_KEY` | aisstream.io maritime WebSocket |

### Runtime

| Variable | Purpose | Default |
|----------|---------|---------|
| `AEGIS_TELEGRAM_CHANNELS` | Public Telegram usernames (no `@`) for the Telegram layer | curated set in `.env.example` |
| `AEGIS_PORT` | Host port Compose publishes | `3000` |

`.env` is gitignored. Only `.env.example` is committed.

### Keyless sources (no configuration)

Aviation → `adsb.lol` · Satellites → `celestrak.org` · Fires → NASA FIRMS open
CSV · Earthquakes → USGS · Weather → NASA EONET · Space weather → NOAA SWPC ·
CVEs → NVD · News → public RSS / HLS · CCTV → public traffic-authority feeds ·
BTC → `mempool.space` / `blockstream.info` · ETH → `eth.blockscout.com` ·
Sanctions → [OpenSanctions](https://www.opensanctions.org) (CC-BY 4.0) ·
Telegram → public `t.me/s/<channel>` previews.
