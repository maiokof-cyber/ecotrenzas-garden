import {chromium} from 'playwright';
import {writeFileSync} from 'node:fs';
const assert=(v,m)=>{if(!v)throw Error(m)};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const results=[];
try{
 for(const [width,height] of [[390,844],[1280,800]]){
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:width===390?'reduce':'no-preference'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()} ${r.url()}`)});
  const url=process.env.RUNTIME_URL||'http://127.0.0.1:4173/g13.html';
  const response=await page.goto(url,{waitUntil:'domcontentloaded'});assert(response?.ok(),'G13 page not available');
  const ready=()=>page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady===true,null,{timeout:35000});
  await ready();
  const snap=()=>page.evaluate(()=>({game:window.__GARDEN_G4_TEST__.snapshot(),g13:window.__GARDEN_G13_TEST__.snapshot(),overflow:document.documentElement.scrollWidth>innerWidth+2}));
  let state=await snap(),d=state.game.rendererDetail;
  assert(state.game.rendererMode==='pixi'&&d.backend==='webgl'&&d.approvedNodeVerified&&d.nodeSprites===5,'Pixi WebGL nodes not verified');
  assert(d.g12Textures===3&&d.g13EnhancedMobileCamera&&d.g13VisualOnly,'G12 visual inheritance missing');
  assert((width===390&&d.g13Zoom>1.14)||(width===1280&&d.g13Zoom===1),'Mobile zoom incorrect');
  assert(state.game.coins===48&&state.game.xp===0&&!state.overflow,'Initial state regression');
  await page.locator('[data-tab="album"]').click();
  assert(await page.locator('.g6-fantasy-card').count()===6,'Six original fantasy arts missing');
  assert(await page.locator('[data-g13="target"]').count()===6,'G13 card goals missing');
  await page.locator('[data-g13="target"][data-card="niebla_invernal"]').click();
  assert((await snap()).g13.guide.goal==='niebla_invernal','Goal not stored in separate preference');
  await page.locator('[data-tab="garden"]').click();
  assert(await page.locator('.g13-guide').count()===1,'G13 garden guide missing');
  assert((await page.locator('.g13-guide').innerText()).includes('Niebla Invernal'),'Goal not shown');
  await page.locator('[data-g13="plant"]').click();
  state=await snap();assert(state.game.coins===44&&state.game.xp===0,'Original planting should deduct only 4 coins');
  assert((await page.locator('.g13-guide').innerText()).includes('cultivo(s) en camino'),'Growth forecast missing');
  await page.locator('[data-tab="track"]').click();await ready();state=await snap();
  assert(state.game.coins===44&&state.game.xp===0&&state.game.rendererMode==='pixi','Gameplay or graphics regressed');
  assert(await page.locator('.g13-track-guide button').count()>=2,'Mobile player actions missing');
  const targetBtn=page.locator('.g3-node-controls button');const touchMin=await targetBtn.first().evaluate(el=>getComputedStyle(el).minHeight);
  assert(parseFloat(touchMin)>=44,'Tap target too small');
  await page.locator('#next-chapter').click();await page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady&&window.__GARDEN_G4_TEST__.snapshot().chapter===1,null,{timeout:35000});
  state=await snap();assert(state.game.rendererDetail.nodeSprites===5&&state.game.coins===44&&state.game.xp===0,'Chapter switching lost progress');
  await page.locator('#g2-map').screenshot({path:`G13_MAP_${width}.png`});
  await page.screenshot({path:`G13_FULL_${width}.png`,fullPage:true});
  assert(errors.length===0,'Browser errors: '+JSON.stringify(errors));
  results.push({viewport:`${width}x${height}`,renderer:'pixi-webgl',zoom:state.game.rendererDetail.g13Zoom,goal:state.g13.guide.goal,coins:state.game.coins,xp:state.game.xp,errors});
  await ctx.close();
 }
 writeFileSync('G13_RUNTIME_CERT.json',JSON.stringify({status:'GREEN',results},null,2));
 console.log('G13_GAMEPLAY_MOBILE_GREEN '+JSON.stringify(results));
}finally{await browser.close()}
