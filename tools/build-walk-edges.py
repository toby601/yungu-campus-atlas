"""Find short pavement-only approaches from the walking grid to painted buildings."""
import base64,io,json,re
from pathlib import Path
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]/'site'
data,_=json.JSONDecoder().raw_decode((root/'atlas.js').read_text('utf8').split('const buildingData=',1)[1])
mask=np.asarray(Image.open(io.BytesIO(base64.b64decode(data['img']))).convert('L'))
rgb=np.asarray(Image.open(root/'assets/campus.webp').convert('RGB').resize((1244,1265))).astype(int)
r,g,b=rgb.transpose(2,0,1)
paved=(r>220)&(g>207)&(b>165)&(b<242)&(r-b>11)&(g-b>6)
grid=base64.b64decode(re.search("'([^']+)'",(root/'walk-grid.js').read_text())[1])
ends={}
for i in range(1244*1265):
 if not grid[i//8]&(1<<(i%8)):continue
 x,y=i%1244,i//1244
 seen=set()
 for dx,dy in [(0,-1),(-1,0),(0,1),(1,0),(1,1),(-1,1),(1,-1),(-1,-1)]:
  for n in range(1,8):
   xx,yy=x+n*dx,y+n*dy
   idx=int(mask[yy,xx])
   if idx:
    if idx not in seen:
     ends.setdefault(data['items'][idx-1][0],[]).append([i,xx+.5,yy+.5]);seen.add(idx)
    break
   if not paved[yy,xx]:
    # One antialias pixel immediately at the footprint edge.
    # Painted building outlines are up to three map pixels wide.
    # Look across the outline only when it ends on the same footprint.
    for step in (1,2,3):
     ex,ey=xx+step*dx,yy+step*dy
     rr,gg,bb=rgb[yy+(step-1)*dy,xx+(step-1)*dx]
     if gg>rr+8 or bb>rr+8:break
     hit=int(mask[ey,ex])
     if hit:
      if hit not in seen:
       ends.setdefault(data['items'][hit-1][0],[]).append([i,ex+.5,ey+.5]);seen.add(hit)
      break
    break
(root/'walk-edges.js').write_text('const walkEdges='+json.dumps(ends,ensure_ascii=False,separators=(',',':'))+';','utf8')
print('coverage',len(ends),'of',len(data['items']))
