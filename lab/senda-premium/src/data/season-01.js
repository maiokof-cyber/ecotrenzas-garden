export const season01 = {
  id: 'semillero-magico',
  name: 'Semillero Mágico',
  width: 960,
  height: 540,
  levels: [
    { level: 1, x: 105, y: 360, type: 'start', title: 'Inicio', reward: null },
    { level: 2, x: 270, y: 300, type: 'normal', title: 'Primer brote', reward: { type: 'coins', amount: 25, label: '+25 monedas' } },
    { level: 3, x: 455, y: 338, type: 'normal', title: 'Pigmento vivo', reward: { type: 'pigment', id: 'violeta', amount: 1, label: 'Pigmento violeta' } },
    { level: 4, x: 650, y: 255, type: 'special', title: 'Luz del jardín', reward: { type: 'crystal', amount: 1, label: '+1 cristal' } },
    { level: 5, x: 840, y: 300, type: 'epic', title: 'Hito épico', reward: { type: 'style', id: 'niebla_invernal', label: 'Niebla Invernal' } }
  ]
};
