const STORAGE_KEY = 'ecotrenzas-senda-premium-lab-v1';

const initialState = () => ({
  version: 1,
  currentLevel: 1,
  coins: 48,
  crystals: 0,
  pigments: { violeta: 0 },
  unlockedStyles: [],
  claimed: [1]
});

export class Progression {
  constructor(season) {
    this.season = season;
    this.state = this.load();
  }

  load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!parsed || parsed.version !== 1) return initialState();
      const max = this.season.levels.length;
      return {
        ...initialState(),
        ...parsed,
        currentLevel: Math.max(1, Math.min(max, Number(parsed.currentLevel) || 1)),
        claimed: Array.isArray(parsed.claimed) ? parsed.claimed.filter(Number.isInteger) : [1],
        unlockedStyles: Array.isArray(parsed.unlockedStyles) ? parsed.unlockedStyles.slice(0, 20) : []
      };
    } catch {
      return initialState();
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  statusFor(level) {
    if (this.state.claimed.includes(level)) return 'claimed';
    if (level === this.state.currentLevel + 1) return 'claimable';
    return 'locked';
  }

  canClaim(level) {
    return this.statusFor(level) === 'claimable';
  }

  claim(level) {
    if (!this.canClaim(level)) return false;
    const item = this.season.levels.find(entry => entry.level === level);
    if (!item) return false;

    const reward = item.reward;
    if (reward?.type === 'coins') this.state.coins += reward.amount;
    if (reward?.type === 'crystal') this.state.crystals += reward.amount;
    if (reward?.type === 'pigment') {
      this.state.pigments[reward.id] = (this.state.pigments[reward.id] || 0) + reward.amount;
    }
    if (reward?.type === 'style' && !this.state.unlockedStyles.includes(reward.id)) {
      this.state.unlockedStyles.push(reward.id);
    }

    this.state.currentLevel = level;
    this.state.claimed = [...new Set([...this.state.claimed, level])];
    this.save();
    return true;
  }

  reset() {
    this.state = initialState();
    this.save();
  }
}
