/* Strict real PixiJS browser acceptance. Requires npm install and original SHA-approved node PNG.
   Never accepts canvas-fallback as a passing run. No gameplay mutations beyond this isolated lab. */
import { chromium } from 'playwright';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const URL = process.env.RUNTIME_URL || 'http://127.0.0.1:4173/g5.html';
const record=[];
const browser=await chromium.launch({
  ...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),
  headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']
});
try {
  for (const [width,height] of [[390,844],[1280,800]]) {
    const ctx=await browser.newContext({viewport:{width,height}});
    const page=await ctx.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP_${r.status()} ${r.url()}`)});
    const response=await page.goto(URL,{waitUntil:'domcontentloaded'});
    if(!response?.ok())throw Error(`HTTP_${response?.status()}`);
    await page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot?.()?.sceneReady===true,{},{timeout:20000});
    let initial=await page.evaluate(()=>window.__GARDEN_G4_TEST__.snapshot());
    if(initial.rendererMode!=='pixi'||initial.rendererDetail?.backend!=='webgl'||!initial.rendererDetail?.approvedNodeVerified||initial.rendererDetail?.nodeSprites!==5)
      throw Error('PIXIJSGREEN_REQUIRED: '+JSON.stringify(initial));
    if(initial.xp!==0||initial.coins!==48)throw Error('GAMEPLAY_INITIAL_STATE_INVALID');
    if(await page.locator('#g2-map canvas').count()!==1)throw Error('PIXI_CANVAS_MISSING');
    await page.locator('[data-node="2"]').click();
    if((await page.evaluate(()=>window.__GARDEN_G4_TEST__.snapshot())).xp!==0)throw Error('NODE_AWARDED_XP');
    await page.locator('button[data-chapter="5"]').click();
    await page.waitForFunction(()=>window.__GARDEN_G4_TEST__.snapshot().sceneReady===true,{},{timeout:20000});
    if((await page.evaluate(()=>window.__GARDEN_G4_TEST__.snapshot())).rendererMode!=='pixi')throw Error('PIXI_LOST_ON_CHAPTER_CHANGE');
    await page.locator('button[data-tab="style"]').click();
    if(await page.locator('.g4-family').count()!==5)throw Error('ATLAS_INCOMPLETE');
    await page.locator('button[data-service="minibraids"]').click();
    if((await page.evaluate(()=>window.__GARDEN_G4_TEST__.snapshot())).coins!==48)throw Error('STYLES_AWARDED_COINS');
    await page.locator('button[data-tab="garden"]').click();
    await page.locator('button[data-plot="plant"]').first().click();
    if((await page.evaluate(()=>window.__GARDEN_G4_TEST__.snapshot())).coins!==44)throw Error('PLANT_COST_CHANGED');
    await page.locator('button[data-tab="track"]').click();
    await page.waitForFunction(()=>window.__GARDEN_G4_TEST__.snapshot().sceneReady===true,{},{timeout:20000});
    const after=await page.evaluate(()=>({s:window.__GARDEN_G4_TEST__.snapshot(),overflow:document.documentElement.scrollWidth>innerWidth+2}));
    if(after.s.rendererMode!=='pixi'||after.overflow||errors.length)throw Error('RUNTIME_REGRESSION '+JSON.stringify({after,errors}));
    await page.locator('#g2-map').screenshot({path:`G5_PIXI_MAP_${width}.png`});
    await page.screenshot({path:`G5_PIXI_${width}.png`,fullPage:true});
    record.push({viewport:`${width}x${height}`,mode:after.s.rendererMode,sha256:after.s.rendererDetail?.approvedNodeSHA256,nodes:after.s.rendererDetail?.nodeSprites,coins:after.s.coins,xp:after.s.xp,errors});
    await ctx.close();
  }
  writeFileSync('G5_PIXI_RUNTIME_CERT.json',JSON.stringify({status:'GREEN',record},null,2));
  console.log('G5_PIXI_RUNTIME_GREEN '+JSON.stringify(record));
} finally {await browser.close();}
