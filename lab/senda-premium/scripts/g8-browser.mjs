/* G8: true WebGL acceptance. Does not modify shared player data or production. */
import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
const URL=process.env.RUNTIME_URL||'http://127.0.0.1:4173/g8.html';
const assert=(ok,what)=>{if(!ok)throw Error(what)};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const records=[];
try{
 for(const [width,height] of [[390,844],[1280,800]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:width===390?'reduce':'no-preference'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP_${r.status()} ${r.url()}`)});
  const response=await page.goto(URL,{waitUntil:'domcontentloaded'});
  assert(response?.ok(),'G8 HTTP load failure');
  await page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady===true,null,{timeout:25000});
  const getState=()=>page.evaluate(()=>({engine:window.__GARDEN_G4_TEST__.snapshot(),world:window.__GARDEN_G8_TEST__.snapshot(),overflow:document.documentElement.scrollWidth>innerWidth+2}));
  let {engine,world,overflow}=await getState();
  assert(engine.rendererMode==='pixi'&&engine.rendererDetail?.backend==='webgl','G8 requires PixiJS WebGL, Canvas fallback is NOT a pass');
  assert(engine.rendererDetail?.approvedNodeVerified===true&&engine.rendererDetail?.nodeSprites===5&&engine.rendererDetail?.nodeCount===5,'Original approved sprite missing');
  assert(engine.rendererDetail?.g8DepthLayers===3&&engine.rendererDetail?.g8Motes===17,'Depth planes were not rendered');
  assert(world.world.activeZone===1&&world.world.plaqueCount===1,'Initial G8 lore plaque missing');
  assert(world.sound.enabled===false,'No autoplay or unsolicited audio consent');
  assert(engine.coins===48&&engine.xp===0&&!overflow,'Fresh economy or mobile viewport changed');
  assert(engine.rendererDetail?.g8ReducedMotion===(width===390),'Reduce-motion contract broken');
  const firstPass=engine.rendererDetail.g8RenderPass;
  await page.locator('#next-chapter').click();
  await page.waitForFunction(()=>window.__GARDEN_G4_TEST__.snapshot().rendererDetail?.g8RenderPass>1,null,{timeout:10000});
  ({engine,world,overflow}=await getState());
  assert(world.world.activeZone===2&&world.world.plaqueCount===1,'Chapter atmosphere did not advance');
  assert(engine.coins===48&&engine.xp===0,'Visual interaction affected XP or coins');
  assert(engine.rendererDetail.nodeCount===5&&engine.rendererDetail.g8DepthLayers===3,'Scene leaked nodes across chapters');
  await page.locator('#g2-map').screenshot({path:`G8_PIXI_MAP_${width}.png`});
  await page.screenshot({path:`G8_FULL_${width}.png`,fullPage:true});
  await page.locator('button[data-tab="album"]').click();
  assert(await page.locator('.g6-fantasy-card').count()===6,'Historical Wooldreads collection changed');
  await page.locator('button[data-tab="style"]').click();
  assert(await page.locator('.g4-family').count()===5,'Commercial style atlas changed');
  await page.locator('button[data-tab="track"]').click();
  await page.waitForFunction(()=>window.__GARDEN_G4_TEST__.snapshot().sceneReady===true,null,{timeout:25000});
  const final=await getState();
  assert(final.engine.rendererMode==='pixi'&&final.engine.rendererDetail?.g8DepthLayers===3,'G8 lost WebGL depth after tab switch');
  assert(final.engine.xp===0&&final.engine.coins===48&&!final.overflow&&errors.length===0,'Runtime regressions '+JSON.stringify({final,errors}));
  records.push({viewport:`${width}x${height}`,renderer:'pixi-webgl',depthPlanes:3,nodeSprites:5,approvedNode:true,activeZone:world.world.activeZone,motes:17,reducedMotion:width===390,coins:48,xp:0,errors});
  await context.close();
 }
 writeFileSync('G8_ATMOSPHERE_RUNTIME_CERT.json',JSON.stringify({status:'GREEN',records},null,2));
 console.log('G8_ATMOSPHERE_RUNTIME_GREEN '+JSON.stringify(records));
}finally{await browser.close();}
