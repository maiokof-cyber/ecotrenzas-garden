# EcoTrenzas Garden G13 — Gameplay Strategy & Mobile

Base: `lab/g12-terrain-premium`. Files additive except one tiny extension hook in `GardenG4UI.js`, required to access the unique authoritative `GardenGameplay` instance.

## Player-visible changes
- Pick any of the six Wooldreads fantasy cards as a collection goal.
- Garden shows required and owned pigment quantities and pigments already growing.
- A single explicit planting button chooses the most useful seed and plants it in a free plot **using the existing 4-EcoMoneda plant() action**. No extra rewards.
- Accessible 44px buttons and 18% camera zoom on phones, retaining interactive nodes.
- Track shows what XP remains and short navigation to the garden/album.

## Guardrails
- No changes to `GardenGameplay.mjs`, XP, recipes, seed timers, crystals, or mission payouts.
- New localStorage key contains **only the ID of a chosen fantasy card**, never customer data.
- No CRM/booking/DM writes. No HTTP calls or billing.
- G4.2 on `main` remains untouched.
- Acceptance: deterministic planner core plus one Pixi WebGL browser smoke on mobile and desktop; reduce Actions evidence retention to 7 days.

## Source of truth
Gameplay remains `GardenGameplay.mjs` and its existing V1 state key. Planner reads a live snapshot on every UI render.
