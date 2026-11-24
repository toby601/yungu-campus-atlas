"""Trace the exact edges of each integer ID in the ground-floor picking mask."""
import base64, io, json
from collections import defaultdict
from pathlib import Path
import numpy as np
from PIL import Image

site = Path(__file__).resolve().parents[1] / 'site'
data, _ = json.JSONDecoder().raw_decode((site/'atlas.js').read_text('utf8').split('const buildingData=',1)[1])
mask = np.asarray(Image.open(io.BytesIO(base64.b64decode(data['img']))))
def academic_ring_curve(points):
    """Smooth each edge separately so both flat ends retain their corners."""
    pts=np.asarray(points,dtype=float)
    corners=sorted(np.argmin(((pts-tip)**2).sum(axis=1)) for tip in
                   [(502,553),(522,571),(725,646),(752,646)])
    closed=np.vstack((pts,pts))
    def xy(p):return f'{p[0]:.2f},{p[1]:.2f}'
    commands=['M'+xy(pts[corners[0]])]
    for start,end in zip(corners,corners[1:]+[corners[0]+len(pts)]):
        edge=closed[start:end+1]
        if len(edge)<55:
            commands.append('L'+xy(edge[-1]))
            continue
        anchors=[edge[0]]
        for i in range(5,len(edge)-4,5):
            radius=min(12,i,len(edge)-1-i)
            anchors.append(edge[i-radius:i+radius+1].mean(axis=0))
        anchors.append(edge[-1])
        for j,(a,b) in enumerate(zip(anchors,anchors[1:])):
            c1=a+(b-anchors[max(0,j-1)])/6
            c2=b-(anchors[min(len(anchors)-1,j+2)]-a)/6
            commands.append('C'+xy(c1)+' '+xy(c2)+' '+xy(b))
    return ''.join(commands)+'Z'

shapes = []
for idx in range(1,len(data['items'])+1):
    inside = np.pad(mask == idx, 1)
    edges = defaultdict(list)
    for dx,dy,ax,ay,bx,by in [(0,-1,0,0,1,0),(1,0,1,0,1,1),(0,1,1,1,0,1),(-1,0,0,1,0,0)]:
        ys,xs = np.where(inside & ~np.roll(inside,(-dy,-dx),axis=(0,1)))
        for x,y in zip(xs-1,ys-1):
            edges[x+ax,y+ay].append((x+bx,y+by))
    contours=[]
    commands=[]
    while edges:
        start=next(iter(edges))
        points=[start]
        x,y=start
        commands.append(f'M{x} {y}')
        while True:
            end=edges[x,y].pop()
            if not edges[x,y]:del edges[x,y]
            if end==start:break
            points.append(end)
            nx,ny=end
            axis='H' if ny==y else 'V'
            if commands[-1].startswith(axis):commands.pop()
            commands.append(axis+str(nx if ny==y else ny))
            x,y=end
        contours.append(points)
        commands.append('Z')
    ys,xs=np.where(mask==idx)
    shapes.append([int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1),''.join(commands)])
    if data['items'][idx-1][0]=='E10':
        shapes[-1].append(academic_ring_curve(max(contours,key=len)))
(site/'building-shapes.js').write_text('const buildingShapes='+json.dumps(shapes,separators=(',',':'))+';\n',encoding='utf8')
