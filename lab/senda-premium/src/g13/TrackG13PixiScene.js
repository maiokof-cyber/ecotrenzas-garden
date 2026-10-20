/* G13 mobile camera: enlarge only the viewing transform, not hitboxes or levels. */
import {TrackG12PixiScene} from '../g12/TrackG12PixiScene.js';
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export class TrackG13PixiScene extends TrackG12PixiScene{
  constructor(options){super(options);this.g13Zoom=1;}
  layout(){
    super.layout();
    if(!this.app||!this.world)return;
    const w=this.app.screen.width,h=this.app.screen.height;
    if(w>=650){this.g13Zoom=1;return;}
    const base=this.world.scale.x,s=base*1.18;
    this.world.scale.set(s);this.g13Zoom=s/base;
    this.world.x=clamp(w/2-this.focusX*s,Math.min(0,w-960*s),Math.max(0,w-960*s));
    this.world.y=clamp(h*.55-305*s,Math.min(0,h-540*s),Math.max(0,h-540*s));
  }
  runtimeDiagnostics(){return {...super.runtimeDiagnostics(),g13Zoom:this.g13Zoom,g13EnhancedMobileCamera:true,g13VisualOnly:true};}
}
