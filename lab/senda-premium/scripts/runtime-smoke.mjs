import { chromium } from 'playwright';

const URL = process.env.RUNTIME_URL || 'http://127.0.0.1:4173/';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function inspect(page, label, interactive = false) {
  const errors = [];
  const network = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', request => network.push(`requestfailed: ${request.url()} :: ${request.failure()?.errorText || 'unknown'}`));
  page.on('response', response => {
    if (response.status() >= 400) network.push(`http${response.status()}: ${response.url()}`);
  });

  const response = await page.goto(URL, { waitUntil: 'networkidle' });
  assert(response?.ok(), `${label}: HTTP no exitoso`);

  try {
    await page.waitForFunction(
      () => window.__SENDA_PREMIUM_TEST__?.ready === true,
      { timeout: 10000 }
    );
  } catch (error) {
    const diagnostic = await page.evaluate(async () => {
      const script = document.querySelector('script[type="module"]');
      let scriptProbe = null;
      if (script?.src) {
        try {
          const response = await fetch(script.src, { cache: 'no-store' });
          const body = await response.text();
          scriptProbe = {
            status: response.status,
            contentType: response.headers.get('content-type'),
            prefix: body.slice(0, 120)
          };
        } catch (probeError) {
          scriptProbe = { error: String(probeError) };
        }
      }
      return {
        title: document.title,
        canvasCount: document.querySelectorAll('#game-host canvas').length,
        hostExists: Boolean(document.querySelector('#game-host')),
        hookExists: Boolean(window.__SENDA_PREMIUM_TEST__),
        boot: window.__SENDA_PREMIUM_BOOT__ || '',
        scriptSrc: script?.src || '',
        scriptProbe,
        resources: performance.getEntriesByType('resource').map(entry => entry.name).slice(-20)
      };
    }).catch(() => ({ title: '', canvasCount: -1, hostExists: false, hookExists: false }));
    console.error(`RUNTIME_DIAGNOSTIC ${label} ${JSON.stringify(diagnostic)}`);
    console.error(`RUNTIME_JS_ERRORS ${label} ${errors.length ? errors.join(' | ') : 'NONE'}`);
    console.error(`RUNTIME_NETWORK ${label} ${network.length ? network.join(' | ') : 'NONE'}`);
    throw error;
  }

  const initial = await page.evaluate(() => {
    const snapshot = window.__SENDA_PREMIUM_TEST__.snapshot();
    const canvas = document.querySelector('#game-host canvas');
    const rect = canvas?.getBoundingClientRect();
    return {
      ...snapshot,
      canvas: {
        exists: Boolean(canvas),
        width: canvas?.width || 0,
        height: canvas?.height || 0,
        cssWidth: rect?.width || 0,
        cssHeight: rect?.height || 0
      }
    };
  });

  assert(initial.nodeCount === 5, `${label}: se esperaban 5 nodos, llegaron ${initial.nodeCount}`);
  assert(initial.currentLevel === 1, `${label}: nivel inicial inválido ${initial.currentLevel}`);
  assert(initial.coins === 48, `${label}: monedas iniciales inválidas ${initial.coins}`);
  assert(initial.canvas.exists, `${label}: Pixi no montó canvas`);
  assert(initial.canvas.width > 0 && initial.canvas.height > 0, `${label}: canvas backing inválido`);
  assert(initial.canvas.cssWidth > 0 && initial.canvas.cssHeight > 0, `${label}: canvas no visible`);

  if (interactive) {
    const canvasBox = await page.locator('#game-host canvas').boundingBox();
    assert(canvasBox, `${label}: no se pudo ubicar el canvas`);

    await page.mouse.click(
      canvasBox.x + initial.node2.x,
      canvasBox.y + initial.node2.y
    );

    await page.waitForFunction(() => {
      const state = window.__SENDA_PREMIUM_TEST__?.snapshot();
      return state?.currentLevel === 2 && state?.coins === 73;
    }, { timeout: 5000 });

    const claimed = await page.evaluate(() => window.__SENDA_PREMIUM_TEST__.snapshot());
    assert(claimed.currentLevel === 2, `${label}: el click no avanzó al nivel 2`);
    assert(claimed.coins === 73, `${label}: la recompensa no dejó 73 monedas`);

    await page.click('#reset-progress');

    await page.waitForFunction(() => {
      const state = window.__SENDA_PREMIUM_TEST__?.snapshot();
      return state?.currentLevel === 1 && state?.coins === 48;
    }, { timeout: 5000 });
  }

  assert(errors.length === 0, `${label}: errores JS: ${errors.join(' | ')}`);

  console.log(`RUNTIME_CASE_OK ${label} nodes=${initial.nodeCount} canvas=${Math.round(initial.canvas.cssWidth)}x${Math.round(initial.canvas.cssHeight)}`);
}

const browser = await chromium.launch({
  headless: true,
  args: [
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader'
  ]
});

try {
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await inspect(mobile, 'mobile-390x844', true);
  await mobile.close();

  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await inspect(desktop, 'desktop-1280x800', false);
  await desktop.close();

  console.log('RUNTIME_BROWSER_CERT_OK');
} finally {
  await browser.close();
}
