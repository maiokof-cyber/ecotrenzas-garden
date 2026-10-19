# EcoTrenzas Garden — G5 Premium Pixi Laboratory

Isolated branch `lab/g5-pixi-premium`; anchored at Git commit `1095c387` containing the exact approved original node base PNG.

## Objective
Preserve G4.2 gameplay (30 levels, six fantasy Wooldreads cards, five real service families), while verifying an actual PixiJS v8 WebGL renderer. The Canvas fallback is allowed for accessibility but cannot pass G5 certification.

## Paths
- `lab/senda-premium/g5.html`: G5 WebGL candidate.
- `lab/senda-premium/index.html`: historical five-node lab, kept unchanged.
- `lab/senda-premium/public/assets/semillero/nodes/node_base_v01.png`: original approved PNG inherited from `1095c387`.
- `lab/senda-premium/src/gameplay/GardenGameplay.mjs`: economy source of truth.

## Verification
`npm install && npm run test:g5:core && npm run build`, followed by `npm run preview` and `npm run test:g5:pixi` in Chromium with WebGL available. Browser certificate strictly requires validated PNG SHA-256, 5 Pixi sprites, working interaction on mobile and desktop, and no reward duplication.

## Non-goals / safety
No CRM, Booking, Make, ads, payment, or actual discounts; no changes to `main`, existing G4.2 online game, G2 or V0.2. The key art remains inspiration, not a baked-in background asset.

## Status
This file describes a candidate. Only successful GitHub Actions and a passing browser acceptance produce `G5_PIXI_RUNTIME_GREEN`.
