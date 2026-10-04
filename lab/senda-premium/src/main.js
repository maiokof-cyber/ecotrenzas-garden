import './styles/game.css';
import { season01 } from './data/season-01.js';
import { Progression } from './core/Progression.js';
import { Hud } from './ui/Hud.js';
import { SendaScene } from './senda/SendaScene.js';

const host = document.querySelector('#game-host');
const progression = new Progression(season01);
const hud = new Hud(progression, season01);

const scene = new SendaScene({
  season: season01,
  progression,
  onStateChange(message) {
    hud.render(message);
  }
});

await scene.mount(host);
hud.render();

document.querySelector('#reset-progress').addEventListener('click', () => {
  progression.reset();
  scene.refresh();
  hud.render('🌱 Laboratorio restaurado');
});

// Hook de diagnóstico exclusivo del laboratorio. No contiene datos comerciales,
// credenciales ni autoridad de beneficios; permite certificar el renderer en CI.
window.__SENDA_PREMIUM_TEST__ = {
  ready: true,
  snapshot() {
    const target = season01.levels[1];
    const scale = scene.world.scale.x;
    return {
      nodeCount: scene.nodesLayer.children.length,
      currentLevel: progression.state.currentLevel,
      coins: progression.state.coins,
      crystals: progression.state.crystals,
      node2: {
        x: scene.world.x + target.x * scale,
        y: scene.world.y + target.y * scale
      }
    };
  }
};
