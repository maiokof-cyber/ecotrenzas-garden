/* G6 card presentation acceptance on ACTUAL PixiJS WebGL (never Canvas fallback). */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const URL=process.env.RUNTIME_URL||'http://127.0.0.1:4173/g6.html';
const records=[];
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
try{
  for(const [width,height] of [[390,844],[1280,800]]){
    const context=await browser.newContext({viewport:{width,height},reducedMotion:width===390?'reduce':'no-preference'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP_${r.status()} ${r.url()}`)});
    const response=await page.goto(URL,{waitUntil:'domcontentloaded'});assert(response?.ok(),`HTTP_${response?.status()}`);
    await page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot?.()?.sceneReady===true,null,{timeout:25000});
    const start=await page.evaluate(()=>window.__GARDEN_G4_TEST__.snapshot());
    assert(start.rendererMode==='pixi'&&start.rendererDetail?.backend==='webgl'&&start.rendererDetail?.nodeSprites===5&&start.rendererDetail?.approvedNodeVerified,'G6 must use certified PixiJS WebGL + original node');
    assert(start.coins===48&&start.xp===0,'Fresh original economy changed');
    await page.locator('button[data-tab="album"]').click();
    assert(await page.locator('.g6-fantasy-card').count()===6,'Missing original six fantasy cards');
    const imgs=page.locator('.g6-card-image');
    await page.waitForFunction(()=>[...document.querySelectorAll('.g6-card-image')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:12000});
    assert(await imgs.count()===6,'Six images required');
    assert(await page.locator('.g6-locked').count()===6,'Cards should start undiscovered');
    await page.evaluate(()=>{
      const key='ecotrenzas-senda-premium-gameplay-v1';
      const state=JSON.parse(localStorage.getItem(key)||'null') || {version:1,coins:48,plots:[null,null,null,null],unlocked:[]};
      state.pigments={rosa:0,violeta:1,azul:2,menta:0,dorado:0};
      localStorage.setItem(key,JSON.stringify(state));
    });
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('button[data-tab="album"]').click();
    const unlock=page.locator('button[data-unlock="niebla_invernal"]');
    assert(await unlock.isEnabled(),'Card should be unlockable from the correct historical pigment recipe');
    await unlock.click();
    const dialog=page.locator('#g6-reveal');
    await dialog.waitFor({state:'visible'});
    assert(await dialog.evaluate(el=>el.open===true),'Accessible modal must be opened');
    assert(await dialog.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0),'Full-resolution original card image missing');
    await page.screenshot({path:`G6_REVEAL_${width}.png`});
    let after=await page.evaluate(()=>window.__GARDEN_G4_TEST__.snapshot());
    assert(after.unlocked===1&&after.xp===90&&after.coins===88,'Historical unlock XP / coin reward modified: '+JSON.stringify(after));
    await dialog.locator('[data-reveal-action="close"]').click();
    assert(await unlock.isDisabled(),'Owned card should not award again');
    await page.reload({waitUntil:'domcontentloaded'});
    after=await page.evaluate(()=>window.__GARDEN_G4_TEST__.snapshot());
    assert(after.unlocked===1&&after.xp===90&&after.coins===88,'Persistence or one-time reward failed');
    await page.locator('button[data-tab="style"]').click();
    assert(await page.locator('.g4-family').count()===5,'Five commercial families not preserved');
    await page.waitForFunction(()=>[...document.querySelectorAll('.g6-choice-visual img')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:12000});
    await page.locator('button[data-tab="track"]').click();
    await page.waitForFunction(()=>window.__GARDEN_G4_TEST__.snapshot().sceneReady===true,null,{timeout:25000});
    const end=await page.evaluate(()=>({s:window.__GARDEN_G4_TEST__.snapshot(),overflow:document.documentElement.scrollWidth>innerWidth+2}));
    assert(end.s.rendererMode==='pixi'&&!end.overflow&&errors.length===0,'G6 integration regression '+JSON.stringify({end,errors}));
    await page.locator('button[data-tab="album"]').click();
    await page.screenshot({path:`G6_ALBUM_${width}.png`,fullPage:true});
    await page.locator('button[data-tab="track"]').click();
    await page.waitForFunction(()=>window.__GARDEN_G4_TEST__.snapshot().sceneReady===true,null,{timeout:25000});
    await page.locator('#g2-map').screenshot({path:`G6_PIXI_MAP_${width}.png`});
    records.push({viewport:`${width}x${height}`,engine:'pixi',webgl:true,originalNode:end.s.rendererDetail.approvedNodeVerified,cards:6,serviceFamilies:5,uniqueUnlock:true,xp:after.xp,coins:after.coins,errors});
    await context.close();
  }
  writeFileSync('G6_CARD_RUNTIME_CERT.json',JSON.stringify({status:'GREEN',records},null,2));
  console.log('G6_CARD_RUNTIME_GREEN '+JSON.stringify(records));
}finally{await browser.close();}
