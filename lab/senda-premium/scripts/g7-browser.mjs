/* G7 E2E: sound opt-in, accessible magical reveal, actual Pixi WebGL; no new economy. */
import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
const url=process.env.RUNTIME_URL||'http://127.0.0.1:4173/g7.html';
const assert=(condition,msg)=>{if(!condition)throw Error(msg)};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const records=[];
try{
  for(const [width,height] of [[390,844],[1280,800]]){
    const context=await browser.newContext({viewport:{width,height},reducedMotion:width===390?'reduce':'no-preference'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(`js: ${String(e)}`));
    page.on('response',r=>{if(r.status()>=400)errors.push(`http${r.status()}: ${r.url()}`)});
    const response=await page.goto(url,{waitUntil:'domcontentloaded'});
    assert(response?.ok(),'G7 HTTP failed');
    await page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady===true,null,{timeout:30000});
    const start=await page.evaluate(()=>({g:window.__GARDEN_G4_TEST__.snapshot(),a:window.__GARDEN_G7_TEST__.snapshot()}));
    assert(start.g.rendererMode==='pixi'&&start.g.rendererDetail.backend==='webgl'&&start.g.rendererDetail.nodeSprites===5&&start.g.rendererDetail.approvedNodeVerified,'Real Pixi WebGL or original approved sprite not loaded');
    assert(start.g.coins===48&&start.g.xp===0&&start.a.enabled===false&&start.a.audioEvents===0,'Audio must be OFF by default; economy preserved');
    const sound=page.locator('#g7-sound');
    assert(await sound.getAttribute('aria-pressed')==='false','Wrong audio default');
    await sound.click();
    await page.waitForFunction(()=>window.__GARDEN_G7_TEST__.snapshot().audioReady===true,null,{timeout:5000});
    let audio=await page.evaluate(()=>window.__GARDEN_G7_TEST__.snapshot());
    assert(audio.enabled&&audio.audioEvents>=1,'Explicit sound opt-in failed');
    const beforeMute=audio.audioEvents;
    await sound.click();
    await page.locator('button[data-tab="album"]').click();
    audio=await page.evaluate(()=>window.__GARDEN_G7_TEST__.snapshot());
    assert(!audio.enabled&&audio.audioEvents===beforeMute,'Disabled sound generated an event');
    // Use the real gameplay API via the exact persisted lab key only in isolated browser context.
    await page.evaluate(()=>{
      const key='ecotrenzas-senda-premium-gameplay-v1';
      const state=JSON.parse(localStorage.getItem(key)||'null') || {version:1,coins:48,plots:[null,null,null,null],unlocked:[]};
      state.pigments={rosa:0,violeta:1,azul:2,menta:0,dorado:0};
      localStorage.setItem(key,JSON.stringify(state));
    });
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('button[data-tab="album"]').click();
    await page.waitForFunction(()=>[...document.querySelectorAll('.g6-card-image')].length===6&&[...document.querySelectorAll('.g6-card-image')].every(x=>x.complete&&x.naturalWidth>0),null,{timeout:12000});
    assert(await page.locator('button[data-unlock="niebla_invernal"]').isEnabled(),'Historical pigment recipe unavailable');
    await page.locator('button[data-unlock="niebla_invernal"]').click();
    const dialog=page.locator('#g6-reveal');
    await dialog.waitFor({state:'visible'});
    await page.waitForFunction(()=>window.__GARDEN_G7_TEST__.snapshot().celebrations===1,null,{timeout:5000});
    const reveal=await page.evaluate(()=>({g:window.__GARDEN_G4_TEST__.snapshot(),a:window.__GARDEN_G7_TEST__.snapshot()}));
    assert(reveal.g.coins===88&&reveal.g.xp===90&&reveal.g.unlocked===1,'Historical one-time unlock economy changed');
    assert(reveal.a.audioEvents===0,'Muted reveal triggered audio');
    assert(reveal.a.particleCount===(width===390?0:15),'Reduced motion / particles do not match settings');
    await page.waitForTimeout(350);
    await dialog.screenshot({path:`G7_REVEAL_${width}.png`});
    await dialog.locator('button[data-reveal-action="close"]').click();
    await page.locator('button[data-tab="track"]').click();
    await page.waitForFunction(()=>window.__GARDEN_G4_TEST__.snapshot().sceneReady===true,null,{timeout:30000});
    const finish=await page.evaluate(()=>({g:window.__GARDEN_G4_TEST__.snapshot(),a:window.__GARDEN_G7_TEST__.snapshot(),overflow:document.documentElement.scrollWidth>innerWidth+2}));
    assert(finish.g.rendererMode==='pixi'&&!finish.overflow&&errors.length===0,'Post-reveal Pixi/mobile regression '+JSON.stringify({finish,errors}));
    await page.locator('#g2-map').screenshot({path:`G7_PIXI_MAP_${width}.png`});
    records.push({viewport:`${width}x${height}`,engine:'pixi',webgl:true,originalNode:true,initiallyMuted:true,optInWorked:true,reducedMotion:width===390,celebrations:reveal.a.celebrations,particles:reveal.a.particleCount,coins:finish.g.coins,xp:finish.g.xp,errors});
    await context.close();
  }
  writeFileSync('G7_AUDIOVISUAL_RUNTIME_CERT.json',JSON.stringify({status:'GREEN',records},null,2));
  console.log('G7_AUDIOVISUAL_RUNTIME_GREEN '+JSON.stringify(records));
}finally{await browser.close()}
