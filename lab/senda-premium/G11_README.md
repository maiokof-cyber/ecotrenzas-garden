# G11 — Escenografía ilustrada modular (candidata, no aprobada)

Rama exclusiva `lab/g11-painterly-world`, padre G10 certificado. No modificar `main`, economía, CRM, reservas, anuncios ni la versión pública.

## Arte y proveniencia
- Autoridad artística: `KEYART_SEMILLERO_MAGICO_V1` (solo referencia; nunca se incluye como background en el juego).
- `art-source/g11_concept_ref.webp` es una ilustración conceptual nueva, separada, de la cual se aislaron manualmente recortes de ambiente sin HUD ni cifras. No se usa como fondo ni se sirve mediante `public/`.
- `public/assets/g11/sky_dawn.png`: atmósfera superior independiente con máscara suave.
- `.../blossom_canopy.png`: vegetación lejana aislada.
- `.../cascade_cliff.png`: cascada aislada como candidato gráfico.
- `.../motes.png`: polvo cristalino generado por dibujo independiente.
- Las piezas están en `public/assets`, cada una con SHA-256 y tamaño declarado en `g11_manifest.json`. Todas las piezas son candidatas, ninguna declara aprobación final.
- `scripts/build_g11_assets.py`: generador reproducible en Pillow usando la fuente conceptual versionada; no es requisito de producción.

## Integración
`TrackG11PixiScene` hereda renderer/cámara aprobados de G10. Inserta 4 sprites en 2 contenedores, sin handlers y con `eventMode='none'`, y mantiene los nodos interactivos delante. WebGL estricto, Canvas sigue siendo únicamente un respaldo honesto cuando falla PixiJS.

## Evidencia
Workflow `g11-art-cert`: valida PNG, SHA-256, tamaños, compilación, render WebGL de cinco nodos y cuatro sprites, seis cartas, cinco familias, XP/monedas intactos, modo de movimiento reducido, ausencia de errores en móvil y escritorio. Retención de artefactos: siete días.

## Próximo gate
Revisión artística G11 contra Key Art V1. Aún quedan discrepancias pictóricas entre cielo de G11 y la vegetación/terreno plano heredado de G10; validar en móvil físico antes de aprobar arte final.

Costo incremental esperado: $0; mismo PixiJS, Vite, GitHub Actions público y Pages. No activar facturación ni usar servicios externos.
