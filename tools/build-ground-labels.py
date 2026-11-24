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
    integral=np.pad(inside.astype(int),((1,0),(1,0))).cumsum(0).cumsum(1)
    # Keep short codes visible on narrow wings. Use full names where they fit.
    lines=[code,name] if code.startswith(('E','J','A')) else [code]
    college=code in {'H1','H2','H3','H4'}
    for size in range(22 if college else 15,3,-1):
        font=ImageFont.truetype('C:/Windows/Fonts/msyhbd.ttc',size*scale)
        widths=[font.getlength(t)/scale for t in lines]
        rw=int(np.ceil(max(widths)))+2
        rh=int(np.ceil(size*1.24*len(lines)))+1
        if college:
            # Fit the visible glyphs rather than reserving a full line of leading.
            left,top,right,bottom=font.getbbox(code)
            rw=int(np.ceil((right-left)/scale))+2
            rh=int(np.ceil((bottom-top)/scale))+2
        if rw>w or rh>h:continue
        valid=integral[rh:,rw:]-integral[:-rh,rw:]-integral[rh:,:-rw]+integral[:-rh,:-rw]==rw*rh
        yy,xx=np.where(valid)
        if not len(xx):continue
        j=np.argmin((xx+rw/2-w/2)**2+(yy+rh/2-h/2)**2)
        break
    else:continue
    crop=ground.crop((4*x,4*y,4*(x+w),4*(y+h))).resize((w*scale,h*scale))
    pixels=np.asarray(crop).astype(int)
    clip=Image.fromarray(inside.astype('uint8')*255).resize(crop.size,Image.Resampling.NEAREST)
    interior=np.asarray(clip.filter(ImageFilter.MinFilter(7)))>0
    if not interior.any():continue
    fill=np.median(pixels[interior],axis=0)
    ink=interior & (pixels.mean(2)<fill.mean()-12)
    patch=Image.new('RGBA',crop.size,tuple(fill.astype(int))+(0,))
    patch.putalpha(Image.fromarray(ink.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)))
    draw=ImageDraw.Draw(patch)
    if college:
        draw.text(((xx[j]+rw/2)*scale-(left+right)/2,(yy[j]+rh/2)*scale-(top+bottom)/2),
                  code,font=font,fill='#123d40')
        print(code,size)
    for n,line in enumerate([] if college else lines):
        draw.text(((xx[j]+rw/2)*scale,(yy[j]+(n+.5)*size*1.24+.5)*scale),line,font=font,anchor='mm',fill='#123d40')
    patch.putalpha(Image.fromarray(np.minimum(np.asarray(patch.getchannel('A')),np.asarray(clip))))
    layer.alpha_composite(patch,(x*scale,y*scale))
layer.save(site/'assets/building-labels.webp',lossless=True)
