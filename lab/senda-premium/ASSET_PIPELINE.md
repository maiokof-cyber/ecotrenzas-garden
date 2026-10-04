# EcoTrenzas Garden — Asset Pipeline

This directory is the canonical working area for the Premium Senda lab.

## Source of truth

- Repository: `maiokof-cyber/ecotrenzas-garden`
- Working branch: `lab/senda-premium-v1`
- Stable V0.2, beta V0.3 and beta V0.3.1 are not modified by this lane.

## Asset policy

Masters and runtime assets are distinct:

- `art/masters/` — high-resolution source art.
- `public/assets/semillero/` — optimized runtime assets loaded by Pixi.

Runtime assets must be:
- one component per file;
- real alpha where transparency is required;
- no embedded text or level numbers;
- mobile-legible;
- reusable in compositions.

## Semillero folders

- `nodes/`
- `path/`
- `environment/`
- `rewards/`
- `fx/`

## Documentation policy

PLANES TIENDA Project Sources keep only milestone checkpoints:
1. APPROVED_PRODUCTION_ASSETS
2. PIXI_INTEGRATION + MOBILE_VISUAL_CERT
3. ART_BIBLE_FINAL / GARDEN_CURRENT

Individual sprite iterations live in GitHub, not in Project Sources.
