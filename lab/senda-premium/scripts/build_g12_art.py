#!/usr/bin/env python3
"""EcoTrenzas G12 deterministic 2x transparent 2.5D art, independent of gameplay.
Requires Pillow and numpy. Three layers are scene-coordinate 960x540 at DPR2.
"""
from PIL import Image,ImageDraw,ImageFilter
import numpy as np,math,random,hashlib,json
from pathlib import Path
OUT=Path(__file__).resolve().parents[1]/'public/assets/g12';OUT.mkdir(parents=True,exist_ok=True)
S=2; W,H=960,540;SIZE=(W*S,H*S); R=random.Random(1201912)
P=lambda xy:tuple(round(z*S) for z in xy)

def curve(points):
 out=[]
 for a,b in zip(points,points[1:]):
  mx=(a[0]+b[0])/2
  for j in range(50):
   t=j/50;u=1-t
   x=u**3*a[0]+3*u*u*t*mx+3*u*t*t*mx+t**3*b[0]
   y=u**3*a[1]+3*u*u*t*(a[1]+20)+3*u*t*t*(b[1]-20)+t**3*b[1]
   out.append((x,y))
 out.append(points[-1]);return out
NODES=[(105,356),(295,288),(478,338),(667,263),(848,320)];PATH=curve(NODES)

def noise(w,h,scale,seed):
 rng=np.random.default_rng(seed);s=(max(2,int(w/scale)),max(2,int(h/scale)))
 a=rng.integers(0,255,size=(s[1],s[0]),dtype=np.uint8)
 return np.asarray(Image.fromarray(a,'L').resize((w,h),Image.Resampling.BICUBIC),dtype=np.float32)/255

# Ground: warm lush painterly depth with true alpha feathering to blend G11 sky.
w,h=SIZE
Y,X=np.mgrid[0:h,0:w];xf=X/S;yf=Y/S
n1=noise(w,h,44,991);n2=noise(w,h,13,992)
heightline=283+16*np.sin(xf*.013)+6*np.sin(xf*.039+1.4)
edge=np.clip((yf-heightline+21)/34,0,1)
# dramatic sloping terrain with flowered moss, not flat SVG green
valley=np.clip((yf-295)/245,0,1)
texture=(n1-.5)*38+(n2-.5)*16
base=np.zeros((h,w,4),dtype=np.uint8)
base[:,:,0]=np.clip(60+31*valley+texture,0,255).astype('uint8')
base[:,:,1]=np.clip(106+18*(1-valley)+texture*.95,0,255).astype('uint8')
base[:,:,2]=np.clip(73-21*valley+texture*.66,0,255).astype('uint8')
base[:,:,3]=np.clip(edge*255,0,255).astype('uint8')
img=Image.fromarray(base,'RGBA');d=ImageDraw.Draw(img,'RGBA')
# layered ridge brush strokes & rocky shelves: deterministic warm stones and leafy texture
for i in range(62):
 x=R.uniform(-20,990); y=R.uniform(318,536);rr=R.uniform(18,70)
 if R.random()<.37:
  col=R.choice([(35,62,58,130),(49,69,67,140),(115,95,71,160),(152,132,91,95)])
  d.ellipse(P((x-rr,y-rr*.24,x+rr,y+rr*.26)),fill=col)
  d.arc(P((x-rr,y-rr*.25,x+rr,y+rr*.27)),190,340,fill=(228,190,119,65),width=2*S)
# lower elevation cliffs on right with edge highlights, flowers and moss
for i in range(15):
 x=R.uniform(30,955);y=R.uniform(375,570)
 rr=R.uniform(10,39)
 d.polygon([P(p) for p in [(x-rr,y),(x-rr*.76,y-rr*.6),(x+rr*.5,y-rr*.75),(x+rr,y-rr*.1),(x+rr*.28,y+rr*.35)]],fill=R.choice([(44,65,60,70),(89,91,71,95),(66,75,70,90)]))
 d.line([P((x-rr*.76,y-rr*.6)),P((x+rr*.5,y-rr*.75)),P((x+rr,y-rr*.1))],fill=(207,181,126,45),width=2*S)
# painted brush vegetation around the bridge but carefully below node hitboxes
for i in range(880):
 x=R.uniform(-8,968);y=R.uniform(330,552)
 # don't busy the interactive path itself
 min_dist=min(math.hypot(x-q[0],y-q[1]) for q in PATH[::12]);
 if min_dist<39 and y<405: continue
 rad=R.uniform(1.3,7.2); t=R.random()
 palette=[(26,82,54,185),(57,118,68,177),(92,142,71,145),(130,171,85,115),(181,177,92,110),(224,199,125,95)]
 c=palette[min(5,int(t*len(palette)))]; d.ellipse(P((x-rad*.9,y-rad*.48,x+rad,y+rad*.46)),fill=c)
 if i%21==0:
  d.line([P((x,y+3)),P((x-2,y-7))],fill=(32,88,65,172),width=2*S)
  color=R.choice([(255,205,158,225),(247,166,202,225),(227,193,255,225)])
  for k in range(5):
   a=k*math.tau/5;px=x+math.cos(a)*4.5;py=y-8+math.sin(a)*4.5
   d.ellipse(P((px-3,py-2.8,px+3,py+2.8)),fill=color)
  d.ellipse(P((x-1.7,y-9.5,x+1.7,y-6.2)),fill=(255,228,139,245))
# small directional painterly flecks especially at bottom, gentle glow
for i in range(310):
 x=R.uniform(0,960);y=R.uniform(378,540)
 if R.random()<.5:d.line([P((x,y)),P((x+R.uniform(3,11),y-2))],fill=(204,218,125,R.randint(42,102)),width=S)
img.save(OUT/'terrain_painterly.png',optimize=True)

# Handwoven strand path, actual node Bèzier controls unchanged. Separate layer, no UI labels.
route=Image.new('RGBA',SIZE,(0,0,0,0));
soft=Image.new('RGBA',SIZE,(0,0,0,0));sd=ImageDraw.Draw(soft,'RGBA')
for dy,ww,color in [(19,66,(17,24,17,132)),(12,53,(34,35,23,220)),(5,44,(64,43,26,255)),(0,40,(135,87,44,255))]:
 pts=[P((x,y+dy)) for x,y in PATH]
 sd.line(pts,fill=color,width=int(ww*S),joint='curve')
route=Image.alpha_composite(route,soft.filter(ImageFilter.GaussianBlur(2*S)));d=ImageDraw.Draw(route,'RGBA')
for dy,ww,color in [(14,50,(48,32,25,255)),(8,44,(92,51,31,255)),(4,39,(177,111,56,255)),(1,32,(223,161,84,255)),(-2,19,(249,203,121,243))]:
 d.line([P((x,y+dy)) for x,y in PATH],fill=color,width=ww*S,joint='curve')
# woven cords cross with tangible raised threads and micro-highlights
for strand in range(3):
 q=[]
 for i,(x,y) in enumerate(PATH):
  p1=PATH[max(0,i-1)];p2=PATH[min(len(PATH)-1,i+1)]
  dx=p2[0]-p1[0];dy=p2[1]-p1[1];ll=math.hypot(dx,dy) or 1
  normal=(-dy/ll,dx/ll)
  offset=7.5*math.sin(i*.22+strand*math.tau/3)
  q.append((x+offset*normal[0],y+offset*normal[1]+1))
 d.line([P(t) for t in q],fill=[(129,82,48,232),(177,113,64,248),(238,184,100,255)][strand],width=7*S,joint='curve')
 d.line([P((x,y-1.9)) for x,y in q],fill=[(222,162,99,211),(245,200,139,226),(255,236,182,232)][strand],width=2*S,joint='curve')
# decorative braiding knots along center path with directional stitches
for j in range(3,len(PATH)-3,13):
 x,y=PATH[j];p=PATH[j-2];q=PATH[j+2]; angle=math.atan2(q[1]-p[1],q[0]-p[0]);nx=-math.sin(angle);ny=math.cos(angle)
 r=R.uniform(6,11)
 d.line([P((x-nx*r,y-ny*r+1)),P((x+nx*r,y+ny*r+1))],fill=(248,208,136,92),width=S)
 d.ellipse(P((x-1.8,y-1.8,x+1.8,y+1.8)),fill=(255,232,151,190))
# small floral vine along margins keeping interactable stone nodes clear
for idx in range(15,len(PATH)-15,19):
 x,y=PATH[idx];nn=PATH[idx-3];pp=PATH[idx+3];dx=pp[0]-nn[0];dy=pp[1]-nn[1];ll=math.hypot(dx,dy) or 1; nx=-dy/ll;ny=dx/ll
 for sg in [-1,1]:
  px=x+nx*29*sg;py=y+ny*29*sg+9
  d.ellipse(P((px-3,py-4,px+3,py+4)),fill=(55,107,59,230));d.ellipse(P((px+3,py-2,px+9,py+2)),fill=(120,174,82,195))
  if idx%3==0:
   d.ellipse(P((px-2,py-9,px+4,py-3)),fill=(246,175,192,220))
route.save(OUT/'braided_route.png',optimize=True)

# foreground canopy microdetail: only edges and lower strip, noninteractive.
fore=Image.new('RGBA',SIZE,(0,0,0,0));d=ImageDraw.Draw(fore,'RGBA')
for i in range(500):
 x=R.uniform(-60,1010);y=R.uniform(490,575)
 if 170<x<770 and y<510:continue
 rr=R.uniform(2.5,19);c=R.choice([(32,79,54,188),(45,104,56,210),(71,125,57,210),(112,155,78,172),(143,167,87,140)])
 d.ellipse(P((x-rr,y-rr*.55,x+rr,y+rr*.45)),fill=c)
 if i%21==0:
  f=R.choice([(251,199,205,245),(248,224,141,255),(226,170,242,236)])
  for k in range(6):
   ang=k*math.tau/6;xx=x+math.cos(ang)*7;yy=y+math.sin(ang)*7
   d.ellipse(P((xx-4,yy-4,xx+4,yy+4)),fill=f)
  d.ellipse(P((x-3,y-3,x+3,y+3)),fill=(255,241,163,245))
fore.save(OUT/'foreground_garden.png',optimize=True)
manifest={'version':'G12-candidate-v1','scene_coordinates':[960,540],'pixel_ratio':2,'node_layout':NODES,'node_layout_modified':False,'assets':{}}
for name in ['terrain_painterly.png','braided_route.png','foreground_garden.png']:
 p=OUT/name;manifest['assets'][name]={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'dimensions':[1920,1080]}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps(manifest,indent=2))
