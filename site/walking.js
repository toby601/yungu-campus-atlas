const walkWidth=415, walkHeight=422, walkCount=walkWidth*walkHeight;
const road=i=>i>=0&&i<walkCount&&(walkBits.charCodeAt(i>>3)&(1<<(i%8)));
const walkXY=i=>[3*(i%walkWidth),3*Math.floor(i/walkWidth)];
const gates={'4号门':[126,594],'北校门':[601,148],'6号门':[1114,637],'南校门（1号门）':[602,1140],'2号门':[464,1139],'8号门':[672,1137]};
const walkLocations={...gates,...atlasCenters};
const walkPanel=document.createElement('section');walkPanel.id='walkPanel';walkPanel.hidden=true;el('detailsMount').after(walkPanel);
const routeLayer=document.createElementNS(map.namespaceURI,'g');routeLayer.style.pointerEvents='none';el('campusPlan').append(routeLayer);
function clearWalk(){routeLayer.replaceChildren();walkPanel.hidden=true;el('drawer').classList.remove('routing')}
window.clearWalk=clearWalk;
function nearestRoad(point,accept){
 let best=-1,min=Infinity;
 for(let i=0;i<walkCount;i++){if(!road(i)||!accept(i))continue;const [x,y]=walkXY(i),d=(x-point[0])**2+(y-point[1])**2;if(d<min){best=i;min=d}}
 return min<=85**2?best:-1;
}
function findWalk(start,end){
 const first=nearestRoad(start,()=>true);if(first<0)return [];
 const prev=new Int32Array(walkCount).fill(-1),queue=new Int32Array(walkCount);let head=0,tail=1;queue[0]=first;prev[first]=first;
 while(head<tail){const i=queue[head++];for(const j of [i-1,i+1,i-walkWidth,i+walkWidth]){
 if(road(j)&&prev[j]===-1&&Math.abs(j%walkWidth-i%walkWidth)<=1){prev[j]=i;queue[tail++]=j}
 }}
 const last=nearestRoad(end,i=>prev[i]>=0);if(last<0)return [];
 const path=[];for(let i=last;;i=prev[i]){path.push(walkXY(i));if(i===first)break}
 return path.reverse();
}
function svgElement(tag,attrs){const n=document.createElementNS(map.namespaceURI,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n}
function directions(code){
 clearWalk();el('drawer').classList.add('routing');buildingCard.hidden=true;walkPanel.hidden=false;
 const back=document.createElement('button');back.textContent='‹ 返回地点详情';back.onclick=()=>selectEntry(code);
 const title=document.createElement('h2');title.textContent='地上步行';
 const label=document.createElement('label');label.textContent='起点';const select=document.createElement('select');
 for(const k of Object.keys(walkLocations)){if(k===code)continue;const option=new Option(atlasCatalog.some(b=>b.code===k)?k+' '+atlasCatalog.find(b=>b.code===k).name:k,k);select.add(option)}
 label.append(select);const dest=document.createElement('p');dest.textContent='终点　'+code+' '+atlasCatalog.find(b=>b.code===code).name+'楼旁';
 const note=document.createElement('small');walkPanel.replaceChildren(back,title,label,dest,note);
 function draw(){
 routeLayer.replaceChildren();const path=findWalk(walkLocations[select.value],walkLocations[code]);
 if(path.length<2){note.textContent='当前底图无法分辨这两处之间的连续步道。';return}
 note.textContent='按底图步道估算，终点为楼旁可通行处。入口及临时封闭情况以现场为准。';
 const points=path.map(p=>p.join(',')).join(' ');
 for(const [stroke,width] of [['white',6],['#08746a',3.5]])routeLayer.append(svgElement('polyline',{points,stroke,'stroke-width':width,fill:'none','stroke-linejoin':'round','stroke-linecap':'round'}));
 for(const [point,text] of [[path[0],'起'],[path.at(-1),'终']]){
 routeLayer.append(svgElement('circle',{cx:point[0],cy:point[1],r:8,fill:'#12665c',stroke:'white','stroke-width':1.5}));const t=svgElement('text',{x:point[0],y:point[1]+3,'font-size':9,'text-anchor':'middle',fill:'white'});t.textContent=text;routeLayer.append(t)}
 const xs=path.map(p=>p[0]),ys=path.map(p=>p[1]);const l=Math.min(...xs),r=Math.max(...xs),t=Math.min(...ys),b=Math.max(...ys);
 x=196+.585*(l+r)/2;y=.585*(t+b)/2;z=Math.min(5,Math.max(1,Math.min(1244/(r-l+160),1265/(b-t+180))*.68));render();
 // Reserve the part of the viewport occupied by the navigation panel.
 const scale=map.getScreenCTM().a,panel=el('drawer').getBoundingClientRect();
 if(innerWidth<=740)y+=panel.height/(2*scale);else x-=panel.width/(2*scale);render();
 }
 select.onchange=draw;draw();
}
window.addDirections=code=>{const button=document.createElement('button');button.className='goHere';button.textContent='去这里';button.onclick=()=>directions(code);buildingCard.append(button)};
