"""Rebuild the transparent ground-floor label overlay from the building hit mask."""
import base64, io, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

site = Path(__file__).resolve().parents[1] / 'site'
data, _ = json.JSONDecoder().raw_decode((site/'atlas.js').read_text('utf8').split('const buildingData=',1)[1])
mask = np.asarray(Image.open(io.BytesIO(base64.b64decode(data['img']))))
ground = Image.open(site/'assets/campus-detail.webp').convert('RGB')
scale = 3
layer = Image.new('RGBA', (1244*scale,1265*scale))
for idx, (code,name,category) in enumerate(data['items'],1):
    ys,xs=np.where(mask==idx)
    if not len(xs):continue
    x,y=xs.min(),ys.min()
    w,h=xs.max()-x+1,ys.max()-y+1
    inside=mask[y:y+h,x:x+w]==idx
    # C17 uses 15 map units. Anchor every label inside its own footprint.
    size=15
    font=ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc',size*scale)
    lines=[code,name] if code.startswith(('E','J','A')) else [code]
    while True:
        boxes=[font.getbbox(line,anchor='mm') for line in lines]
        half_w=int(np.ceil(max(max(-l,r) for l,t,r,b in boxes)/scale))
        half_h=int(np.ceil(max(max(-t,b) for l,t,r,b in boxes)/scale
                           +(len(lines)-1)*size*.62))
        padded=np.pad(inside.astype(int),((half_h,half_h),(half_w,half_w)))
        sums=np.pad(padded,((1,0),(1,0))).cumsum(0).cumsum(1)
        hbox,wbox=2*half_h+1,2*half_w+1
        coverage=sums[hbox:,wbox:]-sums[:-hbox,wbox:]-sums[hbox:,:-wbox]+sums[:-hbox,:-wbox]
        best=coverage[inside].max()
        if len(lines)==1 or best==hbox*wbox:
            break
        lines=[code]
    yy,xx=np.where(inside & (coverage==best))
    j=np.argmin((xx-(w-1)/2)**2+(yy-(h-1)/2)**2)
    crop=ground.crop((4*x,4*y,4*(x+w),4*(y+h))).resize((w*scale,h*scale))
    pixels=np.asarray(crop).astype(int)
    clip=Image.fromarray(inside.astype('uint8')*255).resize(crop.size,Image.Resampling.NEAREST)
    interior=np.asarray(clip.filter(ImageFilter.MinFilter(7)))>0
    if not interior.any():continue
    fill=np.median(pixels[interior],axis=0)
    ink=interior & (pixels.mean(2)<fill.mean()-12)
    patch=Image.new('RGBA',crop.size,tuple(fill.astype(int))+(0,))
    patch.putalpha(Image.fromarray(ink.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)))
    patch.putalpha(Image.fromarray(np.minimum(np.asarray(patch.getchannel('A')),np.asarray(clip))))
    layer.alpha_composite(patch,(x*scale,y*scale))
    draw=ImageDraw.Draw(layer)
    for n,line in enumerate(lines):
        anchor_y=y+yy[j]+(n-(len(lines)-1)/2)*size*1.24
        draw.text(((x+xx[j])*scale,anchor_y*scale),line,font=font,anchor='mm',fill='#123d40')
layer.save(site/'assets/building-labels.webp',lossless=True)
