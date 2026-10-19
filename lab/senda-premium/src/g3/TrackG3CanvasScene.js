import {nodesForChapter} from '../data/g2-chapters.js';
import {SCENE_WIDTH as W, SCENE_HEIGHT as H,imageBackdrop,paintG3Node,paintG3Particles} from './G3Painter.js';
/* Canvas 2.5D preview: mobile camera keeps nodes readable. No gameplay state mutations. */
export class TrackG3CanvasScene {
 constructor({game,onSelect}){
  this.game=game;this.onSelect=onSelect;this.chapter=0;this.host=null;this.canvas=null;this.ctx=null;
  this.base=null;this.raf=0;this.ro=null;this.last=0;
  this.motion=!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  this.focusX=295;this.view=null;this.drag=null;this.suppressClick=false;
  this.tap=this.tap.bind(this);this.pointerDown=this.pointerDown.bind(this);
  this.pointerMove=this.pointerMove.bind(this);this.pointerUp=this.pointerUp.bind(this);
 }
 async mount(host){
  this.host=host;this.canvas=document.createElement('canvas');
  this.canvas.style.cssText='display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab';
  this.canvas.setAttribute('aria-label','Senda 2.5D, desliza horizontalmente para explorar; usa los botones de nivel para navegación accesible');
  host.appendChild(this.canvas);this.ctx=this.canvas.getContext('2d',{alpha:false});
  this.base=imageBackdrop(this.chapter);
  this.ro=new ResizeObserver(()=>this.resize());this.ro.observe(host);
  this.canvas.addEventListener('click',this.tap);
  this.canvas.addEventListener('pointerdown',this.pointerDown);
  this.canvas.addEventListener('pointermove',this.pointerMove);
  this.canvas.addEventListener('pointerup',this.pointerUp);
  this.canvas.addEventListener('pointercancel',this.pointerUp);
  this.resize();if(this.motion)this.raf=requestAnimationFrame(t=>this.loop(t));
 }
 setChapter(index){
  this.chapter=Math.max(0,Math.min(5,Number(index)||0));
  const nodes=nodesForChapter(this.chapter),lv=this.game.level();
  this.focusX=(nodes.find(n=>n.level===lv+1)||nodes.find(n=>n.level===lv)||nodes[0]).x;
  if(this.ctx){this.base=imageBackdrop(this.chapter);this.draw(performance.now()/1000);}
 }
 focusLevel(level){const n=nodesForChapter(this.chapter).find(n=>n.level===level);if(!n)return;
  this.focusX=n.x;this.draw(performance.now()/1000);
 }
 resize(){if(!this.canvas)return;
  const rect=this.host.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);
  this.canvas.width=Math.max(1,Math.round((rect.width||960)*d));
  this.canvas.height=Math.max(1,Math.round((rect.height||540)*d));
  this.draw(performance.now()/1000);
 }
 camera(){
  const r=this.canvas.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);
  const mobile=w<650;
  const scale=mobile? Math.min(.9,Math.max(.68,w/460)) : Math.min(w/W,h/H);
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const x=mobile?clamp(w/2-this.focusX*scale,Math.min(0,w-W*scale),Math.max(0,w-W*scale)):(w-W*scale)/2;
  const y=mobile?clamp(h*.55-305*scale,Math.min(0,h-H*scale),Math.max(0,h-H*scale)):(h-H*scale)/2;
  return {x,y,scale,w,h,mobile};
 }
 pointerDown(e){if(!this.canvas||e.button!==0)return;
  this.drag={x:e.clientX,focus:this.focusX,moved:false};
  this.canvas.setPointerCapture?.(e.pointerId);
 }
 pointerMove(e){if(!this.drag||!this.camera().mobile)return;
  const delta=e.clientX-this.drag.x;
  if(Math.abs(delta)>8)this.drag.moved=true;
  if(this.drag.moved){this.focusX=Math.max(0,Math.min(W,this.drag.focus-delta/this.camera().scale));
   this.draw(performance.now()/1000);}
 }
 pointerUp(e){if(this.drag?.moved)this.suppressClick=true;
  this.drag=null;
  if(this.canvas?.hasPointerCapture?.(e.pointerId))this.canvas.releasePointerCapture(e.pointerId);
 }
 tap(e){if(this.suppressClick){this.suppressClick=false;return;}
  const r=this.canvas.getBoundingClientRect(),view=this.camera();
  const wx=(e.clientX-r.left-view.x)/view.scale,wy=(e.clientY-r.top-view.y)/view.scale;
  const n=nodesForChapter(this.chapter).find(v=>Math.hypot(wx-v.x,wy-v.y)<56);
  if(n)this.onSelect(n.level);
 }
 loop(time){if(!this.ctx)return;if(time-this.last>65){this.draw(time/1000);this.last=time;}
  this.raf=requestAnimationFrame(t=>this.loop(t));
 }
 draw(seconds=0){if(!this.ctx)return;
  const c=this.ctx,view=this.camera(),d=this.canvas.width/view.w;
  c.setTransform(d,0,0,d,0,0);c.fillStyle='#172b22';c.fillRect(0,0,view.w,view.h);
  c.translate(view.x,view.y);c.scale(view.scale,view.scale);c.drawImage(this.base,0,0);
  const lv=this.game.level();for(const n of nodesForChapter(this.chapter))paintG3Node(c,n,lv,seconds,this.motion);
  paintG3Particles(c,this.chapter,seconds,this.motion);
  this.view=view;
 }
 destroy(){if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;
  this.ro?.disconnect();this.ro=null;
  if(this.canvas){for(const [name,handler] of [['click',this.tap],['pointerdown',this.pointerDown],['pointermove',this.pointerMove],['pointerup',this.pointerUp],['pointercancel',this.pointerUp]])this.canvas.removeEventListener(name,handler);this.canvas.remove();}
  this.canvas=null;this.ctx=null;this.base=null;
 }
}
