/* E2E: real PixiJS + WebGL, transparent modular texture loading, economy untouched. */
import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
const URL=process.env.RUNTIME_URL||'http://127.0.0.1:4173/g9.html';
const assert=(ok,reason)=>{if(!ok)throw Error(reason)};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const records=[];
try{
 for(const [width,height] of [[390,844],[1280,800]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:width===390?'reduce':'no-preference'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP_${r.status()} ${r.url()}`)});
  const response=await page.goto(URL,{waitUntil:'domcontentloaded'});assert(response?.ok(),'G9 HTTP page failure');
  await page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady===true,null,{timeout:28000});
  const snap=()=>page.evaluate(()=>({
    e:window.__GARDEN_G4_TEST__.snapshot(),w:window.__GARDEN_G9_TEST__.snapshot(),
    overflow:document.documentElement.scrollWidth>innerWidth+2,
  }));
  let state=await snap(),d=state.e.rendererDetail;
  assert(state.e.rendererMode==='pixi'&&d?.backend==='webgl','G9 cannot pass with Canvas fallback');
  assert(d?.approvedNodeVerified&&d?.nodeSprites===5,'Original approved node lost');
  assert(d.g8DepthLayers===3&&d.g9AssetTextures===3&&d.g9FarSprites===2&&d.g9NearSprites===2,'Independent G9 art missing');
  assert(d.g9SpriteAlpha&&d.g9ArtPass>=1,'G9 transparency / drawing lost');
  assert(state.e.coins===48&&state.e.xp===0&&!state.overflow,'Player economy or mobile layout regressed');
  assert(d.g8ReducedMotion===(width===390),'Motion accessibility regression');
  assert(state.w.sound.enabled===false,'G7 default audio must remain OFF');
  assert(state.w.artUI.notes===1,'G9 art status label missing');
  await page.locator('#g2-map').screenshot({path:`G9_MAP_ZONE1_${width}.png`});
  await page.locator('#next-chapter').click();
  await page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady===true && window.__GARDEN_G4_TEST__.snapshot().chapter===1 && window.__GARDEN_G9_TEST__?.snapshot()?.world.activeZone===2,null,{timeout:25000});
  state=await snap();d=state.e.rendererDetail;
  assert(d?.g9AssetTextures===3&&d.g9FarSprites===2&&d.g9NearSprites===2&&d.nodeSprites===5,'Artwork lost on chapter transition');
  assert(state.e.xp===0&&state.e.coins===48&&!state.overflow,'G9 environment granted resources');
  await page.locator('#g2-map').screenshot({path:`G9_MAP_ZONE2_${width}.png`});
  await page.screenshot({path:`G9_FULL_${width}.png`,fullPage:true});
  await page.locator('button[data-tab="album"]').click();
  assert(await page.locator('.g6-fantasy-card').count()===6,'G6 collection lost');
  await page.locator('button[data-tab="style"]').click();
  assert(await page.locator('.g4-family').count()===5,'EcoTienda service atlas lost');
  await page.locator('button[data-tab="track"]').click();
  await page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady===true,null,{timeout:25000});
  state=await snap();d=state.e.rendererDetail;
  assert(state.e.rendererMode==='pixi'&&d?.g9FarSprites===2&&d?.nodeSprites===5&&errors.length===0,'WebGL or navigation regression '+JSON.stringify({state,errors}));
  records.push({viewport:`${width}x${height}`,webgl:true,approvedNode:true,artTextures:d.g9AssetTextures,artSprites:d.g9FarSprites+d.g9NearSprites,coins:state.e.coins,xp:state.e.xp,reducedMotion:d.g8ReducedMotion,errors});
  await context.close();
 }
 writeFileSync('G9_ART_RUNTIME_CERT.json',JSON.stringify({status:'GREEN',records},null,2));
 console.log('G9_ART_RUNTIME_GREEN '+JSON.stringify(records));
}finally{await browser.close();}
