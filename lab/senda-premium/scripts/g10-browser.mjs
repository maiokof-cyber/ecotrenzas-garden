/* One E2E per viewport; verifies real WebGL texture pipeline and preserved business/game contract. */
import { chromium } from 'playwright';
import { writeFileSync,readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root='public/assets/g10/';
const art=['arch_gate.png','waterfall.png','foreground_flora.png'];
const assert=(v,msg)=>{if(!v)throw Error(msg)};
const hashes=Object.fromEntries(art.map(name=>{
  const data=readFileSync(root+name);
  assert(data.length>100000&&data.length<750000,`G10 sprite budget failure ${name}`);
  return [name,createHash('sha256').update(data).digest('hex')];
}));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const URL=process.env.RUNTIME_URL||'http://127.0.0.1:4173/g10.html';
const reports=[];
try{
 for(const [width,height] of [[390,844],[1280,800]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:width===390?'reduce':'no-preference'});
  const page=await ctx.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  const got=await page.goto(URL,{waitUntil:'domcontentloaded'});assert(got?.ok(),'G10 HTTP load');
  const wait=()=>page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady===true,null,{timeout:30000});
  await wait();
  const state=()=>page.evaluate(()=>({
    s:window.__GARDEN_G4_TEST__.snapshot(),
    a:window.__GARDEN_G10_TEST__.snapshot(),
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2
  }));
  let x=await state(),d=x.s.rendererDetail;
  assert(x.s.rendererMode==='pixi'&&d?.backend==='webgl'&&d.approvedNodeVerified,'G10 requires real Pixi + approved node');
  assert(d.nodeSprites===5&&d.g10MaterialCount===3&&d.g10HighResTextures&&d.g10LightSources===2,'G10 art pipeline missing');
  assert(d.g9FarSprites===2&&d.g9NearSprites===2&&d.g8DepthLayers===3,'Scene layering regression');
  assert(!x.a.sound.enabled&&d.g8ReducedMotion===(width===390),'Sound or reduced-motion regression');
  assert(x.s.xp===0&&x.s.coins===48&&!x.horizontalOverflow,'Economic/UI regression');
  await page.locator('#g2-map').screenshot({path:`G10_MAP_ZONE1_${width}.png`});
  await page.locator('#next-chapter').click();
  await page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady===true&&window.__GARDEN_G4_TEST__.snapshot().chapter===1,null,{timeout:30000});
  x=await state();d=x.s.rendererDetail;
  assert(d.g10MaterialCount===3&&d.g10HighResTextures&&d.g10LightSources===2,'G10 material loss on zone change');
  assert(x.s.coins===48&&x.s.xp===0&&x.a.g10ui.notes===1,'G10 unexpected effect or UI label lost');
  await page.locator('#g2-map').screenshot({path:`G10_MAP_ZONE2_${width}.png`});
  await page.locator('button[data-tab="album"]').click();assert(await page.locator('.g6-fantasy-card').count()===6,'G6 cards missing');
  await page.locator('button[data-tab="style"]').click();assert(await page.locator('.g4-family').count()===5,'Commercial families missing');
  await page.locator('button[data-tab="track"]').click();await wait();
  x=await state();assert(x.s.rendererMode==='pixi'&&x.s.coins===48&&x.s.xp===0&&!x.horizontalOverflow&&errors.length===0,`G10 regression ${JSON.stringify({x,errors})}`);
  await page.screenshot({path:`G10_FULL_${width}.png`,fullPage:true});
  reports.push({viewport:`${width}x${height}`,webgl:true,materials:d.g10MaterialCount,highRes:d.g10HighResTextures,lights:d.g10LightSources,xp:x.s.xp,coins:x.s.coins,reducedMotion:d.g8ReducedMotion,errors});
  await ctx.close();
 }
 writeFileSync('G10_ART_RUNTIME_CERT.json',JSON.stringify({status:'GREEN',hashes,reports},null,2));
 console.log('G10_ART_RUNTIME_GREEN '+JSON.stringify(reports));
}finally{await browser.close();}
