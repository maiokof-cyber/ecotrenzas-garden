#!/usr/bin/env python3
"""G11 modular art candidates derived from a new standalone concept.
The approved Semillero Key Art is REFERENCE ONLY, never input or game background.
Source here is separately generated new concept with demo UI; no text or HUD extracted.
Each exported transparent sprite is positioned separately in PixiJS and carries
no gameplay or commercial state. Requires Pillow only.
"""
from pathlib import Path
from PIL import Image,ImageFilter,ImageDraw,ImageEnhance
from hashlib import sha256
import json, math
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'art-source/g11_concept_ref.webp'
DEST=ROOT/'public/assets/g11'
DEST.mkdir(parents=True,exist_ok=True)
source=Image.open(SRC).convert('RGBA')
assert source.size==(1536,1024),source.size

# Edge-feathering is intentional: no cutout frame / standalone concept pasted whole.
def alpha_taper(img, fn, blur=0):
 w,h=img.size
 mask=Image.new('L',(w,h));m=mask.load()
 for y in range(h):
  for x in range(w):m[x,y]=round(max(0,min(1,fn(x/w,y/h)))*255)
 if blur:mask=mask.filter(ImageFilter.GaussianBlur(blur))
 img.putalpha(mask)
 return img

def smooth(a,b,x):
 v=max(0,min(1,(x-a)/(b-a)))
 return v*v*(3-2*v)

# 960x270 painterly atmospheric panoramic SKy: intentionally excludes every label.
sky=source.crop((692,0,1270,190)).resize((960,245),Image.Resampling.LANCZOS)
sky=alpha_taper(sky,lambda x,y: 1-smooth(.52,1,y))
sky.save(DEST/'sky_dawn.png',optimize=True)

# Tree canopy (no map badges): alternate cloud / near bough source crop.
canopy=source.crop((910,66,1273,250)).resize((340,173),Image.Resampling.LANCZOS)
canopy=alpha_taper(canopy,lambda x,y:smooth(0,.19,y)*(1-smooth(.65,1,y))*smooth(0,.17,x)*(1-smooth(.82,1,x)))
canopy.save(DEST/'blossom_canopy.png',optimize=True)

# Art island: cliffside cascade, distinct from the G10 procedural waterfall.
# Crop x>=1100 to avoid the 'Laguna de Pigmentos' label in the concept.
falls=source.crop((1114,392,1284,813)).resize((196,384),Image.Resampling.LANCZOS)
falls=alpha_taper(falls,lambda x,y:smooth(0,.23,x)*(1-smooth(.67,1,x))*smooth(0,.20,y)*(1-smooth(.72,1,y)))
falls.save(DEST/'cascade_cliff.png',optimize=True)

# Crystal-dust rim: original independent tiny particle texture, no source art/UI.
from PIL import ImageDraw
motes=Image.new('RGBA',(192,192),(0,0,0,0));draw=ImageDraw.Draw(motes,'RGBA')
for i in range(37):
 x=(i*79+12)%184+4;y=(i*53+19)%184+4;size=1+(i%4)
 rgb=[(255,226,152),(245,176,224),(201,231,245)][i%3]
 draw.ellipse((x-size*2,y-size*2,x+size*2,y+size*2),fill=(*rgb,37))
 draw.ellipse((x-size,y-size,x+size,y+size),fill=(*rgb,135))
motes.save(DEST/'motes.png',optimize=True)

metadata={}
for p in sorted(DEST.glob('*.png')):
 raw=p.read_bytes();im=Image.open(p)
 metadata[p.name]={"width":im.width,"height":im.height,"bytes":len(raw),"sha256":sha256(raw).hexdigest()}
(DEST/'g11_manifest.json').write_text(json.dumps({"status":"ART_CANDIDATE_NOT_APPROVED","direction":"KEYART_SEMILLERO_MAGICO_V1","fullSceneUsed":False,"noUserCommerceData":True,"sprites":metadata},indent=2)+'\n')
print(json.dumps(metadata,indent=2))
