# Dependency review (ORI-SEC-009), 23 Oct 2026

Versions are pinned exactly in `package.json`, and lockfiles are committed. `npm audit` was run read-only; nothing was upgraded or downgraded automatically.

## Accounts (`workers/accounts`)

- **Packages:** `better-auth` 1.7.11, `qrcode` 1.5.4, `web-push` 3.6.7, `esbuild` 0.28.2 (build), `jsqr` 1.4.0 (tests).
- **Audit:** 0 vulnerabilities.
- **Better Auth multi-session:** reviewed before use. Its endpoints return raw session tokens, so they're reachable only through Orivia's own server routes (see `docs/ina-pilot-ready-5-2026-10-23.md`).

## Pilot Worker (`workers/pilot`)

- **Packages:** `@cloudflare/puppeteer` 1.4.0 and `wrangler` 4.151.1.
- **Audit:** 7 high-severity findings. All come through `@cloudflare/puppeteer`, then `@puppeteer/browsers`:

| Package | Example advisory |
|---|---|
| `basic-ftp` | Denial of service in the FTP directory parser |
| `extract-zip` | Symlink path traversal and arbitrary file writes |
| `get-uri` | (see npm audit) |
| `pac-proxy-agent`, `proxy-agent` | (see npm audit) |
| `@puppeteer/browsers`, `@cloudflare/puppeteer` | (as parents) |

**Impact assessment:**
- **Not deployed:** none of these packages is in the deployed Worker bundle. The source map of the pilot build lists 36 bundled packages; `@puppeteer/browsers`, `basic-ftp`, `extract-zip`, `get-uri`, `pac-proxy-agent` and `proxy-agent` aren't among them. (`https-proxy-agent`, from `web-push`, is a different package.)
- **What they're for:** the vulnerable code downloads and unzips a local Chrome for desktop puppeteer. The Worker uses Cloudflare's Browser Rendering binding instead and never runs that path.
- **Browser rendering is off on the pilot:** `BROWSER_DAY_SECONDS` is `0` and `BROWSER_DIRECTORY` is `0`.
- **Remaining exposure:** a developer machine running puppeteer's browser download on hostile input. Nobody does that in this project.

**Decision:** not a release blocker for the Worker.
- npm's suggested "fix" is a downgrade to `@cloudflare/puppeteer@0.0.11`. That would be a breaking change and isn't applied.
- **Action:** update `@cloudflare/puppeteer` when a release ships patched dependencies, re-run `npm audit` and the pilot build, and check the bundle list again.

**Re-check command:**
```bash
cd workers/pilot && npm audit --omit=dev
```
