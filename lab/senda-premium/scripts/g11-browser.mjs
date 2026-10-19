/* G11: real Pixi WebGL art layer + legacy game acceptance; no business side effects. */
import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const URL=process.env.RUNTIME_URL||'http://127.0.0.1:4173/g11.html';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const runs=[];
try{
 for(const [width,height] of [[390,844],[1280,800]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:width===390?'reduce':'no-preference'});
  const page=await ctx.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()} ${r.url()}`)});
  const res=await page.goto(URL,{waitUntil:'domcontentloaded'});assert(res?.ok(),`G11 HTTP ${res?.status()}`);
  const ready=()=>page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady===true,null,{timeout:30000});
  await ready();
  const state=()=>page.evaluate(()=>({s:window.__GARDEN_G4_TEST__.snapshot(),g11:window.__GARDEN_G11_TEST__.snapshot(),overflow:document.documentElement.scrollWidth>innerWidth+2}));
  let x=await state(),d=x.s.rendererDetail;
  assert(x.s.rendererMode==='pixi'&&d?.backend==='webgl'&&d.approvedNodeVerified,'G11 must use approved PixiJS WebGL, not Canvas');
  assert(d.nodeSprites===5&&d.g8DepthLayers===3&&d.g10MaterialCount===3,'Inherited G10 scene missing');
  assert(d.g11ArtTextures===4&&d.g11SkySprites===1&&d.g11DepthSprites===3&&d.g11FullKeyArtUsed===false&&d.g11NoGameStateWrites,'G11 modular art invalid');
  assert(!x.g11.sound.enabled&&!x.overflow&&x.s.coins===48&&x.s.xp===0,'Economy, audio default or mobile overflow');
  assert(d.g8ReducedMotion===(width===390),'Accessibility motion mismatch');
  await page.locator('#g2-map').screenshot({path:`G11_MAP_ZONE1_${width}.png`});
  await page.locator('#next-chapter').click();
  await page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady&&window.__GARDEN_G4_TEST__.snapshot().chapter===1,null,{timeout:30000});
  x=await state();d=x.s.rendererDetail;
  assert(d.g11ArtTextures===4&&d.nodeSprites===5&&x.s.xp===0&&x.s.coins===48,'G11 sprites missing after chapter navigation');
  await page.locator('#g2-map').screenshot({path:`G11_MAP_ZONE2_${width}.png`});
  await page.locator('[data-tab="album"]').click();assert(await page.locator('.g6-fantasy-card').count()===6,'Wooldreads collection lost');
  await page.locator('[data-tab="style"]').click();assert(await page.locator('.g4-family').count()===5,'EcoTienda families lost');
  await page.locator('[data-tab="track"]').click();await ready();
  x=await state();assert(x.s.rendererMode==='pixi'&&x.s.coins===48&&x.s.xp===0&&!x.overflow&&errors.length===0,`G11 regression: ${JSON.stringify({x,errors})}`);
  await page.screenshot({path:`G11_FULL_${width}.png`,fullPage:true});
  runs.push({viewport:`${width}x${height}`,renderer:'pixi-webgl',artTextures:d.g11ArtTextures,nodes:d.nodeSprites,coins:x.s.coins,xp:x.s.xp,reducedMotion:d.g8ReducedMotion,errors});
  await ctx.close();
 }
 writeFileSync('G11_RUNTIME_CERT.json',JSON.stringify({status:'GREEN',runs},null,2));
 console.log('G11_ART_RUNTIME_GREEN '+JSON.stringify(runs));
}finally{await browser.close()}
