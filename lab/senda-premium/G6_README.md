# EcoTrenzas Garden G6 — Cartas Premium / Hearthstone quality benchmark

- Dedicated branch `lab/g6-card-premium` based on G5 certified runtime; no changes to `main`, G4.2 public, or G5 branch.
- Six original Wooldreads fantasy illustrations **reused byte-for-byte**, stored as runtime assets at `public/assets/cards/` with Git blob IDs matching the legacy root `assets/*.webp`. No new services promised or real photographs asserted.
- PixiJS certified WebGL 2.5D remains the game runtime for the senda; album card reveal is accessible DOM/CSS overlay rather than a second game engine.
- `GardenGameplay.mjs` and `StyleAtlas.mjs` preserved exactly: same 30 levels, XP, receipts, five commercial service families, no purchase triggers.
- After **successful real unlocking** of a card, show one visual reveal and allow optional equip; closing the visual overlay never awards anything.
- Reduced-motion preference disables animations; modal closes via Escape, Close, or backdrop; keyboard focus returns to card action.
- No audio autoplay, lootbox randomness, payments, email, analytics, external data writes, or CRM integration.
- Verify in CI via `npm run test:g5:core && npm run test:g6:core && npm run build`, followed by `npm run test:g6:pixi` at the preview server.
- **Hearthstone-inspired comparison**: visual rarity, collectibility and reveal feedback, not identical combat or monetization.

Status only GREEN when workflow confirms WebGL and six image loads in Chromium mobile/desktop with original economy, plus visual review.
