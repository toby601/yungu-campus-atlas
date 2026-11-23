"""Extract conservative one-map-unit walking cells from the approved G raster."""
from pathlib import Path
import base64
from PIL import Image
root=Path(__file__).resolve().parents[1]
image=Image.open(root/'site/assets/campus.webp').convert('RGB')
w,h=1244,1265
bits=bytearray((w*h+7)//8)
for y in range(h):
 for x in range(w):
  px,py=x,y
  if not (115<=px<=1125 and 116<=py<=1150):continue
  samples=[image.getpixel((4*px+dx,4*py+dy)) for dx,dy in [(0,0),(-2,0),(2,0),(0,-2),(0,2)]]
  if all(r>223 and g>210 and 175<b<240 and r-b>13 and g-b>7 for r,g,b in samples):
   i=y*w+x;bits[i//8]|=1<<(i%8)
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
print("connected cells",len(largest))
(root/'site/walk-grid.js').write_text("const walkBits=atob('"+base64.b64encode(bits).decode()+"');\n",encoding='utf8')
