# Deployment status

The source is prepared for hosting. No remote deployment, DNS change, or upload of account data has been performed. A hosting destination and authorized management access are still required.

## Existing Node.js hosting

The host must support Node.js 20 or newer, a continuously running server, HTTPS, and persistent writable storage. A static-only web host cannot run the student/admin login system. No dependencies need installing.

Upload the website source and artwork, excluding `.private`, `.env`, credentials files, and development test databases. Start with `node server.js`. Configure these environment variables in the hosting dashboard:

| Variable | Value |
| --- | --- |
| NODE_ENV | production |
| HOST | 0.0.0.0 (or the value required by your host) |
| PORT | The port required by your host |
| THINKMATE_ORIGIN | Your exact HTTPS origin, such as https://chess.your-domain.example |
| THINKMATE_SECURE_COOKIE | true |
| THINKMATE_DATA_DIR | A persistent private directory outside the public web root |
| THINKMATE_ADMIN_EMAIL | The initial administrator email on a new installation |
| THINKMATE_ADMIN_PASSWORD | Optional initial password, supplied privately through the hosting dashboard |

If the host uses a `public_html` folder, do not put the private database or credentials there. Route requests through the host's HTTPS proxy to the Node process. Set the host's health check path to `/healthz`. Keep one application process/replica when using this JSON database. Use a proper shared database before scaling to multiple processes.

## Linux VPS with Docker

Dockerfile, compose.yaml, and Caddyfile are included for a server that already has Docker Engine and Docker Compose. Docker is not installed or available in the current workspace, so container build and HTTPS provisioning have not yet been tested here.

1. Point your chosen domain's DNS to the server. Ensure ports 80 and 443 are available and reachable. Confirm this will not disrupt an existing web server.
2. Copy the website source to a private application directory on the server.
3. Copy `.env.example` to `.env` and set `SITE_DOMAIN` to the actual domain. Set the initial admin email if desired. Supply an initial password privately, or retrieve the generated first-login file after startup.
4. Validate with `docker compose config --quiet`.
5. Start with `docker compose up -d --build`.
6. Check `docker compose ps` and `docker compose logs --tail=100`.
7. Visit `https://YOUR-DOMAIN/login` and `https://YOUR-DOMAIN/admin/login`.

Caddy obtains HTTPS certificates when the domain and server are correctly reachable. The application port is accessible only within the container network. The academy_data volume persists accounts and schedules across container replacements; caddy_data persists certificate state.

On a new installation with no supplied password, privately retrieve the credentials using `docker compose cp academy:/data/initial-admin.txt ./initial-admin.txt`. This file contains a password: keep it off public web roots, restrict its access, and use Change password after signing in. The file's localhost URL is only an initialization reference; use your real domain to sign in.

## Existing accounts and schedules

The local installation has its own `.private/database.json`. A source-only deployment creates a separate new installation. Migrating existing account records requires authorization for the specific host. Do not upload the local credentials TXT file or test databases. To migrate, stop writes, transfer only the actual academy database securely to the host's configured private data directory, set appropriate ownership, and start the app. Existing password hashes remain valid. Sessions are not transferred, so users sign in again.

## Verify after hosting

- HTTPS login page loads without warnings.
- Opening `/app` without signing in redirects to login.
- Student credentials cannot sign in through the admin login.
- An admin can create a student, schedule an assigned class, and reschedule it.
- A second student cannot see or reserve another student's class.
- Logout blocks reopening protected pages.
- Restarting the app preserves accounts and schedules.
- `/.private/database.json`, `/server.js`, and credentials paths are inaccessible.

Keep private backups of the real database and verify restoration. Avoid `docker compose down -v`: it deletes persistent volumes. Restarting the single-process app signs out existing sessions.

References: [Docker persistent volumes](https://docs.docker.com/engine/storage/volumes/), [Caddy automatic HTTPS](https://caddyserver.com/docs/automatic-https).
