import { Application, Container, Graphics, Text } from 'pixi.js';

const COLORS = {
  ink: 0x1b2a24,
  deep: 0x17372d,
  forest: 0x285b43,
  moss: 0x5f8b55,
  leaf: 0x9bc46f,
  cream: 0xfff4cf,
  gold: 0xf5ca67,
  purple: 0x7254a5,
  locked: 0x5a625c,
  claimed: 0x4e9c69
};

export class SendaScene {
  constructor({ season, progression, onStateChange }) {
    this.season = season;
    this.progression = progression;
    this.onStateChange = onStateChange;
    this.app = new Application();
    this.world = new Container();
    this.nodesLayer = new Container();
    this.pollen = [];
  }

  async mount(host) {
    await this.app.init({
      resizeTo: host,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      preference: 'webgl',
      preferWebGLVersion: 2
    });

    host.appendChild(this.app.canvas);
    this.app.stage.addChild(this.world);
    this.buildWorld();
    this.layout();

    window.addEventListener('resize', () => this.layout());
    this.app.ticker.add(ticker => this.animate(ticker.deltaTime));
  }

  buildWorld() {
    this.world.removeChildren();

    const sky = new Graphics()
      .rect(0, 0, this.season.width, this.season.height)
      .fill({ color: 0xb8d79a });
    this.world.addChild(sky);

    const far = new Graphics();
    far.circle(100, 190, 150).fill({ color: 0x7ca46e, alpha: 0.55 });
    far.circle(360, 130, 190).fill({ color: 0x8cb579, alpha: 0.48 });
    far.circle(720, 160, 180).fill({ color: 0x749a67, alpha: 0.5 });
    far.circle(930, 130, 160).fill({ color: 0x88ae75, alpha: 0.5 });
    this.world.addChild(far);

    const meadow = new Graphics()
      .ellipse(480, 470, 590, 190)
      .fill({ color: 0x70975a })
      .ellipse(420, 500, 520, 145)
      .fill({ color: 0x537d4a, alpha: 0.9 });
    this.world.addChild(meadow);

    this.drawPath();

    this.nodesLayer = new Container();
    this.world.addChild(this.nodesLayer);
    this.renderNodes();

    const foreground = new Graphics();
    foreground.circle(50, 500, 100).fill({ color: 0x315b3c, alpha: 0.88 });
    foreground.circle(910, 510, 120).fill({ color: 0x2c5038, alpha: 0.9 });
    this.world.addChild(foreground);

    this.createPollen();
  }

  drawPath() {
    const points = this.season.levels;
    const shadow = new Graphics();
    const braid = new Graphics();
    const highlight = new Graphics();

    shadow.moveTo(points[0].x, points[0].y + 7);
    braid.moveTo(points[0].x, points[0].y);
    highlight.moveTo(points[0].x, points[0].y - 3);

    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      shadow.bezierCurveTo(midX, prev.y + 25, midX, curr.y + 25, curr.x, curr.y + 7);
      braid.bezierCurveTo(midX, prev.y, midX, curr.y, curr.x, curr.y);
      highlight.bezierCurveTo(midX, prev.y - 3, midX, curr.y - 3, curr.x, curr.y - 3);
    }

    shadow.stroke({ width: 24, color: 0x4a3826, alpha: 0.35, cap: 'round' });
    braid.stroke({ width: 18, color: 0x8b5d3c, cap: 'round' });
    highlight.stroke({ width: 5, color: 0xd2a06a, alpha: 0.75, cap: 'round' });

    this.world.addChild(shadow, braid, highlight);
  }

  renderNodes() {
    this.nodesLayer.removeChildren();

    for (const item of this.season.levels) {
      const status = this.progression.statusFor(item.level);
      const group = new Container();
      group.x = item.x;
      group.y = item.y;
      group.eventMode = status === 'claimable' ? 'static' : 'none';
      group.cursor = status === 'claimable' ? 'pointer' : 'default';

      const isEpic = item.type === 'epic';
      const radius = isEpic ? 34 : 27;
      const fill = status === 'claimed'
        ? COLORS.claimed
        : status === 'claimable'
          ? COLORS.gold
          : COLORS.locked;

      const glow = new Graphics()
        .circle(0, 0, radius + 11)
        .fill({ color: status === 'claimable' ? COLORS.cream : COLORS.deep, alpha: status === 'claimable' ? 0.28 : 0.12 });
      glow.label = 'glow';

      const medallion = new Graphics()
        .circle(0, 4, radius + 3)
        .fill({ color: 0x3c2c20, alpha: 0.5 })
        .circle(0, 0, radius)
        .fill({ color: fill })
        .stroke({ width: isEpic ? 6 : 4, color: isEpic ? COLORS.purple : COLORS.cream, alpha: 0.95 });

      const number = new Text({
        text: String(item.level),
        style: {
          fill: status === 'locked' ? '#d8ddd7' : '#243128',
          fontFamily: 'Georgia, serif',
          fontSize: isEpic ? 24 : 20,
          fontWeight: '700'
        }
      });
      number.anchor.set(0.5);

      const title = new Text({
        text: item.title,
        style: {
          fill: '#183127',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 12,
          fontWeight: '700',
          align: 'center'
        }
      });
      title.anchor.set(0.5, 0);
      title.y = radius + 13;

      group.addChild(glow, medallion, number, title);

      if (status === 'claimed') {
        const check = new Text({ text: '✓', style: { fill: '#fff8dc', fontSize: 18, fontWeight: '800' } });
        check.anchor.set(0.5);
        check.x = radius - 4;
        check.y = -radius + 5;
        group.addChild(check);
      }

      if (status === 'claimable') {
        group.on('pointertap', () => this.claim(item));
      }

      this.nodesLayer.addChild(group);
    }
  }

  claim(item) {
    if (!this.progression.claim(item.level)) return;
    const message = item.reward ? '✨ ' + item.reward.label : '✨ Nivel desbloqueado';
    this.onStateChange(message);
    this.renderNodes();
  }

  createPollen() {
    for (let i = 0; i < 18; i += 1) {
      const mote = new Graphics().circle(0, 0, 2 + (i % 3)).fill({ color: COLORS.cream, alpha: 0.45 });
      mote.x = (i * 71) % this.season.width;
      mote.y = 60 + ((i * 43) % 350);
      mote._speed = 0.12 + (i % 5) * 0.025;
      mote._phase = i * 0.7;
      this.pollen.push(mote);
      this.world.addChild(mote);
    }
  }

  animate(delta) {
    const t = performance.now() / 1000;
    for (const mote of this.pollen) {
      mote.y -= mote._speed * delta;
      mote.x += Math.sin(t + mote._phase) * 0.08 * delta;
      if (mote.y < 35) mote.y = 470;
    }

    for (const node of this.nodesLayer.children) {
      const glow = node.children.find(child => child.label === 'glow');
      if (!glow || node.eventMode !== 'static') continue;
      const pulse = 1 + Math.sin(t * 3.4) * 0.06;
      glow.scale.set(pulse);
      glow.alpha = 0.72 + Math.sin(t * 3.4) * 0.18;
    }
  }

  layout() {
    const scale = Math.min(
      this.app.screen.width / this.season.width,
      this.app.screen.height / this.season.height
    );
    this.world.scale.set(scale);
    this.world.x = (this.app.screen.width - this.season.width * scale) / 2;
    this.world.y = (this.app.screen.height - this.season.height * scale) / 2;
  }

  refresh() {
    this.renderNodes();
  }
}
