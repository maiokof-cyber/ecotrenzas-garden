# G9 — Arte modular 2.5D · EcoTrenzas Garden

**Alcance:** rama `lab/g9-art-production`. Conserva el motor de progreso G2, la economía original, PixiJS + WebGL, el nodo base aprobado, las cartas G6, el audio opt-in G7 y la atmósfera G8.

## Recursos

- `arch_gate.png`: arco vegetal trasero (candidato ilustrativo)
- `waterfall.png`: cascada detallada tras los nodos (candidato ilustrativo)
- `foreground_flora.png`: vegetación floral anterior, dibujada como dos instancias (candidato ilustrativo)

Archivos transparentes independientes generados sin copiar o recortar el Key Art. Las versiones `.svg` son fuentes editables, mientras `.png` son texturas de Pixi. **Estado: candidatos implementables, NO arte final aprobado por dirección artística.**

## Reglas

- No se altera el sprite `node_base_v01.png` ni su hash.
- Ningún recurso G9 es botón o concede XP, monedas o beneficios reales.
- No se integran servicios externos, API de pago, envíos ni trackers.
- `npm run test:g9:pixi` exige WebGL real, texturas cargadas, cinco nodos y economía intacta.
- Capturas CI retenidas siete días.

## Pendiente para calidad tipo Hearthstone

Texturizado manual de materiales, módulos artísticos coherentes entre las seis zonas, dinámica real de agua, iluminación compleja, sprites específicos de hitos épicos y pruebas en hardware móvil físico.
