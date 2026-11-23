"""Trace the exact edges of each integer ID in the ground-floor picking mask."""
import base64, io, json
from collections import defaultdict
from pathlib import Path
import numpy as np
from PIL import Image

site = Path(__file__).resolve().parents[1] / 'site'
data, _ = json.JSONDecoder().raw_decode((site/'atlas.js').read_text('utf8').split('const buildingData=',1)[1])
mask = np.asarray(Image.open(io.BytesIO(base64.b64decode(data['img']))))
shapes = []
for idx in range(1,len(data['items'])+1):
    inside = np.pad(mask == idx, 1)
    edges = defaultdict(list)
    for dx,dy,ax,ay,bx,by in [(0,-1,0,0,1,0),(1,0,1,0,1,1),(0,1,1,1,0,1),(-1,0,0,1,0,0)]:
        ys,xs = np.where(inside & ~np.roll(inside,(-dy,-dx),axis=(0,1)))
        for x,y in zip(xs-1,ys-1):
            edges[x+ax,y+ay].append((x+bx,y+by))
    commands=[]
    while edges:
        start=next(iter(edges))
        x,y=start
        commands.append(f'M{x} {y}')
        while True:
            end=edges[x,y].pop()
            if not edges[x,y]:del edges[x,y]
            if end==start:break
            nx,ny=end
            axis='H' if ny==y else 'V'
            if commands[-1].startswith(axis):commands.pop()
            commands.append(axis+str(nx if ny==y else ny))
            x,y=end
        commands.append('Z')
    ys,xs=np.where(mask==idx)
    shapes.append([int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1),''.join(commands)])
(site/'building-shapes.js').write_text('const buildingShapes='+json.dumps(shapes,separators=(',',':'))+';\n',encoding='utf8')
