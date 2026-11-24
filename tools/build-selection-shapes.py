"""Trace the exact edges of each integer ID in the ground-floor picking mask."""
import base64, io, json
from collections import defaultdict
from pathlib import Path
import numpy as np
from PIL import Image

site = Path(__file__).resolve().parents[1] / 'site'
data, _ = json.JSONDecoder().raw_decode((site/'atlas.js').read_text('utf8').split('const buildingData=',1)[1])
mask = np.asarray(Image.open(io.BytesIO(base64.b64decode(data['img']))))
# Clockwise outer facade, from the east tip around to the northwest tip.
# Shared edges are exact subcurves; splitting a cubic does not change its shape.
ring_outer=np.array([
    [(752,647),(755,728),(691,799),(608,799)],
    [(608,799),(524,799),(461,731),(461,650)],
    [(461,650),(461,612),(477,578),(502,553)]
],dtype=float)

def xy(p):return f'{p[0]:.4f},{p[1]:.4f}'

def cubic(seg):return 'C'+' '.join(xy(p) for p in seg[1:])

def split_cubic(segment,t):
    a,b,c,d=segment
    ab,bc,cd=(1-t)*segment[:-1]+t*segment[1:]
    u,v=(1-t)*np.array([ab,bc])+t*np.array([bc,cd])
    mid=(1-t)*u+t*v
    return np.array([a,ab,u,mid]),np.array([mid,v,cd,d])

def seam(segment,first,last):
    def parameter(axis,value):
        lo,hi=0.,1.
        increasing=segment[-1,axis]>segment[0,axis]
        for _ in range(40):
            t=(lo+hi)/2
            if (split_cubic(segment,t)[0][-1,axis]<value)==increasing:lo=t
            else:hi=t
        return (lo+hi)/2
    a,b=parameter(*first),parameter(*last)
    lo,hi=sorted((a,b))
    prefix=split_cubic(segment,hi)[0]
    part=split_cubic(prefix,lo/hi)[1]
    if a>b:part=part[::-1]
    return 'M'+xy(part[0])+cubic(part)

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
        if np.linalg.norm(edge[0]-ring_outer[0,0])<2 and np.linalg.norm(edge[-1]-ring_outer[-1,-1])<2:
            commands.extend(cubic(seg) for seg in ring_outer)
            continue
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

def simplify_edge(points):
    a,b=points[0],points[-1]
    delta=b-a
    t=np.clip((points-a)@delta/max(delta@delta,1),0,1)
    errors=np.linalg.norm(points-a-t[:,None]*delta,axis=1)
    split=int(errors.argmax())
    if errors[split]<=1.1:
        return [a,b]
    return simplify_edge(points[:split+1])[:-1]+simplify_edge(points[split:])

def facade_path(contour):
    points=np.asarray(contour,dtype=float)
    split=int(np.linalg.norm(points-points[0],axis=1).argmax())
    corners=simplify_edge(points[:split+1])[:-1]+simplify_edge(
        np.vstack((points[split:],points[0])))[:-1]
    if len(corners)<3:
        corners=list(points)
    def xy(p):return f'{p[0]:.2f},{p[1]:.2f}'
    commands=[]
    for i,corner in enumerate(corners):
        prev=corners[i-1]-corner
        after=corners[(i+1)%len(corners)]-corner
        incoming=corner+prev*min(.45,.65/max(np.linalg.norm(prev),.01))
        outgoing=corner+after*min(.45,.65/max(np.linalg.norm(after),.01))
        commands.append(('M' if i==0 else 'L')+xy(incoming)+'Q'+xy(corner)+' '+xy(outgoing))
    return ''.join(commands)+'Z'

ground=np.asarray(Image.open(site/'assets/campus-detail.webp').convert('RGB'))
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
    elif data['items'][idx-1][0].startswith(('C','D','E','F','G','H')):
        surface=''.join(facade_path(c) for c in contours)
        if data['items'][idx-1][0]=='E0':
            left,top,right,bottom=shapes[-1][:4]
            rx,ry=(right-left)/2,(bottom-top)/2
            cy=top+ry
            surface=f'M{left},{cy}a{rx},{ry} 0 1,0 {2*rx},0a{rx},{ry} 0 1,0 {-2*rx},0Z'
        # The west wing belongs to E7. Only the two necks flank the open court.
        # Follow the ring with a continuous curve instead of tracing its pixel steps.
        if data['items'][idx-1][0]=='E6':
            surface='M436 759H456V774H488V756H502Q511 766 521 773V811H501V817H488V805H426V792H421V769H436Z'
        code=data['items'][idx-1][0]
        if code=='E1':
            surface=seam(ring_outer[0],(1,724),(1,694))+'H803V707H810V724H802V731H788V724Z'
        elif code=='E2':
            surface=seam(ring_outer[0],(0,680),(1,746))+'H787L788 731H801V745L810 746V764H804V778H761L760 786H745L744 778H712V786H680Z'
        elif code=='E5':
            surface=seam(ring_outer[1],(0,550),(0,583))+'V864L605 865V879H584L583 888H562V879H550Z'
        elif code=='E7':
            surface=seam(ring_outer[1],(1,715),(1,756))+'H488V748H456V759H436V758H400V740H407V724H436V715Z'
        elif code=='E9':
            surface=seam(ring_outer[2],(1,600),(1,632))+'H385V631H378V615H384V601H385V600Z'
        color=np.median(ground[ys*4+2,xs*4+2],axis=0).astype(int)
        shapes[-1].extend([surface,'#%02x%02x%02x'%tuple(color)])
(site/'building-shapes.js').write_text('const buildingShapes='+json.dumps(shapes,separators=(',',':'))+';\n',encoding='utf8')
