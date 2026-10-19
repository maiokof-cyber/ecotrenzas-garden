"""G10 enhanced 2.5D material sprites (transparent) derived from G9 self-authored SVG/PNG candidates.
Deterministic local processing, no licensed art, no external dependencies beyond Pillow/numpy.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter,ImageEnhance
import numpy as np, random, math, json
PROJECT=Path(__file__).resolve().parent.parent
BASE=PROJECT/'public/assets/g9'
OUT=PROJECT/'public/assets/g10';OUT.mkdir(parents=True,exist_ok=True)
R=random.Random(20261019)
def f(v): return int(v)
def base_im(name):
    x=Image.open(BASE/(name+'.png')).convert('RGBA')
    return x.resize((x.width*2,x.height*2),Image.Resampling.LANCZOS)
def noise_brush(im,seed,rough=.18):
    rng=np.random.default_rng(seed);a=np.array(im).astype(np.float32)
    h,w=a.shape[:2]
    # fine matte pigment texture and large mottled hand-painted shading
    coarse=rng.normal(128,36,(max(2,h//24),max(2,w//24))).clip(0,255).astype('uint8')
    coarse=np.asarray(Image.fromarray(coarse).resize((w,h),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(6))).astype(float)-128
    medium=rng.normal(128,38,(max(2,h//8),max(2,w//8))).clip(0,255).astype('uint8')
    medium=np.asarray(Image.fromarray(medium).resize((w,h),Image.Resampling.BILINEAR)).astype(float)-128
    grain=rng.normal(0,7,(h,w))
    factor=1+rough*(coarse/100+medium/185)+grain/255
    factor=np.clip(factor,.68,1.3)
    a[:,:,:3]*=factor[:,:,None]
    a[:,:,:3]=np.clip(a[:,:,:3],0,255)
    return Image.fromarray(a.astype('uint8'),'RGBA')
def alpha_shadow(im,dx=7,dy=10,blur=8,opacity=.36):
    alp=im.getchannel('A'); shadow=Image.new('RGBA',im.size,(0,0,0,0)); alpha=alp.filter(ImageFilter.GaussianBlur(blur)).point(lambda a:int(a*opacity))
    shadow.paste((9,17,12), (dx,dy,dx+im.width,dy+im.height) if False else (dx,dy), alpha)
    # paste with alpha on partly offscreen area may be clipped
    return Image.alpha_composite(shadow,im)
def draw_ornaments(im):
    s=im.width/300; D=ImageDraw.Draw(im,'RGBA')
    # Three-dimensional gold ribs on original arch geometry, hand engraved
    for k in range(17):
        x=(43+k*11.95)*s
        y=(215-93*math.sin(math.pi*k/16))*s
        R.random();radius=R.choice([1.15,1.5,1.9])*s
        D.ellipse((x-radius,y-radius,x+radius,y+radius),fill=(255,229,161,180))
    # carved glints and gems
    for gx,gy in [(150,27),(45,185),(255,184),(90,98),(210,98)]:
        x=gx*s;y=gy*s
        D.line((x-4*s,y,x+4*s,y),fill=(255,250,194,160),width=max(1,int(1.2*s)))
        D.line((x,y-4*s,x,y+4*s),fill=(252,233,177,100),width=max(1,int(1.2*s)))
    return im
def waterfall_detail(im):
    s=im.width/260; D=ImageDraw.Draw(im,'RGBA')
    # layered water flow etched in translucent lines, depth and turbulence
    for i in range(24):
        x=(44+i*3.7+R.uniform(-3,3))*s
        y0=R.uniform(30,80)*s
        h=R.uniform(125,185)*s
        col=R.choice([(220,255,255,120),(153,235,240,104),(251,255,255,115),(159,232,247,54)])
        step=12
        coords=[]
        for j in range(step+1):
            t=j/step
            coords.append((x+(12*math.sin(t*4.0+i*.7)+13*t)*s,y0+h*t))
        D.line(coords,fill=col,width=max(1,int(R.choice([.7,1,1.7])*s)),joint='curve')
    # spray and iridescent whitewater; concentrated at base of falls
    for i in range(190):
        x=R.gauss(146,54)*s;y=R.gauss(247,23)*s
        rad=R.uniform(.4,2.6)*s
        if 0<x<im.width and 0<y<im.height:
            D.ellipse((x-rad,y-rad*.44,x+rad,y+rad*.44),fill=R.choice([(226,251,255,143),(174,239,242,180),(247,255,246,125)]))
    for i in range(22):
        x=R.uniform(80,224)*s;y=R.uniform(207,272)*s
        D.arc((x-18*s,y-7*s,x+18*s,y+7*s),185,344,fill=(229,255,255,R.randint(70,160)),width=max(1,int(1.2*s)))
    return im
def foliage_detail(im):
    s=im.width/325;D=ImageDraw.Draw(im,'RGBA')
    # softly painted foreground botanical leaves, fine veins and scattered blossoms
    for i in range(96):
        x=(R.uniform(0,235))*s; y=R.uniform(25,295)*s
        if x>193*s and y>190*s:continue
        rad=R.uniform(4,11)*s; theta=R.uniform(-math.pi,math.pi)
        dx=math.cos(theta)*rad; dy=math.sin(theta)*rad*.42
        col=R.choice([(39,103,61,155),(103,151,70,190),(183,200,108,112),(42,70,49,175)])
        D.ellipse((x-rad,y-rad*.45,x+rad,y+rad*.45),fill=col)
        D.line((x-dx,y-dy,x+dx,y+dy),fill=(210,232,158,88),width=max(1,int(.65*s)))
    # blossom stamens catching warm sunlight
    for i in range(38):
        x=R.uniform(6,190)*s;y=R.uniform(20,270)*s
        rad=R.uniform(1.1,2.6)*s
        D.ellipse((x-rad,y-rad,x+rad,y+rad),fill=R.choice([(243,178,206,170),(250,229,176,170),(240,229,253,170)]))
    # pollen wisps
    for i in range(24):
        x=R.uniform(20,200)*s;y=R.uniform(5,260)*s
        D.point((x,y),fill=(255,239,165,245))
    return im
records=[]
for index,name in enumerate(['arch_gate','waterfall','foreground_flora']):
    x=noise_brush(base_im(name),1610+index,rough=.21 if name!='waterfall' else .14)
    x={'arch_gate':draw_ornaments,'waterfall':waterfall_detail,'foreground_flora':foliage_detail}[name](x)
    x=alpha_shadow(x,dx=4,dy=5,blur=6,opacity=.22) if name!='waterfall' else x
    dest=OUT/(name+'.png');x.save(dest,optimize=True)
    records.append({'file':dest.name,'size':list(x.size),'bytes':dest.stat().st_size,'transparent':bool(x.getchannel('A').getextrema()[0]==0)})
print(json.dumps(records,indent=2))
