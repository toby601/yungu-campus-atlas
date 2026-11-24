"""Extract conservative one-map-unit walking cells from the approved G raster."""
from pathlib import Path
import base64,io,json
from PIL import Image
root=Path(__file__).resolve().parents[1]
image=Image.open(root/'site/assets/campus.webp').convert('RGB')
w,h=1244,1265
# Sample the full road pixel so narrow paths survive downsampling.
import numpy as np
from PIL import ImageFilter
rgb=np.asarray(image.resize((w,h),Image.Resampling.BOX)).astype(int)
r,g,b=rgb.transpose(2,0,1)
paved=(r>220)&(g>207)&(b>165)&(b<243)&(r-b>11)&(g-b>6)
# Bridge threshold lines can divide two paved surfaces. Fill short neutral
# seams only where pavement continues on opposite sides.
closed=np.asarray(Image.fromarray(paved.astype('uint8')*255).filter(
 ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7)))>0
neutral=(r>=g-2)&(g>=b)&(r-b<75)&(r>120)
paved |= closed & neutral
data,_=json.JSONDecoder().raw_decode((root/'site/atlas.js').read_text('utf8').split('const buildingData=',1)[1])
buildings=np.asarray(Image.open(io.BytesIO(base64.b64decode(data['img']))).convert('L'))
paved &= buildings==0
paved[:116]=False
paved[1151:]=False
paved[:,:115]=False
paved[:,1126:]=False
bits=np.packbits(paved.ravel(),bitorder='little').tobytes()
# Keep the connected campus walking network; isolated pale pixels can
# otherwise attract a gate endpoint underneath a printed label.
remaining={i for i in range(w*h) if bits[i//8] & (1<<(i%8))}
largest=set()
while remaining:
 component={remaining.pop()};stack=list(component)
 while stack:
  i=stack.pop()
  for j in (i-1,i+1,i-w,i+w):
   if j in remaining and abs(j%w-i%w)<=1:
    remaining.remove(j);component.add(j);stack.append(j)
 if len(component)>len(largest):largest=component
bits=bytearray(len(bits))
for i in largest:bits[i//8]|=1<<(i%8)
# Separate each lower path from the bridge deck on both approaches.
# walking.js connects the two outer cells directly underneath each deck.
for x, y0, y1 in [(585,362,371),(617,356,367),(776,380,390),
                   (801,391,401),(845,458,464),(870,476,484)]:
 for y in range(y0,y1+1):
  i=y*w+x
  bits[i//8] &= ~(1<<(i%8))
print("connected cells",len(largest))
(root/'site/walk-grid.js').write_text("const walkBits=atob('"+base64.b64encode(bits).decode()+"');\n",encoding='utf8')
