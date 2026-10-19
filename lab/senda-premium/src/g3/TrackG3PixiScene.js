import {Application,Assets,Container,Graphics,Sprite,Text,Texture} from 'pixi.js';
import {nodesForChapter} from '../data/g2-chapters.js';
import {verifyNodeAsset} from './ApprovedNode.js';
import {SCENE_WIDTH as W,SCENE_HEIGHT as H,imageBackdrop} from './G3Painter.js';
/* G3 Pixi: runtime-generated scenic backdrop + approved original node PNG from repository.
   No composite key art, no sprite extraction, and absolutely no gameplay writes. */
export class TrackG3PixiScene {
 constructor({game,onSelect}){this.game=game;this.onSelect=onSelect;this.chapter=0;this.app=null;this.world=new Container();this.texture=null;this.backdrop=null;this.baseTexture=null;this.ro=null;this.glows=[];this.ambient=[];this.focusX=295;this.drag=null;this.pointerDown=null;this.pointerMove=null;this.pointerUp=null;this.motion=!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);this.disposed=false;this.initialized=false;this.suppressTap=false;this.approvedAsset=null;}
 async mount(host){const bounds=host.getBoundingClientRect();this.app=new Application();await this.app.init({width:Math.max(1,Math.round(bounds.width||960)),height:Math.max(1,Math.round(bounds.height||540)),resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true,backgroundAlpha:0,antialias:true,preference:'webgl',preferWebGLVersion:2});
 this.initialized=true;if(this.disposed){this.app.destroy(true,{children:true});this.app=null;this.initialized=false;return;}
 // Hash/checksum gate before the sprite enters the Pixi scene.
 this.approvedAsset=await verifyNodeAsset();
 if(this.disposed)return;
 this.baseTexture=await Assets.load(this.approvedAsset.url);if(!this.baseTexture||this.baseTexture.width<1)throw Error('G3_APPROVED_NODE_BASE_MISSING');
 if(this.disposed){this.app.destroy(true,{children:true});this.app=null;this.initialized=false;return;}
 host.append(this.app.canvas);this.app.stage.addChild(this.world);this.draw();this.layout();
 // Mobile: drag the world horizontally without changing gameplay or rewards.
 this.app.canvas.style.touchAction='pan-y';
 this.pointerDown=e=>{if(e.button!==0)return;this.drag={x:e.clientX,focus:this.focusX,moved:false};this.suppressTap=false;this.app.canvas.setPointerCapture?.(e.pointerId);};
 this.pointerMove=e=>{if(!this.drag||this.app.screen.width>=650)return;if(Math.abs(e.clientX-this.drag.x)>8){this.drag.moved=true;this.suppressTap=true;}const scale=this.world.scale.x||1;
  this.focusX=Math.max(0,Math.min(W,this.drag.focus-(e.clientX-this.drag.x)/scale));this.layout();};
 this.pointerUp=e=>{this.drag=null;if(this.app?.canvas?.hasPointerCapture?.(e.pointerId))this.app.canvas.releasePointerCapture(e.pointerId);requestAnimationFrame(()=>{this.suppressTap=false});};
 for(const [n,cb] of [['pointerdown',this.pointerDown],['pointermove',this.pointerMove],['pointerup',this.pointerUp],['pointercancel',this.pointerUp]])this.app.canvas.addEventListener(n,cb);
 this.ro=new ResizeObserver(entries=>{const n=entries[0]?.contentRect;if(!n||!this.app?.renderer)return;const w=Math.max(1,Math.round(n.width)),h=Math.max(1,Math.round(n.height));if(this.app.screen.width!==w||this.app.screen.height!==h){this.app.renderer.resize(w,h);this.layout();}});this.ro.observe(host);
 this.app.ticker.add(()=>{if(!this.motion)return;const t=performance.now()/1000;for(const g of this.glows){g.scale.set(1+Math.sin(t*3)*.055);g.alpha=.65+Math.sin(t*3)*.17;}for(const p of this.ambient){p.g.x=p.x+Math.sin(t*.42+p.phase)*p.wobble;p.g.y=p.y+Math.cos(t*.58+p.phase)*7;p.g.alpha=.32+Math.sin(t*1.2+p.phase)*.16;}});
 }
 runtimeDiagnostics(){
 const gl=this.app?.renderer?.context?.gl;
 const sceneNodes=this.world.children.filter(ch=>ch?.eventMode==='static');
 const nodeSprites=sceneNodes.filter(ch=>ch.children?.some(inner=>inner.label==='g3-approved-node-base')).length;
 return {
  engine:'pixi', backend:gl?'webgl':'unknown',
  approvedNodeVerified:this.approvedAsset?.verified===true,
  approvedNodeSHA256:this.approvedAsset?.sha256??null,
  nodeSprites, actualCanvas:this.app?.canvas instanceof HTMLCanvasElement,
  nodeCount:sceneNodes.length,
 };
 }
 setChapter(n){this.chapter=Math.max(0,Math.min(5,Number(n)||0));
 const nodes=nodesForChapter(this.chapter),lvl=this.game.level();
 this.focusX=(nodes.find(v=>v.level===lvl+1)||nodes.find(v=>v.level===lvl)||nodes[0]).x;
 if(this.app&&this.baseTexture){this.draw();this.layout();}}
 focusLevel(level){const n=nodesForChapter(this.chapter).find(n=>n.level===level);
 if(n){this.focusX=n.x;this.layout();}}
 draw(){if(!this.app||!this.baseTexture)return;
 this.world.removeChildren().forEach(child=>child.destroy({children:true}));this.backdrop=null;if(this.texture){this.texture.destroy(true);this.texture=null;}this.glows=[];this.ambient=[];
 // Texture.from(canvas) uses the native CanvasSource supported by PixiJS 8.
 this.texture=Texture.from(imageBackdrop(this.chapter));this.backdrop=new Sprite(this.texture);this.world.addChild(this.backdrop);
 const lv=this.game.level();for(const n of nodesForChapter(this.chapter)){
 const won=n.level<=lv,next=n.level===lv+1,epic=n.epic,g=new Container();g.x=n.x;g.y=n.y;g.eventMode='static';g.cursor='pointer';g.hitArea={contains:(x,y)=>Math.abs(x)<57&&Math.abs(y)<67};g.on('pointertap',()=>{if(!this.suppressTap)this.onSelect(n.level)});
 g.addChild(new Graphics().ellipse(2,25,epic?59:52,18).fill({color:0x09251c,alpha:.48}));
 if(next){const halo=new Graphics().circle(0,0,66).fill({color:0xffd972,alpha:.28});g.addChild(halo);this.glows.push(halo);}
 const stone=new Sprite(this.baseTexture);stone.anchor.set(.5);stone.width=epic?122:111;stone.height=epic?122:111;stone.tint=won?0xffffff:next?0xffefd0:0x9ba69e;stone.alpha=won||next?1:.91;stone.label='g3-approved-node-base';g.addChild(stone);
 g.addChild(new Graphics().ellipse(0,-7,epic?32:26,epic?24:20).fill({color:won?0x397c60:next?0xc59a4f:0x536d5d,alpha:.95}).stroke({width:epic?5:3,color:epic?0xf4d27e:0xe5d2a0}));
 const number=new Text({text:String(n.level),style:{fontFamily:'Georgia,serif',fontSize:epic?25:22,fontWeight:'bold',fill:'#fff7dc',stroke:{color:'#17372b',width:2}}});number.anchor.set(.5);number.y=-8;g.addChild(number);
 g.addChild(new Graphics().roundRect(-48,32,96,23,7).fill({color:0x173a2e,alpha:.94}));const status=new Text({text:won?'✓ Superado':next?'✦ Próximo':'🔒 Bloqueado',style:{fontFamily:'system-ui,sans-serif',fontSize:11,fontWeight:'bold',fill:'#fff5d7'}});status.anchor.set(.5);status.y=43;g.addChild(status);
 this.world.addChild(g);
 }
 // Lightweight atmospheric layer: fireflies and floating petals are visual only.
 // Explicitly decoupled from XP, currency, timers and click hit boxes.
 const fx=new Container();fx.eventMode='none';
 for(let i=0;i<26;i++){
   const x=29+(i*137)%920,y=50+(i*71)%385,phase=i*.83;
   const g=new Graphics();
   if(i%4===0){g.ellipse(0,0,4,2.2).fill({color:0xf3d4c7,alpha:.75});}
   else {g.circle(0,0,2+(i%3)).fill({color:i%3===0?0xd2c7ff:0xffe9ac,alpha:.76});}
   g.x=x;g.y=y;fx.addChild(g);this.ambient.push({g,x,y,phase,wobble:4+(i%5)*2});
 }
 this.world.addChild(fx);
 }
 layout(){if(!this.app)return;
 const w=this.app.screen.width,h=this.app.screen.height,mobile=w<650;
 const s=mobile?Math.min(.9,Math.max(.68,w/460)):Math.min(w/W,h/H);
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 this.world.scale.set(s);
 this.world.x=mobile?clamp(w/2-this.focusX*s,Math.min(0,w-W*s),Math.max(0,w-W*s)):(w-W*s)/2;
 this.world.y=mobile?clamp(h*.55-305*s,Math.min(0,h-H*s),Math.max(0,h-H*s)):(h-H*s)/2;
 }
 destroy(){this.disposed=true;this.ro?.disconnect();this.ro=null;if(this.app&&this.initialized){
 for(const [n,cb] of [['pointerdown',this.pointerDown],['pointermove',this.pointerMove],['pointerup',this.pointerUp],['pointercancel',this.pointerUp]])if(cb)this.app.canvas.removeEventListener(n,cb);
 this.app.destroy(true,{children:true});this.app=null;this.initialized=false;
 }this.texture=null;this.backdrop=null;this.baseTexture=null;this.approvedAsset=null;this.world=new Container();this.glows=[];this.ambient=[];this.drag=null;}
}
