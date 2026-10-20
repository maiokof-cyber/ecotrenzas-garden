import{chromium}from'playwright';import{writeFileSync}from'node:fs';
const assert=(v,msg)=>{if(!v)throw Error(msg)};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const results=[];
try{
 for(const [width,height]of[[390,844],[1280,800]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:width===390?'reduce':'no-preference'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url())});
  const res=await page.goto(process.env.RUNTIME_URL||'http://127.0.0.1:4173/g12.html',{waitUntil:'domcontentloaded'});
  assert(res?.ok(),'G12 page HTTP error');
  const ready=()=>page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady===true,null,{timeout:30000});
  await ready();
  const snapshot=()=>page.evaluate(()=>({s:window.__GARDEN_G4_TEST__.snapshot(),g12:window.__GARDEN_G12_TEST__.snapshot(),overflow:document.documentElement.scrollWidth>innerWidth+2}));
  let x=await snapshot(),d=x.s.rendererDetail;
  assert(x.s.rendererMode==='pixi'&&d.backend==='webgl'&&d.approvedNodeVerified&&d.nodeSprites===5,'G12 must run actual Pixi WebGL original nodes');
  assert(d.g11ArtTextures===4&&d.g12Textures===3&&d.g12Braid==='g12-handwoven-path'&&d.g12Ground==='g12-painted-terrain'&&d.g12Foreground==='g12-floral-foreground','G12 environment missing');
  assert(d.g12SpriteSizes.length===3&&d.g12SpriteSizes.every(([w,h])=>w===1920&&h===1080),'G12 high res asset missing');
  assert(!d.g12NodeGeometryChanged&&!d.g12GameplayWrites&&!x.overflow&&!x.g12.sound.enabled,'Gameplay authority or audio/accessibility changed');
  assert(x.s.coins===48&&x.s.xp===0,'Initial economy regression');
  assert(d.g12ReducedMotion===(width===390),'Reduced motion mismatch');
  await page.locator('#g2-map').screenshot({path:`G12_MAP_ZONE1_${width}.png`});
  await page.locator('#next-chapter').click();
  await page.waitForFunction(()=>window.__GARDEN_G4_TEST__?.snapshot()?.sceneReady&&window.__GARDEN_G4_TEST__.snapshot().chapter===1,null,{timeout:30000});
  x=await snapshot();d=x.s.rendererDetail;
  assert(d.g12Textures===3&&d.nodeSprites===5&&x.s.coins===48&&x.s.xp===0,'Changing zone broke G12 or issued rewards');
  await page.locator('#g2-map').screenshot({path:`G12_MAP_ZONE2_${width}.png`});
  await page.locator('[data-tab="album"]').click();assert(await page.locator('.g6-fantasy-card').count()===6,'Six real artwork cards not preserved');
  await page.locator('[data-tab="style"]').click();assert(await page.locator('.g4-family').count()===5,'Five EcoTienda styles not preserved');
  await page.locator('[data-tab="track"]').click();await ready();
  x=await snapshot();assert(x.s.rendererMode==='pixi'&&!x.overflow&&x.s.coins===48&&x.s.xp===0&&errors.length===0,`G12 errors: ${JSON.stringify(errors)}`);
  await page.screenshot({path:`G12_FULL_${width}.png`,fullPage:true});
  results.push({viewport:`${width}x${height}`,backend:d.backend,assets:3,approvedNodes:d.nodeSprites,chapter2:true,coins:x.s.coins,xp:x.s.xp,errors});
  await context.close();
 }
 writeFileSync('G12_RUNTIME_CERT.json',JSON.stringify({status:'GREEN',results},null,2));
 console.log('G12_TERRAIN_RUNTIME_GREEN '+JSON.stringify(results));
}finally{await browser.close();}
