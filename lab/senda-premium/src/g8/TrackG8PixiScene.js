/* G8: additive, efficient PixiJS depth layers. No gameplay writes or external assets.
 * All overlays non-interactive; approved sprite remains owned by the G3 Pixi scene.
 */
import {Container, Graphics} from 'pixi.js';
import {TrackG3PixiScene} from '../g3/TrackG3PixiScene.js';

const ACCENTS=[0xffe2a0,0xc7fff0,0xffddba,0xd7c4ff,0xe3f3a5,0xffd7ed];
function streak(x,y,width,color,alpha){
  return new Graphics().moveTo(x,y).lineTo(x+width,y-14).lineTo(x+width*1.1,y+17).lineTo(x-12,y+32).closePath().fill({color,alpha});
}
function leaf(x,y,scale,color,rotation=0){
  const g=new Graphics().ellipse(0,0,12,4.6).fill({color,alpha:.88})
    .moveTo(-11,0).lineTo(12,0).stroke({color:0xe8e4ab,width:.8,alpha:.36});
  g.x=x;g.y=y;g.rotation=rotation;g.scale.set(scale);return g;
}
export class TrackG8PixiScene extends TrackG3PixiScene{
  constructor(opts){super(opts);this.g8Far=null;this.g8Near=null;this.g8Motes=[];this.g8Tick=null;this.g8Time=0;this.g8LayerVersion=0;}
  draw(){
    super.draw();
    if(!this.app||!this.baseTexture)return;
    const far=new Container();far.eventMode='none';far.label='g8-distance-mist';
    // Scene-coordinate thin sunbeams; nodes always rendered above these bands.
    for(let k=0;k<5;k++){
      const x=480+k*98+(this.chapter%2)*35;
      far.addChild(new Graphics().moveTo(690,62).lineTo(x-125,395).lineTo(x+15,395).closePath()
        .fill({color:ACCENTS[this.chapter],alpha:k%2?.033:.052}));
    }
    for(let i=0;i<3;i++){
      far.addChild(new Graphics().ellipse(480+i*31,245+i*42,385-i*37,26+i*2)
        .fill({color:0xf3fff1,alpha:.045+i*.015}));
    }
    this.world.addChildAt(far,1);
    const near=new Container();near.eventMode='none';near.label='g8-near-foliage';
    // Vignette foliage at margins; keep central selectable nodes visible.
    for(let k=0;k<13;k++){
      const left=k%2===0;
      const x=left?5+(k%3)*9:937-(k%3)*9;
      const y=35+k*36;
      near.addChild(leaf(x,y,.75+(k%4)*.19,left?0x356b4b:0x567d53,left?-.35:.35));
    }
    for(let k=0;k<18;k++){
      const x=25+k*52+(k%2)*12;
      const y=522+(k%3)*5;
      near.addChild(leaf(x,y,.8+(k%5)*.19,k%3===0?0x779a52:0x315d48,(k%6-3)*.12));
    }
    const motes=[];
    for(let i=0;i<17;i++){
      const x=51+(i*71)%840,y=57+(i*119)%340;
      const mote=new Graphics().circle(0,0,1.4+(i%3)*.55)
        .fill({color:i%4===0?0xfad9ef:ACCENTS[this.chapter],alpha:.66});
      mote.x=x;mote.y=y;near.addChild(mote);motes.push({sprite:mote,x,y,phase:i*.79});
    }
    this.world.addChild(near);
    this.g8Far=far;this.g8Near=near;this.g8Motes=motes;this.g8LayerVersion++;
    this.positionG8();
  }
  positionG8(){
    if(!this.g8Far||!this.g8Near)return;
    const offset=this.focusX-480;
    this.g8Far.x=offset*.06;
    this.g8Near.x=-offset*.075;
  }
  layout(){super.layout();this.positionG8();}
  async mount(host){
    await super.mount(host);
    if(!this.app||this.disposed)return;
    this.g8Tick=()=>{
      if(!this.motion||this.disposed)return;
      this.g8Time+=this.app.ticker.deltaMS/1000;
      const t=this.g8Time;
      for(const m of this.g8Motes){
        m.sprite.x=m.x+Math.sin(t*.6+m.phase)*7;
        m.sprite.y=m.y+Math.cos(t*.8+m.phase)*5;
        m.sprite.alpha=.35+.33*(1+Math.sin(t*1.5+m.phase))*.5;
      }
      if(this.g8Far)this.g8Far.alpha=.90+.08*Math.sin(t*.22);
    };
    this.app.ticker.add(this.g8Tick);
  }
  runtimeDiagnostics(){
    return {...super.runtimeDiagnostics(),g8DepthLayers:Number(Boolean(this.g8Far))+Number(Boolean(this.g8Near))+1,
      g8FarLayer:this.g8Far?.label,g8NearLayer:this.g8Near?.label,g8Motes:this.g8Motes.length,
      g8ReducedMotion:!this.motion,g8RenderPass:this.g8LayerVersion};
  }
  destroy(){
    if(this.app&&this.g8Tick){this.app.ticker.remove(this.g8Tick);this.g8Tick=null;}
    this.g8Motes=[];this.g8Far=null;this.g8Near=null;
    super.destroy();
  }
}
