
const el=id=>document.getElementById(id),map=el('map');let mode='b1',z=1,x=560,y=370,drag=null;
function render(){const campus=el("area").value==="campus",left=campus?196:0,width=campus?1244*.585:1120,height=campus?1265*.585:740,ratio=map.clientWidth/Math.max(1,map.clientHeight)||1,w=Math.max(width,height*ratio)/z,h=w/ratio;x=w>=width?left+width/2:Math.min(left+width-w/2,Math.max(left+w/2,x));const clearance=matchMedia('(pointer:coarse), (max-width:740px)').matches?Math.min(height*.34,h*.32):0;
const verticalLimit=Math.max(0,(height-h)/2)+clearance;
y=Math.max(height/2-verticalLimit,Math.min(height/2+verticalLimit,y));map.setAttribute('viewBox',[x-w/2,y-h/2,w,h].join(' '));el('zo').value=Math.round(z*100)+'%';for(const k of ['b1','b2']){el(k).style.display=mode===k?'inline':'none';el(k).style.opacity=1-el('fade').value/100}el('fade').disabled=mode==='ground';el('base').style.opacity=1-el('pale').value/100;el('fo').value=el('fade').value+'%';el('po').value=el('pale').value+'%';for(const b of document.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',b.dataset.mode===mode);el('legend').textContent={b1:'青色范围为 B1 可辨地下室，未确认的边界和通道留空。',b2:'琥珀色点为学术会堂地上定位。局部 B2 的边界与通道留空。',ground:'地上参照图 · 学术环核心区'}[mode]}
function zoom(f,a=x,b=y){let n=Math.min(32,Math.max(.5,z*f));x=a+(x-a)*z/n;y=b+(y-b)*z/n;z=n;render()}
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{mode=b.dataset.mode;render()};el('fade').oninput=el('pale').oninput=render;el('plus').onclick=()=>zoom(1.5);el('minus').onclick=()=>zoom(1/1.5);el('reset').onclick=()=>{z=1;x=560;y=370;render()};map.onwheel=e=>{e.preventDefault();const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(map.getScreenCTM().inverse());zoom(Math.exp(-Math.sign(e.deltaY)*.2),p.x,p.y)};map.onkeydown=e=>{const v={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(v){e.preventDefault();x+=v[0]*60/z;y+=v[1]*60/z;render()}};render();const prevRender=render;render=function(){prevRender();const west=el('area').value==='west';el('west').style.display=west?'inline':'none';el('base').style.display=west?'none':'inline';el('westbase').style.opacity=el('base').style.opacity;el('westlines').style.display=mode==='b1'?'inline':'none';el('westlines').style.opacity=1-el('fade').value/100;document.querySelector('[data-mode=b2]').hidden=west;if(west){el('b1').style.display=el('b2').style.display='none';el('legend').textContent=mode==='ground'?'西侧 C 区 · 地上参照图':'蓝线为报告图 2-5 的 C 区 B1 可辨边界。表 2-5 范围线面积 5.4416 公顷；东侧接合处留空。'}};el('fade').oninput=el('pale').oninput=render;el('area').onchange=()=>{if(el('area').value==='west'&&mode==='b2')mode='b1';z=1;x=560;y=370;render()};render();const renderOtherRegions=render;render=function(){renderOtherRegions();const active=el('area').value==='south';el('south').style.display=active?'inline':'none';const btn=document.querySelector('[data-mode=b2]');btn.textContent=active?'B2 学术交流中心':'B2 会堂定位';if(!active)return;for(const id of ['base','b1','b2','west'])el(id).style.display='none';el('sGround').style.opacity=1-el('pale').value/100;for(const id of ['sB1','sB2']){el(id).style.display=mode===id.slice(1).toLowerCase()?'inline':'none';el(id).style.opacity=1-el('fade').value/100}el('legend').textContent=mode==='b1'?'蓝线为报告 B 区地下一层边界。北端与西端保留分区缺口。':mode==='b2'?'橙色矩形为图 2-5 标明的学术交流中心局部地下二层，范围线面积 1,289 平方米。':'南侧校前区 · 地上参照图'};el('fade').oninput=el('pale').oninput=render;render();const beforeSport=render;render=function(){beforeSport();const active=el('area').value==='sport';el('sport').style.display=active?'inline':'none';if(!active)return;for(const id of ['base','b1','b2','west','south'])el(id).style.display='none';const btn=document.querySelector('[data-mode=b2]');btn.hidden=false;btn.textContent='B2 层别定位';el('sportsBase').style.opacity=1-el('pale').value/100;for(const [id,k] of [['sportsB1','b1'],['sportsB2','b2']]){el(id).style.display=mode===k?'inline':'none';el(id).style.opacity=1-el('fade').value/100}el('legend').textContent=mode==='ground'?'东侧 J1 体育中心 · 地上参照图':mode==='b2'?'图注 3F/2D。点为建筑定位，独立 B2 边界与通道留空。':"蓝线：可辨 B1 轮廓段　橙色：坡道符号　① 社会车库人行口　② 社会车辆入口　③ 地下车库出入口"};el('fade').oninput=el('pale').oninput=render;render();const beforeCollege=render;render=function(){beforeCollege();const active=el('area').value==='college';el('college').style.display=active?'inline':'none';document.querySelector('[data-mode=b1]').textContent=active?'地下库对照':'B1 地下室';if(!active)return;for(const id of ['base','b1','b2','west','south','sport'])el(id).style.display='none';document.querySelector('[data-mode=b2]').hidden=true;el('hGround').style.opacity=1-el('pale').value/100;el('hMarks').style.display=mode==='b1'?'inline':'none';el('hMarks').style.opacity=1-el('fade').value/100;el('legend').textContent=mode==='ground'?'本科生书院 · 地上参照图':'棕色实线为按网站转绘的 H 区地下库示意范围。'};const oldArea=el('area').onchange;el('area').onchange=()=>{if(el('area').value==='college'&&mode==='b2')mode='b1';oldArea()};el('fade').oninput=el('pale').oninput=render;render();const previousNorthRender=render;render=function(){previousNorthRender();const active=el('area').value==='north';el('north').style.display=active?'inline':'none';if(!active)return;for(const id of ['base','b1','b2','west','south','sport','college'])el(id).style.display='none';document.querySelector('[data-mode=b2]').hidden=true;document.querySelector('[data-mode=b1]').textContent='地下库范围';el('gGround').style.opacity=1-el('pale').value/100;el('gLines').style.display=mode==='b1'?'inline':'none';el('gLines').style.opacity=1-el('fade').value/100;el('legend').textContent=mode==='ground'?'北侧 G1–G4 · 地上参照图':'棕色实线：G1–G3 为工程图可辨范围，G4 西侧为网站示意。G4 与 G3 接合处留空。'};const lastArea=el('area').onchange;el('area').onchange=()=>{if(el('area').value==='north'&&mode==='b2')mode='b1';lastArea()};el('fade').oninput=el('pale').oninput=render;render();const beforeF=render;render=function(){beforeF();const active=el('area').value==='fwest';el('fwest').style.display=active?'inline':'none';if(!active)return;for(const id of ['base','b1','b2','west','south','sport','college','north'])el(id).style.display='none';document.querySelector('[data-mode=b2]').hidden=true;document.querySelector('[data-mode=b1]').textContent='B1 地下室';el('fGround').style.opacity=1-el('pale').value/100;el('fLines').style.display=mode==='b1'?'inline':'none';el('fLines').style.opacity=1-el('fade').value/100;el('legend').textContent=mode==='ground'?'西北 F 区 · 地上参照图':'深棕实线为二期总平面图可辨边段，浅棕实线为网站参照的东侧延伸段。缺口留空。'};const prevAreaF=el('area').onchange;el('area').onchange=()=>{if(el('area').value==='fwest'&&mode==='b2')mode='b1';prevAreaF()};el('fade').oninput=el('pale').oninput=render;render();const prevCampus=render;render=function(){prevCampus();const active=el('area').value==='campus';el('campusPlan').style.display=active?'inline':'none';if(!active)return;for(const id of ['base','b1','b2','west','south','sport','college','north','fwest'])el(id).style.display='none';document.querySelector('[data-mode=b2]').hidden=true;document.querySelector('[data-mode=b1]').textContent='地下总览';el('campusBase').style.opacity=1-el('pale').value/100;el('campusNetwork').style.display=mode==='b1'?'inline':'none';el('campusNetwork').style.opacity=1-el('fade').value/100;el('legend').textContent=mode==='ground'?'全校地上图':'青绿：地下区域与连接通道　通道两端与相应分区相接；无跨区资料的区域独立显示'};const oldCampusArea=el('area').onchange;el('area').onchange=()=>{oldCampusArea()};el('fade').oninput=el('pale').oninput=render;render();const renderLayerPreset=render;render=function(){renderLayerPreset();const underground=mode!=='ground';map.classList.toggle('under',underground);el('pale').disabled=!underground;el('restorePreset').disabled=!underground;if(!underground){for(const id of ['base','westbase','sGround','sportsBase','hGround','gGround','fGround','campusBase'])el(id).style.opacity=1;el('po').value='0%'}};el('restorePreset').onclick=()=>{el('fade').value=5;el('pale').value=58;render()};el('pale').oninput=el('fade').oninput=render;render();
const atlasRender=render;render=function(){atlasRender();if(el('campusNames'))el('campusNames').style.display=mode==='b1'?'inline':'none';const key=el('area').value;for(const button of document.querySelectorAll('.row'))button.setAttribute('aria-current',button.dataset.key===key);el('place').textContent='建筑导航';for(const b of document.querySelectorAll('[data-mode]')){const k=b.dataset.mode;b.textContent={ground:'G',b1:'B1',b2:'B2'}[k];b.title=b.getAttribute('aria-label')||({ground:'地上',b1:'地下层',b2:'地下二层'}[k]);b.setAttribute('aria-label',b.title)}};
el('fade').oninput=el('pale').oninput=render;
const shell=document.querySelector('main'),menu=document.querySelector('.toggle'),media=matchMedia('(max-width:740px)');
function drawer(open){if(!open){el('drawer').dataset.detent='half';el('drawer').style.height=''}shell.classList.toggle('open',open);el('drawer').inert=!open;menu.setAttribute('aria-expanded',open);if(open)el('closeMenu').focus();else (media.matches?document.querySelector('.mapSearch')||menu:menu).focus({preventScroll:true})}
media.addEventListener('change',()=>drawer(false));el('drawer').inert=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-controls','drawer');menu.onclick=()=>drawer(true);el('closeMenu').onclick=document.querySelector('.scrim').onclick=()=>drawer(false);for(const b of document.querySelectorAll('.row'))b.onclick=()=>{el('area').value=b.dataset.key;el('area').onchange();drawer(false)};
el('sourceDialog').querySelector('button').onclick=()=>el('sourceDialog').close();document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!el('sourceDialog').open){drawer(false);el('layersettings').open=false}});
mode='ground';new ResizeObserver(()=>render()).observe(map);
map.ondblclick=e=>{const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(map.getScreenCTM().inverse());zoom(1.7,p.x,p.y)};render();;const cardIntros=Object.fromEntries(atlasCatalog.filter(b=>b.summary).map(b=>[b.code,b]));const buildingData={"items": [["G3", "实验动物中心", "教学科研"], ["G2", "后勤综合楼", "教学科研"], ["G1", "通识教育中心", "教学科研"], ["F12", "博士后及研究生宿舍", "居住"], ["F14", "博士后及研究生宿舍", "居住"], ["F13", "博士后及研究生宿舍", "居住"], ["F15", "博士后及研究生宿舍", "居住"], ["F11", "博士后及研究生宿舍", "居住"], ["F10", "博士后及研究生宿舍", "居住"], ["F9", "博士后及研究生宿舍", "居住"], ["F8", "教师周转公寓", "居住"], ["F7", "教师周转公寓", "居住"], ["F6", "教师周转公寓", "居住"], ["F5", "教师周转公寓", "居住"], ["F4", "教师周转公寓", "居住"], ["F1", "教师周转公寓", "居住"], ["F2", "教师周转公寓", "居住"], ["F3", "教师周转公寓", "居住"], ["F16", "活动中心", "活动中心"], ["F17", "餐厅", "餐饮服务"], ["C15", "博士后及研究生宿舍", "居住"], ["C14", "博士后及研究生宿舍", "居住"], ["C10", "博士后及研究生宿舍", "居住"], ["C13", "博士后及研究生宿舍", "居住"], ["C11", "博士后及研究生宿舍", "居住"], ["C12", "博士后及研究生宿舍", "居住"], ["C9", "博士后及研究生宿舍", "居住"], ["C8", "博士后及研究生宿舍", "居住"], ["C5", "教师周转公寓", "居住"], ["C7", "博士后及研究生宿舍", "居住"], ["C6", "教师周转公寓", "居住"], ["C4", "教师周转公寓", "居住"], ["C3", "教师周转公寓", "居住"], ["C2", "教师周转公寓", "居住"], ["C1", "教师周转公寓", "居住"], ["C16", "活动中心", "活动中心"], ["C19", "西餐厅／超市", "餐饮服务"], ["C18", "餐厅", "餐饮服务"], ["C17", "餐厅", "餐饮服务"], ["H1", "本科生书院", "居住"], ["H2", "本科生书院", "居住"], ["H3", "本科生书院", "居住"], ["H4", "本科生书院", "居住"], ["H5", "餐厅 / 学生活动中心", "餐饮服务"], ["H6", "实验实训楼", "教学科研"], ["E12", "图书中心", "教学科研"], ["E13", "教学中心", "教学科研"], ["E14", "科研中心", "教学科研"], ["E11", "实验动物中心", "教学科研"], ["E0", "学术会堂", "教学科研"], ["A1", "行政楼", "行政交流"], ["A2", "师生服务中心", "行政交流"], ["A3", "学术交流中心", "行政交流"], ["J1", "体育中心", "体育"], ["E8", "生命科学楼", "教学科研"], ["E9", "生命科学楼", "教学科研"], ["E6", "基础医学楼", "教学科研"], ["E7", "基础医学楼", "教学科研"], ["E4", "理学楼", "教学科研"], ["E5", "理学楼", "教学科研"], ["E1", "工学楼", "教学科研"], ["E2", "工学楼", "教学科研"], ["E3", "工学楼", "教学科研"], ["E10", "学术环", "教学科研"], ["G4", "试剂用品库房", "教学科研"], ["D1–D20", "讲席教授公寓", "居住"], ["J2", "体育场附属用房", "体育"]], "regions": {"core": [680, 1060], "west": [235, 1510], "south": [850, 1645], "sport": [1790, 1190], "college": [1880, 460], "north": [246, 234], "fwest": [260, 542]}, "img": "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"};const buildingCard=document.createElement('section');
buildingCard.className='buildingCard';buildingCard.hidden=true;buildingCard.setAttribute('aria-live','polite');
el('detailsMount').append(buildingCard);
let press;
const footprintDefs=document.createElementNS(map.namespaceURI,'defs');map.prepend(footprintDefs);
const footprints=buildingShapes.map(([left,top,right,bottom,d,curve,color])=>{
  const path=document.createElementNS(map.namespaceURI,'path');
  path.setAttribute('d',d);footprintDefs.append(path);
  return {left,top,right,bottom,path,curve,color};
});
function buildingAt(x,y){
  const point=new DOMPoint(Math.floor(x)+.5,Math.floor(y)+.5);
  return footprints.findIndex(f=>point.x>=f.left&&point.x<f.right&&point.y>=f.top&&point.y<f.bottom&&f.path.isPointInFill(point))+1;
}
const groundLabels=document.createElementNS(map.namespaceURI,'image');
groundLabels.setAttribute('href','assets/building-labels.webp?v=e67-court-2');
groundLabels.setAttribute('width','1244');groundLabels.setAttribute('height','1265');
groundLabels.setAttribute('class','ground-labels');groundLabels.style.pointerEvents='none';
const surfaces=document.createElementNS(map.namespaceURI,'g');
surfaces.setAttribute('class','ground-labels');
surfaces.style.pointerEvents='none';
for(const {curve,color} of footprints){
  if(!curve)continue;
  const surface=document.createElementNS(map.namespaceURI,'path');
  surface.setAttribute('d',curve);
  surface.setAttribute('fill',color || '#788b90');
  surface.setAttribute('stroke',color || '#788b90');
  surface.setAttribute('stroke-width',color?'1.6':'3');
  surface.setAttribute('stroke-linejoin','round');
  surfaces.append(surface);
}
const facadeBacking=groundLabels.cloneNode(false);
facadeBacking.setAttribute('href','assets/facade-edges.webp?v=e67-court-2');
el('campusBase').after(facadeBacking,surfaces,groundLabels);
const highlight=document.createElementNS(map.namespaceURI,'g');
highlight.style.pointerEvents='none';
function hideBuilding(){window.clearWalk?.();clearUnderground();buildingCard.hidden=true;highlight.remove()}
function markBuilding(id,base,ox,oy,factor){
  highlight.replaceChildren();
  highlight.setAttribute('transform','translate('+(-ox)+' '+(-oy)+') scale('+factor+')');
  const shape=footprints[id-1];
  const clip=document.createElementNS(map.namespaceURI,'clipPath');
  clip.id='outside-building-selection';
  const displayPath=shape.curve || shape.path.getAttribute('d');
  const outside=shape.path.cloneNode(false);
  const pad=8;
  outside.setAttribute('d','M'+(shape.left-pad)+' '+(shape.top-pad)+'H'+(shape.right+pad)+'V'+(shape.bottom+pad)+'H'+(shape.left-pad)+'Z '+displayPath);
  outside.setAttribute('clip-rule','evenodd');
  clip.append(outside);highlight.append(clip);
  for(const [color,width] of [['#fffbea',5],['#00655d',2.8]]){
    const outline=shape.path.cloneNode(false);
    outline.setAttribute('d',displayPath);
    outline.setAttribute('fill','none');
    outline.setAttribute('stroke',color);
    outline.dataset.maxWidth=width;
    outline.setAttribute('stroke-linejoin','round');
    if(!buildingData.items[id-1][0].startsWith('E'))outline.setAttribute('clip-path','url(#outside-building-selection)');
    highlight.append(outline);
  }
  const overlayParent=base.tagName==='image'?base.parentNode:base;
  overlayParent.append(highlight);
  sizeSelectionOutline();
}
function sizeSelectionOutline(){
  if(!highlight.isConnected)return;
  const matrix=highlight.getScreenCTM();
  if(!matrix)return;
  const scale=Math.hypot(matrix.a,matrix.b);
  if(!scale)return;
  for(const line of highlight.querySelectorAll('[data-max-width]')){
    line.setAttribute('stroke-width',line.dataset.maxWidth*Math.max(.42,Math.min(scale,1))/scale);
  }
}
function showBuilding(event){
  if(mode!=='ground'){pickUnderground(event);return}
  const area=el('area').value;
  const ids={campus:'campusBase',core:'base',west:'westbase',south:'sGround',sport:'sportsBase',college:'hGround',north:'gGround',fwest:'fGround'};
  const local=new DOMPoint(event.clientX,event.clientY).matrixTransform(el(ids[area]).getScreenCTM().inverse());
  const [ox,oy]=buildingData.regions[area]||[0,0],factor=area==='campus'?1:2;
  const px=Math.floor((ox+local.x)/factor),py=Math.floor((oy+local.y)/factor);
  const id=buildingAt(px,py);
  if(!id){const wasSelected=!buildingCard.hidden;hideBuilding();if(wasSelected)drawer(false);return}
  window.clearWalk?.();markBuilding(id,el(ids[area]),ox,oy,factor);const [code,name,category]=buildingData.items[id-1];
  buildingCard.replaceChildren();for(const [tag,value] of [['b',code],['strong',name],['small',category]]){const t=document.createElement(tag);t.textContent=value;buildingCard.append(t)}
  window.addDirections?.(code);
  const more=document.createElement('details'),heading=document.createElement('summary');
  heading.textContent='建筑介绍';more.append(heading);
  const intro=cardIntros[code];
  if(intro){
    const paragraph=document.createElement('p'),source=document.createElement('a');
    paragraph.textContent=intro.summary;source.href=intro.url;source.textContent='资料来源 ↗';source.target='_blank';source.rel='noopener noreferrer';
    more.append(paragraph);if(intro.url)more.append(source);
  }
  const edit=document.createElement('a');edit.href='https://github.com/toby601/yungu-campus-atlas/blob/main/site/buildings/'+encodeURIComponent(code)+'.md';edit.textContent='完善这栋楼的介绍 ↗';edit.target='_blank';edit.rel='noopener noreferrer';more.append(edit);buildingCard.append(more);buildingCard.hidden=false;drawer(true);
}
const fingers=new Map();
function gestureFrame(){
 const [a,b]=fingers.values();
 return b?{cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,span:Math.hypot(a.x-b.x,a.y-b.y)}:{cx:a.x,cy:a.y,span:0};
}
map.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 map.setPointerCapture(e.pointerId);
 fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 press=fingers.size===1?[e.clientX,e.clientY,e.pointerId]:null;
});
map.addEventListener('pointermove',e=>{
 if(!fingers.has(e.pointerId))return;
 const before=gestureFrame(),matrix=map.getScreenCTM();
 const anchor=new DOMPoint(before.cx,before.cy).matrixTransform(matrix.inverse());
 fingers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 const after=gestureFrame();
 if(press&&Math.hypot(e.clientX-press[0],e.clientY-press[1])<=5)return;
 const panX=press?e.clientX-press[0]:after.cx-before.cx,panY=press?e.clientY-press[1]:after.cy-before.cy;
 press=null;
 const next=before.span&&after.span?Math.min(32,Math.max(.5,z*after.span/before.span)):z;
 x=anchor.x+(x-anchor.x-panX/matrix.a)*z/next;
 y=anchor.y+(y-anchor.y-panY/matrix.d)*z/next;
 z=next;render();
});
map.addEventListener('pointerup',e=>{
 if(!fingers.delete(e.pointerId))return;
 if(press&&press[2]===e.pointerId&&!window.pickWalkEndpoint?.(e))showBuilding(e);
 press=null;
});
for(const type of ['pointercancel','lostpointercapture'])map.addEventListener(type,e=>{if(fingers.delete(e.pointerId))press=null});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideBuilding()});
document.querySelectorAll('.row,[data-mode]').forEach(b=>b.addEventListener('click',hideBuilding));
const ns=map.namespaceURI;
const undergroundNames=['西北 F 区地下室','北侧 G 区地下库','北侧 G 区地下库','北侧 G 区地下库','本科生书院地下车库','图书中心地下室','教学中心地下室','科研中心地下室','学术环地下室','实验动物中心地下室','地下通道','学术会堂地下室','西侧 C 区地下室','南侧校前区地下室','体育中心地下车库'];
const network=el('campusNetwork');
const shapes=[...network.lastElementChild.querySelectorAll('path,polygon,ellipse')];
function register(node,name,floor='B1',stroke=false){
  node.dataset.underground=name;node.dataset.floor=floor;
  node.style.pointerEvents=stroke?'stroke':'all';
}
shapes.forEach((node,i)=>register(node,undergroundNames[i]));
network.firstElementChild.querySelectorAll('path').forEach(node=>register(node,'地下通道','B1',true));
const detailAreas={west:[12],south:[13],sport:[14],college:[4],north:[1,2,3],fwest:[0]};
for(const [area,indexes] of Object.entries(detailAreas)){
  const [ox,oy]=buildingData.regions[area],group=document.createElementNS(ns,'g');
  group.setAttribute('transform','translate('+(-ox)+' '+(-oy)+') scale(2)');
  group.setAttribute('opacity','0');group.dataset.hitArea=area;
  const root=el(area);root.insertBefore(group,root.children[1]);
  for(const i of indexes)group.append(shapes[i].parentNode.cloneNode(true));
}
const localCore=[...el('b1').querySelectorAll('polygon,ellipse')];
localCore.forEach((node,i)=>register(node,undergroundNames[i+8]));
for(const [id,name] of [['westlines',undergroundNames[12]],['sB1',undergroundNames[13]],['sportsB1',undergroundNames[14]],['hMarks',undergroundNames[4]],['gLines',undergroundNames[1]],['fLines',undergroundNames[0]]]){
  el(id).querySelectorAll('path,polyline,circle').forEach(node=>register(node,name,'B1',getComputedStyle(node).fill==='none'));
}
el('b2').replaceChildren();el('sportsB2').replaceChildren();
const campusB2=document.createElementNS(ns,'g');el('campusPlan').append(campusB2);
for(const [node,area,name] of [[el('sB2'),'south','学术交流中心局部地下室']]){
  register(node,name,'B2');
  const [ox,oy]=buildingData.regions[area],g=document.createElementNS(ns,'g');
  const matrix=area==='south'?node.parentNode.getAttribute('transform'):'';
  g.setAttribute('transform','scale(.5) translate('+ox+' '+oy+') '+matrix);
  const clone=node.cloneNode(true);clone.removeAttribute('id');clone.style.display='';g.append(clone);campusB2.append(g);
}
const previousFloorRender=render;
render=function(){previousFloorRender();const campus=el('area').value==='campus';if(campus)document.querySelector('[data-mode=b2]').hidden=false;
  campusB2.style.display=mode==='b2'?'inline':'none';campusB2.style.opacity=1-el('fade').value/100;
  for(const group of map.querySelectorAll('[data-hit-area]'))group.style.display=mode==='b1'?'inline':'none';
};
render();
let undergroundHighlight,selectedB1=0;
const selection=document.createElement('aside');
selection.id='undergroundSelection';selection.hidden=true;
selection.setAttribute('aria-label','选中的地下区域');
const selectionText=document.createElement('span');
selectionText.setAttribute('aria-live','polite');
const dismissSelection=document.createElement('button');
dismissSelection.textContent='×';dismissSelection.setAttribute('aria-label','取消地下区域选中');
dismissSelection.onclick=()=>{clearUnderground();map.focus({preventScroll:true})};
selection.append(selectionText,dismissSelection);document.querySelector('.stage').append(selection);
function clearUnderground(){
  selectedB1=0;
  undergroundHighlight?.remove();undergroundHighlight=null;selection.hidden=true}
function pickUnderground(event){
  hideBuilding();
  const floor=mode.toUpperCase();
  if(floor==='B1'&&el('area').value==='campus'){
    const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(editedB1.getScreenCTM().inverse());
    const row=b1Rows[Math.floor(p.y)];
    const hit=row?.find(([left,right])=>p.x>=left&&p.x<right);
    if(!hit)return;
    selectedB1=hit[2];
    const tint=editedB1.cloneNode(false);
    tint.setAttribute('href','assets/b1-selected/'+selectedB1+'.webp');
    tint.style.opacity='1';editedB1.after(tint);undergroundHighlight=tint;
    showUndergroundLabel(floor,selectedB1===16?'地下通道':undergroundNames[selectedB1-1],event);
    return;
  }
  const node=document.elementsFromPoint(event.clientX,event.clientY).find(n=>n.dataset?.floor===floor);
  if(!node)return;
  const copy=node.cloneNode(true);copy.removeAttribute('id');delete copy.dataset.floor;delete copy.dataset.underground;
  // The picking group can be transparent. Reuse its map-space transforms
  // without inheriting its opacity or converting through screen coordinates.
  const transforms=[];
  for(let parent=node.parentElement;parent&&parent!==map;parent=parent.parentElement){
    const transform=parent.getAttribute('transform');
    if(transform)transforms.unshift(transform);
  }
  const overlay=document.createElementNS(ns,'g');
  overlay.setAttribute('transform',transforms.join(' '));
  overlay.style.pointerEvents='none';
  const passage=node.style.pointerEvents==='stroke';
  copy.style.cssText='pointer-events:none;vector-effect:non-scaling-stroke;stroke-linejoin:round';
  copy.style.stroke=floor==='B2'?'#885417':'#075d68';
  copy.style.strokeWidth=passage?'2.5px':'1.75px';
  copy.style.fill=passage?'none':floor==='B2'?'#da9132':'#078f89';
  copy.style.fillOpacity='.42';
  overlay.append(copy);map.append(overlay);undergroundHighlight=overlay;
  showUndergroundLabel(floor,node.querySelector('title')?.textContent||node.dataset.underground,event);
}
function showUndergroundLabel(floor,label,event){
  if(shell.classList.contains('open'))drawer(false);
  const badge=document.createElement('b');
  badge.textContent=floor;
  selectionText.replaceChildren(badge,document.createTextNode(label));
  selection.dataset.floorLabel=floor;
  selection.classList.toggle('below',event.clientY<map.getBoundingClientRect().top+map.clientHeight/2);
  selection.hidden=false;
}
const gateLocations=[[601,148,'北校门',0,-12],[126,594,'4号门',-23,-9],[1114,637,'6号门',29,5],[464,1139,'2号门',0,23],[602,1140,'南校门 / 1号门',0,23],[672,1137,'8号门',17,21]];
const gateLabels=document.createElementNS(ns,'g');
gateLabels.setAttribute('class','gate-labels');
gateLabels.setAttribute('style','pointer-events:none;text-anchor:middle;font:600 15px Microsoft YaHei,sans-serif;fill:#244f55;stroke:#fffdf1;stroke-width:3;paint-order:stroke;stroke-linejoin:round');
for(const [x,y,name,dx,dy] of gateLocations){
  const marker=document.createElementNS(ns,'circle'),label=document.createElementNS(ns,'text');
  marker.setAttribute('cx',x);marker.setAttribute('cy',y);marker.setAttribute('r',3);
  label.setAttribute('x',x+dx);label.setAttribute('y',y+dy);label.textContent=name;gateLabels.append(marker,label);
}
el('campusPlan').append(gateLabels);
for(const [area,[ox,oy]] of Object.entries(buildingData.regions)){
  const ids={core:'base',west:'westbase',south:'sGround',sport:'sportsBase',college:'hGround',north:'gGround',fwest:'fGround'};
  const base=el(ids[area]),img=base.matches('image')?base:base.querySelector('image');
  const clone=gateLabels.cloneNode(true);
  [...clone.querySelectorAll('circle')].forEach(circle=>{const x=2*Number(circle.getAttribute('cx'))-ox,y=2*Number(circle.getAttribute('cy'))-oy;if(x<0||y<0||x>img.width.baseVal.value||y>img.height.baseVal.value){circle.nextElementSibling.remove();circle.remove()}});
  clone.dataset.gateRegion=area;clone.setAttribute('transform','translate('+(-ox)+' '+(-oy)+') scale(2)');base.after(clone);
}
const gateRender=render;render=function(){gateRender();gateLabels.style.display=mode==='ground'?'inline':'none';map.querySelectorAll('[data-gate-region]').forEach(g=>g.style.display=mode==='ground'&&el('area').value===g.dataset.gateRegion?'inline':'none')};render();
const editedB1=document.createElementNS(map.namespaceURI,'image');
editedB1.setAttribute('width','1244');editedB1.setAttribute('height','1265');
editedB1.style.pointerEvents='none';network.before(editedB1);
const editedRender=render;render=function(){editedRender();if(mode==="b1"&&!editedB1.hasAttribute("href"))editedB1.setAttribute("href","assets/b1.webp");editedB1.style.display=network.style.display;editedB1.style.opacity=network.style.opacity;network.style.opacity='0';};render();

const regionImages={core:'core',west:'west',south:'south',sport:'sport',college:'college',north:'north',fwest:'fwest'};
const previousView=render;
render=function(){
 previousView();
 const key=el('area').value;
 if(regionImages[key]){
   const image=map.querySelector('image[data-src="assets/'+key+'.webp"]');
   if(image&&!image.hasAttribute('href'))image.setAttribute('href',image.dataset.src);
 }
};
render();
map.style.visibility='visible';

const loadedResolutions=new Map();
let currentResolution=0;
const previewRender=render;
render=function(){
 previewRender();
 if(el('area').value!=='campus')return;
 const level=z>=3?2:1;
 if(loadedResolutions.has(level))return;
 const img=new Image();
 const url=level===2?'assets/campus-detail.webp':'assets/campus-preview.webp';
 loadedResolutions.set(level,img);
 img.onload=()=>{if(level>currentResolution){currentResolution=level;el('campusBase').setAttribute('href',url)}};
 img.onerror=()=>loadedResolutions.delete(level);
 img.src=url;
};
requestAnimationFrame(()=>requestAnimationFrame(render));

const renderWithSelection=render;render=function(){renderWithSelection();sizeSelectionOutline()};