/* EcoTrenzas Garden · G3 procedural 2.5D environment (not approved production sprites).
   Independent visual layer; never reads/writes currency or state. Deterministic composition. */
import {CHAPTERS,nodesForChapter} from '../data/g2-chapters.js';
export const SCENE_WIDTH=960, SCENE_HEIGHT=540;
const TAU=Math.PI*2;
const pal=[
 {sky:['#92c5e2','#fae7ae'],ridge:'#9bb6a0',ridge2:'#588874',stone:'#b1a286',earth:'#674b36',foliage:'#376a48',water:'#7dccd2',accent:'#d9b665',blossom:'#e9a1be'},
 {sky:['#88c7df','#d9f3d9'],ridge:'#85b7a8',ridge2:'#467c77',stone:'#aaab9b',earth:'#536a69',foliage:'#30736a',water:'#72d5dc',accent:'#76ead4',blossom:'#c9e4f8'},
 {sky:['#f9cfae','#ffefcc'],ridge:'#d5aa9b',ridge2:'#8f7f7b',stone:'#c6a08d',earth:'#784e4a',foliage:'#577852',water:'#bde3dd',accent:'#f4d19a',blossom:'#f1a0ba'},
 {sky:['#685986','#cfb8de'],ridge:'#8b83a7',ridge2:'#474868',stone:'#9c8da3',earth:'#4b3d58',foliage:'#365b60',water:'#8bafe1',accent:'#d4baff',blossom:'#cba8fc'},
 {sky:['#a4cba6','#f2e5ad'],ridge:'#91ac88',ridge2:'#547b67',stone:'#a6aa80',earth:'#655643',foliage:'#2e654a',water:'#8bcfb7',accent:'#e2d28d',blossom:'#c6d79b'},
 {sky:['#a7a6ce','#fff0ca'],ridge:'#b6a1bd',ridge2:'#666080',stone:'#b4a5ac',earth:'#544961',foliage:'#38645e',water:'#bdc1f2',accent:'#f7cd72',blossom:'#ee9fda'}
];
function rnd(seed){let n=seed>>>0;return ()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
function ellipse(c,x,y,rx,ry,fill,rotation=0){c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,TAU);c.fill();}
function stroke(c,pts,width,color){c.lineWidth=width;c.strokeStyle=color;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}
function blendGradient(c,y1,y2,top,bottom){const gr=c.createLinearGradient(0,y1,0,y2);gr.addColorStop(0,top);gr.addColorStop(1,bottom);return gr;}
function mountain(c,base,amp,phase,fill){c.fillStyle=fill;c.beginPath();c.moveTo(0,540);c.lineTo(0,base);for(let x=0;x<=960;x+=12)c.lineTo(x,base+Math.sin(x*.012+phase)*amp+Math.sin(x*.029+phase*.7)*amp*.36);c.lineTo(960,540);c.closePath();c.fill();}
function tree(c,x,y,s,p,seed,foreground=false){let r=rnd(seed);c.save();c.translate(x,y);c.scale(s,s);
  ellipse(c,4,3,34,9,'#152f2749');
  const trunk=c.createLinearGradient(-14,0,12,0);trunk.addColorStop(0,'#392e24');trunk.addColorStop(.5,'#97764b');trunk.addColorStop(1,'#38271f');
  c.lineWidth=12;c.strokeStyle=trunk;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-6,-45,7,-75,-4,-107);c.stroke();
  c.lineWidth=6;c.beginPath();c.moveTo(-1,-70);c.lineTo(-35,-105);c.moveTo(2,-90);c.lineTo(31,-119);c.stroke();
  for(let i=0;i<13;i++){let ax=(r()-.5)*104,ay=-110+(r()-.5)*77;const leaf=c.createRadialGradient(ax-7,ay-5,2,ax,ay,30);leaf.addColorStop(0,i%4===0?'#c2d591':i%3===0?'#7faa64':'#72a470');leaf.addColorStop(1,p.foliage);ellipse(c,ax,ay,24+r()*15,19+r()*9,leaf,r()*.6-.3);}
  if(foreground){for(let i=0;i<4;i++){const ax=(r()-.5)*105,ay=-96+(r()-.5)*65;ellipse(c,ax,ay,4,3,p.blossom);}}
  c.restore();
}
function flower(c,x,y,r,p){c.save();c.translate(x,y);c.lineWidth=1.5;c.strokeStyle='#3a6740';c.beginPath();c.moveTo(0,4);c.lineTo(-1,-8);c.stroke();
 for(let i=0;i<5;i++){const a=i*TAU/5;ellipse(c,Math.cos(a)*r*.55,Math.sin(a)*r*.55-9,r*.55,r*.38,p.blossom,a);}ellipse(c,0,-9,r*.34,r*.34,'#ffe6a4');c.restore();}
function stone(c,x,y,s,p){c.save();c.translate(x,y);c.scale(s,s);
  ellipse(c,5,4,21,8,'#21392b4d');c.fillStyle='#6b6554';c.beginPath();c.moveTo(-22,0);c.lineTo(-19,-9);c.lineTo(-9,-16);c.lineTo(10,-18);c.lineTo(23,-6);c.lineTo(24,0);c.closePath();c.fill();
  c.fillStyle=p.stone;c.beginPath();c.moveTo(-22,-7);c.lineTo(-11,-18);c.lineTo(11,-20);c.lineTo(23,-7);c.lineTo(10,-9);c.closePath();c.fill();c.restore();}
function gate(c,x,y,s,p){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#8b623c';c.lineWidth=7;c.beginPath();c.moveTo(-27,10);c.quadraticCurveTo(-34,-45,0,-51);c.quadraticCurveTo(34,-45,27,10);c.moveTo(-22,3);c.lineTo(22,3);c.stroke();
 c.strokeStyle='#e9c176';c.lineWidth=2;c.beginPath();c.moveTo(-26,7);c.quadraticCurveTo(-32,-43,0,-47);c.quadraticCurveTo(30,-43,26,7);c.stroke();
 ellipse(c,0,-45,7,12,p.accent);c.restore();}
function waterfall(c,p){c.save();
 c.fillStyle=p.earth;c.beginPath();c.moveTo(652,315);c.lineTo(790,292);c.lineTo(871,339);c.lineTo(920,483);c.lineTo(795,510);c.lineTo(719,392);c.closePath();c.fill();
 c.fillStyle='#314834';c.beginPath();c.moveTo(646,305);c.lineTo(778,285);c.lineTo(870,326);c.lineTo(825,349);c.lineTo(730,343);c.closePath();c.fill();
 let w=c.createLinearGradient(726,302,852,500);w.addColorStop(0,'#dcfff4');w.addColorStop(.27,p.water);w.addColorStop(.8,'#5493aa');w.addColorStop(1,'#dbedfb');
 c.fillStyle=w;c.beginPath();c.moveTo(727,332);c.bezierCurveTo(743,370,747,427,774,510);c.lineTo(852,502);c.bezierCurveTo(829,427,804,355,801,318);c.closePath();c.fill();
 for(let j=0;j<12;j++){const x=742+j*5;stroke(c,[{x,y:336},{x:x+12,y:408},{x:x+26,y:500}],1.2+(j%3),'#e8ffff92');}
 for(let j=0;j<14;j++)ellipse(c,715+(j*29)%153,501+Math.sin(j*2)*4,12+j%3*3,2,'#edffff75');
 c.restore();}
// Weave the path using a centerline, three interlocking sinusoidal strips, and shadows.
export function pathSamples(chapter){const nodes=nodesForChapter(chapter),out=[];for(let i=0;i<nodes.length-1;i++){const a=nodes[i],b=nodes[i+1],mid=(a.x+b.x)/2;for(let j=0;j<45;j++){const t=j/45,u=1-t;const x=u*u*u*a.x+3*u*u*t*mid+3*u*t*t*mid+t*t*t*b.x;
 const y=u*u*u*a.y+3*u*u*t*(a.y+20)+3*u*t*t*(b.y-20)+t*t*t*b.y;out.push({x,y});}}out.push(nodes[nodes.length-1]);return out;}
function drawBraid(c,chapter,p){const pts=pathSamples(chapter);const curves=[{w:66,clr:'#1a2c225e',dy:20},{w:49,clr:'#4b2c1c',dy:13},{w:37,clr:'#9d6635',dy:8},{w:31,clr:'#d29b52',dy:3}];
 curves.forEach(q=>stroke(c,pts.map(k=>({x:k.x,y:k.y+q.dy})),q.w,q.clr));
 for(let z=0;z<3;z++){const strands=[];for(let i=0;i<pts.length;i++){const prev=pts[Math.max(0,i-1)],next=pts[Math.min(pts.length-1,i+1)],dx=next.x-prev.x,dy=next.y-prev.y,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
 const shift=Math.sin(i*.48+z*TAU/3)*12;strands.push({x:pts[i].x+nx*shift,y:pts[i].y+ny*shift+3});}
 stroke(c,strands,9,z===0?'#ffe0a5':z===1?'#614027':'#ba7b3d');stroke(c,strands.map(v=>({x:v.x,y:v.y-2})),2,z===0?'#fff1cb':'#e6b57b');}
 for(let i=6;i<pts.length-7;i+=8){const a=pts[i];ellipse(c,a.x,a.y+5,2.1,2.1,'#ffeaa4aa');}
}
function balcony(c,x,y){c.save();c.translate(x,y);const wood='#6f5236';for(let i=0;i<4;i++){const xx=i*35;c.strokeStyle=wood;c.lineWidth=7;c.beginPath();c.moveTo(xx,-10);c.lineTo(xx,15);c.stroke();ellipse(c,xx,-11,5,5,'#c9a470');}c.strokeStyle='#a98659';c.lineWidth=4;c.beginPath();c.moveTo(0,-7);c.lineTo(105,-7);c.stroke();c.restore();}
export function paintG3Background(c,chapter){const p=pal[chapter];let r=rnd(2119+chapter*117);c.save();c.clearRect(0,0,960,540);
 c.fillStyle=blendGradient(c,0,455,p.sky[0],p.sky[1]);c.fillRect(0,0,960,540);
 // sun / moon corona and light rays
 const light=c.createRadialGradient(710,100,4,710,100,255);light.addColorStop(0,'#fff9c9a4');light.addColorStop(.34,'#fff9c94a');light.addColorStop(1,'#fff9c900');c.fillStyle=light;c.fillRect(440,0,520,370);ellipse(c,708,110,36,36,chapter===3?'#e4d2ff':'#fff1c2');
 c.fillStyle='#fff7dc26';for(let i=0;i<7;i++){let x=i*165-110;c.beginPath();c.moveTo(705,110);c.lineTo(x,540);c.lineTo(x+55,540);c.closePath();c.fill();}
 // distant clouds
 for(let j=0;j<15;j++){const x=(j*163+chapter*45)%1040-40,y=56+(j*29)%145;ellipse(c,x,y,47+(j%4)*10,14+(j%3)*5,'#fff7df5b');}
 mountain(c,209,31,1.4,p.ridge);mountain(c,275,35,0.2,p.ridge2);
 // soft mist bridge and distant architecture
 c.fillStyle='#f3f2de4a';c.fillRect(0,285,960,65);
 gate(c,175,239,1.3,p);gate(c,510,222,.85,p);
 // far treetops stay behind the clear central path
 for(let i=0;i<13;i++){let x=i*87-60,y=293+(i*11)%41;tree(c,x,y,.32+(i%3)*.06,p,100+i);}
 // island below the foreground path
 c.fillStyle=p.earth;c.beginPath();c.moveTo(0,381);c.bezierCurveTo(185,336,405,384,559,348);c.bezierCurveTo(734,336,824,362,960,357);c.lineTo(960,540);c.lineTo(0,540);c.closePath();c.fill();
 c.fillStyle='#3e6c46';c.beginPath();c.moveTo(0,356);c.bezierCurveTo(180,324,401,348,559,326);c.bezierCurveTo(746,311,814,353,960,332);c.lineTo(960,395);c.bezierCurveTo(672,403,490,392,253,406);c.lineTo(0,411);c.closePath();c.fill();
 for(let i=0;i<18;i++){const x=i*58+14,y=390+(i%4)*25;stone(c,x,y,.35+r()*.4,p);}
 // A waterfall cuts across the high island underneath the braided bridge.
 waterfall(c,p);
 // foreground trees + shrubs BEFORE path (path readable)
 for(let i=0;i<13;i++){let x=i*92-45,y=457+(i%3)*34;ellipse(c,x,y,51,23,'#1d533e');for(let j=0;j<4;j++)ellipse(c,x+(j-1.5)*19,y-(j%2)*16,22,19,j%3===0?'#83a969':'#3e7551');}
 for(let i=0;i<70;i++){let x=(i*113+chapter*61)%975,y=365+(i*47)%174;if(x>710&&x<850&&y>390)continue;ellipse(c,x,y,3+(i%3),7+(i%4),i%3?'#83b56a':'#2a644a',Math.sin(i));if(i%4===0)flower(c,x,y-2,4+(i%3),p);}
 balcony(c,44,438);balcony(c,539,445);
 drawBraid(c,chapter,p);
 // pathway edge greenery and sparks
 for(let i=0;i<23;i++){const pt=pathSamples(chapter)[i*7+2];if(!pt)continue;flower(c,pt.x+19+(i%3)*3,pt.y+31,3+(i%3),p);}
 // Foreground foliage framing
 tree(c,-25,520,.83,p,chapter+500,true);tree(c,984,566,.74,p,chapter+600,true);
 for(let i=0;i<18;i++){let x=r()*960,y=515+r()*48;ellipse(c,x,y,20+r()*24,10+r()*8,i%3?'#21462f':'#587d4b');}
 c.restore();}
export function paintG3Node(c,n,level,t=0,animate=true){const p=pal[Math.floor((n.level-1)/5)];const won=n.level<=level,next=n.level===level+1,epic=n.epic;
 c.save();c.translate(n.x,n.y+(!won&&next&&animate?Math.sin(t*2.5)*2:0));let rx=epic?47:40;
 ellipse(c,4,24,rx+9,16,'#071e196b');
 if(next){const rg=c.createRadialGradient(0,0,6,0,0,65);rg.addColorStop(0,'#ffe6a260');rg.addColorStop(.7,'#ffe6a22b');rg.addColorStop(1,'#ffe6a200');c.fillStyle=rg;c.fillRect(-70,-72,140,145);}
 // stone cliff / sidewalls for raised 2.5D pedestal
 ellipse(c,0,7,rx,28,won?'#60714e':'#5c5b55');c.fillStyle=won?'#73845f':'#706b5e';c.fillRect(-rx+1,3,rx*2-2,15);ellipse(c,0,17,rx,24,'#61513b');ellipse(c,0,2,rx,27,p.stone);
 for(let i=0;i<8;i++){const a=i*TAU/8;ellipse(c,Math.cos(a)*(rx-2),Math.sin(a)*21,7,5,won?'#5a925a':'#5d8766',a);}
 ellipse(c,0,-6,epic?31:25,epic?22:18,won?'#39795d':next?'#c6954e':'#52695d');
 c.lineWidth=epic?5:3;c.strokeStyle=epic?'#fbd880':next?'#fff2ac':'#d8be8c';c.beginPath();c.ellipse(0,-6,epic?31:25,epic?22:18,0,0,TAU);c.stroke();
 c.textAlign='center';c.textBaseline='middle';c.font=`bold ${epic?26:23}px Georgia,serif`;c.lineWidth=2.5;c.strokeStyle='#18362d';c.strokeText(String(n.level),0,-6);c.fillStyle='#fff4d6';c.fillText(String(n.level),0,-6);
 if(epic){for(let k=0;k<7;k++){const a=k*TAU/7;ellipse(c,Math.cos(a)*34,Math.sin(a)*22-6,3.3,6.5,k%2?'#e1a4f2':'#f8d681',a);}}
 c.fillStyle='#1c3d32e0';c.beginPath();c.roundRect(-47,31,94,22,7);c.fill();c.font='bold 11px system-ui,sans-serif';c.fillStyle='#fff3cf';c.fillText(won?'✓ Superado':next?'✦ Próximo':'🔒 Bloqueado',0,42);
 c.restore();}
export function paintG3Particles(c,chapter,t,animate=true){const r=rnd(860+chapter*31);for(let i=0;i<24;i++){const x=r()*960,y=r()*450+25,amp=animate?Math.sin(t*1.3+i)*9:0;const a=.18+.2*(animate?(1+Math.sin(t*2+i))/2:1);ellipse(c,x+amp,y+(animate?Math.sin(t+i)*6:0),2+i%3,2+i%3,`rgba(255,245,194,${a})`);}}
export function imageBackdrop(chapter){const c=document.createElement('canvas');c.width=SCENE_WIDTH;c.height=SCENE_HEIGHT;paintG3Background(c.getContext('2d'),chapter);return c;}
