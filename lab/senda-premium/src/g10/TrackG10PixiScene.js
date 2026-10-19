/* G10: production-candidate material textures on the G9 2.5D renderer.
 * Keeps G9 scene lifecycle & parallax, replaces texture lookup only.
 * Luminous layers are cosmetic and have no gameplay authority.
 */
import { Container, Graphics } from 'pixi.js';
import { TrackG9PixiScene } from '../g9/TrackG9PixiScene.js';
const MATERIALS=Object.freeze({
  arch:'assets/g10/arch_gate.png',
  waterfall:'assets/g10/waterfall.png',
  foliage:'assets/g10/foreground_flora.png'
});
export class TrackG10PixiScene extends TrackG9PixiScene {
  constructor(options){
    super({...options,g9AssetPaths:MATERIALS});
    this.g10Lighting=null;this.g10RenderPass=0;
  }
  draw(){
    super.draw();
    if(!this.app||!this.g9Textures||!this.world)return;
    const layer=new Container(); layer.label='g10-cinematic-lighting';layer.eventMode='none';
    const lights=[{x:183,y:149,color:0xffe3ad,base:77},{x:807,y:368,color:0x9fecfa,base:58}];
    for(const light of lights){
      const g=new Container();g.label='g10-light-source';g.eventMode='none';
      // Low-cost painterly atmospheric bloom, rather than shader/package dependency.
      for(let n=8;n>=1;n--){
        const rad=light.base*(n/8);
        g.addChild(new Graphics().circle(0,0,rad).fill({color:light.color,alpha:.005+(9-n)*.0018}));
      }
      g.position.set(light.x,light.y);layer.addChild(g);
    }
    const nodeIndex=this.world.children.findIndex(c=>c?.eventMode==='static');
    this.world.addChildAt(layer,nodeIndex<0?this.world.children.length:nodeIndex);
    this.g10Lighting=layer;this.g10RenderPass++;
  }
  runtimeDiagnostics(){
    const parent=super.runtimeDiagnostics();
    return {...parent,g10MaterialCount:this.g9AssetsCount,
      g10HighResTextures:Object.values(this.g9Textures??{}).every(t=>t.width>=500 && t.height>=500),
      g10LightSources:this.g10Lighting?.children.length??0,
      g10RenderPass:this.g10RenderPass,g10MaterialTier:'painted-candidate'};
  }
  destroy(){this.g10Lighting=null;super.destroy();}
}
