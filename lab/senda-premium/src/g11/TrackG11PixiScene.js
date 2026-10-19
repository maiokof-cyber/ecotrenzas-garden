/* G11 scenery only: separable painterly candidates from an independent source illustration.
 * The approved master KeyArt is NOT pasted into the game. No XP, coin or commerce writes.
 * Inherits the certified G10/G9/G8 layout, world camera, nodes and lifecycle.
 */
import { Assets, Container, Sprite } from 'pixi.js';
import { TrackG10PixiScene } from '../g10/TrackG10PixiScene.js';
const ART=Object.freeze({
 sky:'assets/g11/sky_dawn.png',
 blossom:'assets/g11/blossom_canopy.png',
 cascade:'assets/g11/cascade_cliff.png',
 motes:'assets/g11/motes.png'
});
export class TrackG11PixiScene extends TrackG10PixiScene {
 constructor(opts){
  super(opts);
  this.g11Textures=null;this.g11Sky=null;this.g11Distant=null;this.g11Pass=0;
  this.g11Tick=null;this.g11Time=0;
 }
 async mount(host){
  const items=await Promise.all(Object.entries(ART).map(async ([key,path])=>[key,await Assets.load(path)]));
  if(this.disposed)return;
  if(items.some(([,tex])=>!tex||tex.width<2||tex.height<2))throw Error('G11_ART_ASSET_MISSING');
  this.g11Textures=Object.fromEntries(items);
  await super.mount(host);
  if(!this.app||this.disposed)return;
  this.g11Tick=()=>{
   if(!this.motion||this.disposed)return;
   this.g11Time+=Math.min(.05,this.app.ticker.deltaMS/1000);
   if(this.g11Sky)this.g11Sky.alpha=.94+.035*Math.sin(this.g11Time*.15);
   const petals=this.g11Distant?.children.find(x=>x.label==='g11-motes');
   if(petals)petals.alpha=.40+.13*Math.sin(this.g11Time*.64);
  };
  this.app.ticker.add(this.g11Tick);
 }
 artSprite(tex,label,x,y,width,height,alpha){
  const s=new Sprite(tex);s.label=label;s.position.set(x,y);s.width=width;s.height=height;
  s.alpha=alpha;s.eventMode='none';return s;
 }
 draw(){
  super.draw();
  if(!this.app||!this.g11Textures||!this.world)return;
  const sky=new Container();sky.label='g11-painterly-sky';sky.eventMode='none';
  sky.addChild(this.artSprite(this.g11Textures.sky,'g11-sky-dawn',0,0,960,245,.96));
  // Sky layer above existing G3 painted backdrop, below all interactive objects.
  this.world.addChildAt(sky,Math.min(1,this.world.children.length));
  const distant=new Container();distant.label='g11-painterly-depth';distant.eventMode='none';
  distant.addChild(this.artSprite(this.g11Textures.blossom,'g11-blossom-canopy',744,138,202,114,.92));
  distant.addChild(this.artSprite(this.g11Textures.cascade,'g11-cascade-cliff',707,280,156,244,.78));
  distant.addChild(this.artSprite(this.g11Textures.motes,'g11-motes',385,70,145,145,.48));
  const index=this.world.children.findIndex(x=>x?.eventMode==='static');
  this.world.addChildAt(distant,index<0?this.world.children.length:index);
  this.g11Sky=sky;this.g11Distant=distant;this.g11Pass++;
  this.positionG11();
 }
 positionG11(){
  if(!this.g11Sky||!this.g11Distant)return;
  const dx=this.focusX-480;
  this.g11Sky.x=dx*.008;
  this.g11Distant.x=-dx*.042;
 }
 layout(){super.layout();this.positionG11();}
 runtimeDiagnostics(){
  return {...super.runtimeDiagnostics(),
   g11ArtTextures:Object.keys(this.g11Textures??{}).length,
   g11SkySprites:this.g11Sky?.children.length??0,
   g11DepthSprites:this.g11Distant?.children.length??0,
   g11LayerPass:this.g11Pass,
   g11PainterlyCandidates:true,
   g11FullKeyArtUsed:false,
   g11NoGameStateWrites:true};
 }
 destroy(){
  if(this.app&&this.g11Tick){this.app.ticker.remove(this.g11Tick);this.g11Tick=null;}
  this.g11Sky=null;this.g11Distant=null;this.g11Textures=null;
  super.destroy();
 }
}
