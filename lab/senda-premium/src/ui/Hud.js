export class Hud {
  constructor(progression, season) {
    this.progression = progression;
    this.season = season;
    this.level = document.querySelector('#hud-level');
    this.coins = document.querySelector('#hud-coins');
    this.crystals = document.querySelector('#hud-crystals');
    this.status = document.querySelector('#hud-status');
    this.xp = document.querySelector('#hud-xp');
  }

  render(message = '') {
    const state = this.progression.state;
    this.level.textContent = String(state.currentLevel);
    this.coins.textContent = state.coins.toLocaleString('es-CL');
    this.crystals.textContent = String(state.crystals);
    const progress = ((state.currentLevel - 1) / (this.season.levels.length - 1)) * 100;
    this.xp.style.width = Math.max(0, Math.min(100, progress)) + '%';
    this.status.textContent = message || (state.currentLevel === this.season.levels.length
      ? '✨ Completaste esta vertical slice'
      : 'Toca el siguiente nodo brillante');
  }
}
