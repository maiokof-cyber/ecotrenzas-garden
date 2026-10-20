/* G12: painterly terrain + one handwoven braid following the exact original node spline.
 * Rendering only. No gameplay, economy, CRM or reservation writes.
 * Reuses the verified G11/G10 Pixi scene and approved node asset.
 */
import {Assets, Container, Sprite} from 'pixi.js';
import {TrackG11PixiScene} from '../g11/TrackG11PixiScene.js';
const SOURCES=Object.freeze({
 terrain:'assets/g12/terrain_painterly.png',
 braid:'assets/g12/braided_route.png',
 floral:'assets/g12/foreground_garden.png'
});
const TINTS=[0xffffff,0xd7ffff,0xfff4e4,0xd6d6ff,0xf1ffe6,0xffecf5];
export class TrackG12PixiScene extends TrackG11PixiScene{
 constructor(options){super(options);this.g12Textures=null;this.g12Ground=null;this.g12Route=null;this.g12Front=null;this.g12DrawCount=0;this.g12Tick=null;this.g12Time=0;}
 async mount(host){
  // Assets are present before the base mount calls the polymorphic draw().
  const loaded=await Promise.all(Object.entries(SOURCES).map(async ([k,path])=>[k,await Assets.load(path)]));
  if(this.disposed)return;
  if(loaded.some(([,t])=>!t||t.width!==1920||t.height!==1080))throw Error('G12_ART_RESOLUTION_OR_ASSET_INVALID');
  this.g12Textures=Object.fromEntries(loaded);
  await super.mount(host);
  if(this.disposed||!this.app)return;
  this.g12Tick=()=>{if(!this.motion||this.disposed)return;this.g12Time+=Math.min(.05,this.app.ticker.deltaMS/1000);if(this.g12Route)this.g12Route.alpha=.965+.028*Math.sin(this.g12Time*.62);};
  this.app.ticker.add(this.g12Tick);
 }
 makeSprite(texture,label){
  const sprite=new Sprite(texture);sprite.label=label;sprite.position.set(0,0);sprite.width=960;sprite.height=540;sprite.eventMode='none';return sprite;
 }
 draw(){
  super.draw();
  if(!this.app||!this.world||!this.g12Textures)return;
  // G11 sky remains in front of base backdrop. Cover only the old, flat lower ground.
  const terrain=this.makeSprite(this.g12Textures.terrain,'g12-painted-terrain');terrain.tint=TINTS[this.chapter];
  this.world.addChildAt(terrain,Math.min(2,this.world.children.length));
  // The whole gold braid follows the same cubic controls as the original track.
  // It stays beneath all static (clickable) nodes and above lower terrain.
  const braid=this.makeSprite(this.g12Textures.braid,'g12-handwoven-path');
  const firstNode=this.world.children.findIndex(x=>x?.eventMode==='static');
  this.world.addChildAt(braid,firstNode>=0?firstNode:this.world.children.length);
  // Near-garden is only along the bottom 50px; explicitly ignores pointer events.
  const flowerbed=this.makeSprite(this.g12Textures.floral,'g12-floral-foreground');
  this.world.addChild(flowerbed);
  this.g12Ground=terrain;this.g12Route=braid;this.g12Front=flowerbed;this.g12DrawCount++;
  this.positionG12();
 }
 positionG12(){
  if(!this.g12Ground||!this.g12Route||!this.g12Front)return;
  const offset=this.focusX-480;
  this.g12Ground.x=-offset*.011;this.g12Route.x=0;this.g12Front.x=-offset*.040;
 }
 layout(){super.layout();this.positionG12();}
 runtimeDiagnostics(){return {...super.runtimeDiagnostics(),
  g12Textures:Object.keys(this.g12Textures??{}).length,
  g12Ground:this.g12Ground?.label??null,g12Braid:this.g12Route?.label??null,g12Foreground:this.g12Front?.label??null,
  g12SpriteSizes:[this.g12Ground,this.g12Route,this.g12Front].filter(Boolean).map(x=>[x.texture.width,x.texture.height]),
  g12LayerPass:this.g12DrawCount,g12NodeGeometryChanged:false,g12GameplayWrites:false,
  g12ReducedMotion:!this.motion};}
 destroy(){if(this.app&&this.g12Tick){this.app.ticker.remove(this.g12Tick);this.g12Tick=null;}
  this.g12Ground=null;this.g12Route=null;this.g12Front=null;this.g12Textures=null;super.destroy();}
}
