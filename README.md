# Sri Vinayaka Caterers · first release

Phone-first vegetarian catering catalog for Hyderabad with a real WhatsApp enquiry handoff and a password-protected owner dashboard. No customer login, OTP, webhook, automatic messages, payment collection or confirmed-booking claim.

## Customer flow

Set guests (minimum 10), choose Silver/Gold/Platinum or individual dishes, and customize actual dish choices inside each package. Platinum retains the source sheet's choose-two rules. Untick unwanted inclusions and add other dishes. Enter event details, review the complete menu, then open WhatsApp with the full request addressed to the owner. **The customer must tap Send manually in WhatsApp.** Opening WhatsApp is not verified delivery or a confirmed booking. Copy-message and call fallbacks are provided.

Customer details remain in page memory and are not stored by this website; refreshing clears them. Opening the WhatsApp link passes the prefilled text to WhatsApp. No advertising, tracking scripts, third-party fonts or paid messaging service is used.

## Owner workflow

After Cloudflare setup, open `/admin/` on a phone or computer and sign in with the owner password.

- **Dishes:** add/edit names, descriptions, categories, prices, photo mappings and visibility.
- **Categories:** add/edit, hide/show and change display order.
- **Packages:** edit names, prices, visibility and photos; use **Dish choices** to edit inclusion labels, choice counts and allowed dishes. New packages start hidden until configured.
- **Photos:** upload matching JPG/PNG/WebP photographs. Uploads are resized in the browser and stored on the server. Assign them from a dish/package's Edit screen. Stock imagery must remain labelled illustrative. Export iPhone HEIC images as JPEG first.
- **Business & prices:** edit contacts, minimum guests, hero photo and the price disclaimer. Demo prices are removed. Prices stay hidden until the owner explicitly approves public display. Blank prices always request a quote.
- **Save draft** stores privately on the server. **Preview saved draft** shows the customer experience with WhatsApp handoff disabled. **Review & publish** updates the live catalog through authenticated server-side publishing.
- **Previous versions** restores one of the last 10 prior published catalogs to a draft for preview and republishing. **Download backup** exports the current draft; it does not publish.

Hide discontinued dishes rather than deleting their package references. Publishing rejects visible packages without enough visible dish choices. Revision checks prevent one editing session from silently overwriting another; download your work before reloading after a conflict.

## Run locally

Node.js 22+ and npm are required. Dependencies are pinned by `package-lock.json`.

```sh
npm ci
npm run db:local
npm run owner:password -- --local
npm run dev
```

Open `http://127.0.0.1:8787` and `/admin/`. The local password command writes `.dev.vars`, which is ignored and never included in the public build. Never reuse a test password in production.

A static localhost HTTP server can preview the customer catalog only. Use `npm run dev` for owner sign-in, server drafts, uploads and publishing.

## Verify

```sh
npm test
npm run check:deploy
SVC_TEST_PASSWORD='your local test password' npm run test:browser
```

The browser suite uses installed Google Chrome and a running local server. It edits, publishes and restores the **local** database and uploads a test image. It inspects the WhatsApp URL without opening or sending it. Evidence goes to `test-results/`. See `VALIDATION.md` for this release's results.

## Architecture and release

See `CLOUDFLARE_SETUP.md` for account connection, deployment, free quotas and recovery.

- Workers Static Assets serves allowlisted files in `dist/`.
- `server/worker.js` handles `/api/*` and uploaded `/media/*`.
- D1 stores live/draft catalogs, 10 prior versions, photos, sessions and login throttling. No customer enquiries are stored.
- A salted PBKDF2 password hash lives in a Worker secret. Owner sessions use random tokens, server expiry and HttpOnly/SameSite cookies, with Secure on HTTPS. Mutations require same-origin requests. Login allows five attempts per IP per 15 minutes.
- No Git repository, external CMS, R2 enrollment or paid plan is needed.

The original `Input_Info/` reference sheets are unchanged. The previous site is preserved in `backups/pre-redesign-2026-09-05.tgz`. Build output excludes source sheets, backups, secrets, test files and server source.

The menu was expanded from the supplied sheets. Uncommon legacy dish names should be checked by the owner. Existing phone numbers, WhatsApp recipient, address and email are preserved. `IMAGE_STATUS.md` records the outstanding dish-photo gaps. All unmatched dishes visibly say **Photo pending** in selection and review; complete photography is not claimed.
