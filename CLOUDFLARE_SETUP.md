# Cloudflare deployment

## Current status

The build and deployment dry run pass. `wrangler whoami` reports **not authenticated**. The all-zero D1 ID in `wrangler.jsonc` is a local placeholder. There is no live deployment URL yet and no paid service has been enrolled.

## One-time account setup

Use **Cloudflare Free / Workers Free**. Do not enable Workers Paid, R2 or paid Images. An included `workers.dev` subdomain avoids buying a domain.

From this project directory:

```sh
npm ci
npx wrangler login
npx wrangler whoami
npx wrangler d1 create sri-vinayaka-catalog
```

The account holder completes Cloudflare's browser login and authorization. If needed, choose a free Workers subdomain under Workers & Pages. With multiple accounts, select the intended free account and add its `account_id` to `wrangler.jsonc`.

Replace the placeholder `database_id` in `wrangler.jsonc` with the returned real D1 database ID, keeping binding `DB`. Then:

```sh
npm run db:remote
npm run check:deploy
npm run deploy
npm run owner:password
npx wrangler secret put OWNER_PASSWORD_HASH < /private/tmp/sri-vinayaka-owner-hash.txt
```

Store the generated owner password in the owner's password manager. The helper writes only a salted PBKDF2 hash to that temporary file. Remove the file after setting the secret. Never upload `.dev.vars` or reuse the local test password. Owner sign-in is disabled until the secret is configured.

Wrangler prints the actual public URL after successful deployment, in the form `https://sri-vinayaka-caterers.<account-subdomain>.workers.dev`. This is a URL pattern, not a claim that the site is live.

Open the actual URL and `/admin/`, sign in, preview the catalog and publish it. Share only the verified live URL. No Git repository is needed. Never set the static asset directory to the project root: deploy only the `dist/` allowlist.

## Check after deployment

- On a phone, select package dishes, exclude an inclusion, add a dish, set guests/date/venue and review the complete message.
- Verify the owner recipient and the instruction to tap Send. The website must not say the message was received or that a booking is confirmed.
- Save a harmless owner draft; verify it is private in a signed-out window. Preview, publish and check the public refresh.
- Verify uploaded photo display and HTTP 401 for signed-out `/api/admin/draft`.
- On HTTPS, verify the session cookie is Secure, HttpOnly and SameSite=Strict.
- Keep unapproved prices hidden. Check uncommon transcribed dish names and pending photos before promoting those dishes.

## Free quotas and application caps

Checked against Cloudflare documentation on 2026-09-05:

| Resource | Free allowance / application behavior |
| --- | --- |
| Static assets | Free unlimited requests; included workers.dev address |
| Worker API/media | 100,000 requests/day, shared across the account |
| D1 | 5 million rows read/day, 100,000 rows written/day, 5 GB total account storage |
| D1 per database | 500 MB on Free |
| Photos | Site caps at 100 uploads × 350 KB (35 MB); resized to at most 1,000 px |
| Catalog | 500 dishes, 30 categories, 20 packages; 250 KB JSON cap |
| History | 10 prior published catalogs |
| Owner sessions | 8 hours; five password attempts/IP/15 minutes |

Catalog and uploaded-image requests invoke the Worker. Exhausting free quotas can make those services unavailable until reset; the page provides a call fallback. No automatic plan upgrade runs. Keep the account on Free and monitor shared usage in the Cloudflare dashboard.

Sources: [Static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).

## Recovery and maintenance

Use dashboard **Previous versions → Restore draft → Preview → Publish** to recover a prior catalog. Download a draft backup before major edits. For a full database backup including uploaded images:

```sh
npx wrangler d1 export sri-vinayaka-catalog --remote --output /private/tmp/sri-vinayaka-d1-backup.sql
```

Store that file securely outside `dist/`; it contains private drafts and session hashes too.

To reset an owner password, run `npm run owner:password`, set the new secret, and revoke existing sessions:

```sh
npx wrangler secret put OWNER_PASSWORD_HASH < /private/tmp/sri-vinayaka-owner-hash.txt
npx wrangler d1 execute sri-vinayaka-catalog --remote --command "DELETE FROM sessions"
```

Images are retained to preserve draft/history references. At the upload cap, a maintainer should back up the database and archive only images unused by live, draft and historical catalogs. No destructive photo cleanup runs automatically.

Code update: `npm ci`, `npm test`, `npm run check:deploy`, `npm run deploy`. D1 content survives code deploys. Editing seed `catalog.json` after the owner begins publishing does not replace live D1 data; use the dashboard for routine content updates.
