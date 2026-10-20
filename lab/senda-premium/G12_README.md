# EcoTrenzas Garden G12 — Terreno y Senda Ilustrados

**Base confirmada:** `lab/g11-painterly-world` commit `f27ff578c5676f0756d1cafe9acace74c52f7943`.

**Carácter:** laboratorio independiente. No altera `main`, la versión G4.2 pública, economía, servicios, contacto, CRM, reservas ni cobros.

## Qué cambia

Tres capas PNG con transparencia a 1920×1080, dibujadas en coordenadas 960×540 y sprites PixiJS separados:
- `terrain_painterly.png`: relieve verde, piedras, musgo, vegetación y flores. Alfa de transición con el cielo G11.
- `braided_route.png`: senda dorada pintada siguiendo exactamente los cuatro tramos Bézier originales de los cinco nodos, con tres hebras entrelazadas.
- `foreground_garden.png`: detalle floral inferior, desactivado para hit-testing.

El archivo `scripts/build_g12_art.py` genera los sprites de manera determinista (Pillow, numpy). El manifiesto documenta SHA256, tamaños y la geometría inalterada de nodos. No se añaden librerías runtime o servicios externos.

## Certificación

- Core G5/G6: economía, cartas originales, 30 niveles.
- Integridad: checksum SHA256, dimensiones y presupuesto de assets (2.5 MB).
- E2E Chromium 390×844 / 1280×800: WebGL real, 5 nodos aprobados, 3 capas G12, navegación y pestañas, movimiento reducido, XP y monedas sin filtraciones.
- Capturas de calidad visual con retención de 7 días. El GREEN técnico no equivale a aprobación artística.

## Riesgo / rollback

La carga de tres texturas incrementa memoria gráfica. Vuelve a `g11.html` o a la rama G11 en caso de rendimiento visual insuficiente. `main` queda intacta.

**Costo monetario adicional previsto:** $0, infraestructura existente. Sin billing nuevo.
