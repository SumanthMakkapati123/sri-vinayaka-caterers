# Release validation · 2026-09-05

## Passed

- `npm test`: 11 tests, 11 passed. Catalog/schema integrity, Silver/Gold/Platinum actual-dish choice counts, Platinum choose-two constraints, inclusion exclusions, standalone dishes, minimum guests, date validation, full WhatsApp request encoding, hidden content/prices, indicative pricing and rejected invalid catalog references.
- `node tests/browser.mjs`: real headless Chrome against local Wrangler/Miniflare + D1, customer journeys at 360, 390, 768 and 1440 px. Selected every Silver slot, excluded a hot snack, added samosa, set 50 guests, entered event details and verified all fields in the configured owner's WhatsApp URL. The suite did not navigate to WhatsApp or send a message.
- Review includes an image element for every actual dish and explicitly identifies unavailable photographs. Customer page has no horizontal overflow at tested widths and writes no personal data to localStorage.
- Owner workflow at 390 px: password sign-in, edit dish description and price, server-side draft save, verify draft privacy, upload/assign a photo, authenticated preview, publish to public catalog and restore a previous version.
- Uploaded JPEG rendering was visually checked. A D1 BLOB array-to-response conversion bug found in the first screenshot review was fixed, and the rerun verifies nonzero decoded image width in the browser.
- API checks: signed-out draft/upload denied (401), stale revision rejected (409), cross-site publish rejected (403), local session cookie HttpOnly and SameSite=Strict. HTTPS Secure-cookie behavior is configured in code; it still needs the live HTTPS check after deployment.
- No uncaught browser JavaScript errors in the suite.
- `npm run build` passes and creates an allowlisted `dist/`. `npm run check:deploy` passes Wrangler's bundle/static-asset dry run with D1 and ASSETS bindings.
- Original reference sheets and a reversible pre-redesign site archive are preserved outside the deployment directory.

Screenshots: `test-results/home-{360,390,768,1440}.png`, `test-results/review-{360,390,768,1440}.png`, and `test-results/owner-mobile.png`. Machine-readable summary: `test-results/browser-report.json`.

- `node tests/photos.mjs`: all 9 mapped representative dish images decode in Chrome; new photographs appear in the mobile catalog and package picker, with source/creator/license credits. Evidence: `test-results/menu-photos-mobile.png` and `test-results/package-photos-mobile.png`. The final seed was published only to the local test database for preview.

## Remaining release requirements

1. Cloudflare authentication, a real D1 database ID, remote migration, production owner-password secret and actual deployment. `wrangler whoami` confirmed this machine is not authenticated. No public URL or production run is claimed.
2. Matching photography is incomplete: 9 of 241 dishes currently have matching supplied representative photographs; 232 are visibly labelled Photo pending. Seven licensed Wikimedia photographs were subsequently downloaded after account access resumed, visually reviewed and added with attribution. See `IMAGE_STATUS.md` for the exact list.
3. Owner review of uncommon transcribed dish names and eventual approved prices. No demo prices are displayed; quote-on-request is the release default.
4. Installed WhatsApp app handoff should be checked on the owner's actual iPhone/Android after deployment. Automated tests verify the full standard `wa.me` URL and manual-Send messaging, not native app opening or message delivery.

This is a locally validated implementation and deployment package, not evidence of a live public launch or completed dish photography.
