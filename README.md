# mxvoice-download

Minimal download redirect service for [Mx. Voice](https://mxvoice.app). Redirects platform-specific download URLs to the latest GitHub release assets from [minter/mxvoice-electron](https://github.com/minter/mxvoice-electron).

## Routes

| Path | Redirects to |
|---|---|
| `/download/dmg` | Latest `.dmg` (macOS) |
| `/download/mac` | Alias for `/download/dmg` |
| `/download/exe` | Latest `.exe` (Windows) |
| `/download/windows` | Alias for `/download/exe` |

All other paths return 404. Release data is cached for 15 minutes.

## Local development

```bash
node server.js
# Listening on http://localhost:3000
```

## Deploy with Docker Compose

```bash
cp .env.example .env    # optional: add GITHUB_TOKEN for higher rate limits
docker compose up -d
```

## Production setup (Ubuntu 24.04)

See the `examples/` directory for:

- **`nginx.conf`** — Nginx reverse proxy config for `download.mxvoice.app`
- **`mxvoice-download.service`** — systemd service for Docker Compose

### Quick start

1. Clone this repo to `/home/rails/mxvoice-download` on your server
2. Copy and edit the env file:
   ```bash
   cp .env.example .env
   ```
3. Start the service:
   ```bash
   sudo cp examples/mxvoice-download.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now mxvoice-download
   ```
4. Set up Nginx:
   ```bash
   sudo cp examples/nginx.conf /etc/nginx/sites-available/download.mxvoice.app
   sudo ln -s /etc/nginx/sites-available/download.mxvoice.app /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
5. Add SSL with certbot:
   ```bash
   sudo certbot --nginx -d download.mxvoice.app
   ```
6. Point the `download.mxvoice.app` DNS CNAME to your server.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `GITHUB_TOKEN` | _(none)_ | Optional. Increases GitHub API rate limit from 60/hr to 5,000/hr |
