/* G9: independent transparent production-candidate sprites authored for Semillero.
 * The G8/G3 worlds, approved node hash and gameplay stay entirely untouched.
 * Sprite paths are local, no network calls to third-party services.
 */
import { Assets, Container, Sprite } from 'pixi.js';
import { TrackG8PixiScene } from '../g8/TrackG8PixiScene.js';
const IMAGES = {
  arch: 'assets/g9/arch_gate.png',
  waterfall: 'assets/g9/waterfall.png',
  foliage: 'assets/g9/foreground_flora.png',
};
export class TrackG9PixiScene extends TrackG8PixiScene {
  constructor(opts){
    super(opts);
    this.g9Textures=null;this.g9Far=null;this.g9Near=null;this.g9AssetsCount=0;
    this.g9Tick=null;this.g9Time=0;this.g9LastDraw=0;
  }
  async mount(host){
    // Load before the base mount invokes this.draw(). A stale scene is never attached.
    const items=await Promise.all(Object.entries(IMAGES).map(async ([key,path])=>[key,await Assets.load(path)]));
    if(this.disposed)return;
    this.g9Textures=Object.fromEntries(items);
    if(items.some(([,tex])=>!tex||tex.width<2||tex.height<2))throw Error('G9_SPRITE_ASSET_MISSING');
    this.g9AssetsCount=items.length;
    await super.mount(host);
    if(!this.app||this.disposed)return;
    this.g9Tick=()=>{
      if(!this.motion||this.disposed)return;
      this.g9Time+=this.app.ticker.deltaMS/1000;
      const waterfall=this.g9Far?.children.find(x=>x.label==='g9-waterfall');
      if(waterfall)waterfall.alpha=.74+.09*Math.sin(this.g9Time*1.7);
      const near=this.g9Near;
      if(near)near.alpha=.93+.07*Math.sin(this.g9Time*.6);
    };
    this.app.ticker.add(this.g9Tick);
  }
  addSprite(layer, texture, label,{x,y,w,h,alpha=1,flip=false}){
    const sprite=new Sprite(texture);
    sprite.label=label;sprite.x=x;sprite.y=y;sprite.width=w;sprite.height=h;
    if(flip){sprite.anchor.x=1;sprite.scale.x*=-1;}
    sprite.alpha=alpha;sprite.eventMode='none';
    layer.addChild(sprite);return sprite;
  }
  draw(){
    super.draw();
    if(!this.app||!this.g9Textures||!this.world)return;
    const far=new Container();far.label='g9-background-art';far.eventMode='none';
    const near=new Container();near.label='g9-foreground-art';near.eventMode='none';
    this.addSprite(far,this.g9Textures.arch,'g9-arch',{x:83,y:119,w:218,h:190,alpha:.96});
    this.addSprite(far,this.g9Textures.waterfall,'g9-waterfall',{x:698,y:315,w:194,h:222,alpha:.80});
    this.addSprite(near,this.g9Textures.foliage,'g9-flora-left',{x:-90,y:260,w:247,h:270,alpha:.91});
    this.addSprite(near,this.g9Textures.foliage,'g9-flora-right',{x:823,y:282,w:231,h:246,alpha:.91,flip:true});
    // Far artwork is ABOVE the painted backdrop but BEHIND all interactive nodes.
    const firstNode=this.world.children.findIndex(ch=>ch?.eventMode==='static');
    this.world.addChildAt(far,firstNode>=0?firstNode:2);
    // Foreground leaf artwork is non-interactive and can never cover the central controls.
    this.world.addChild(near);
    this.g9Far=far;this.g9Near=near;this.g9LastDraw++;
    this.positionG9();
  }
  positionG9(){
    if(!this.g9Far||!this.g9Near)return;
    const dx=this.focusX-480;
    this.g9Far.x=dx*.037;
    this.g9Near.x=-dx*.095;
  }
  layout(){super.layout();this.positionG9();}
  runtimeDiagnostics(){
    return {...super.runtimeDiagnostics(),g9AssetTextures:this.g9AssetsCount,
      g9FarLayer:this.g9Far?.label,g9NearLayer:this.g9Near?.label,
      g9FarSprites:this.g9Far?.children.length??0,
      g9NearSprites:this.g9Near?.children.length??0,
      g9ArtPass:this.g9LastDraw,
      g9SpriteAlpha:this.g9Near?.children.every(ch=>ch.alpha<=1)??false};
  }
  destroy(){
    if(this.app&&this.g9Tick){this.app.ticker.remove(this.g9Tick);this.g9Tick=null;}
    this.g9Far=null;this.g9Near=null;this.g9Textures=null;
    super.destroy();
  }
}
