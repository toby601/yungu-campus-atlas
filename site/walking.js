const walkWidth=1244, walkHeight=1265, walkCount=walkWidth*walkHeight;
const road=i=>i>=0&&i<walkCount&&(walkBits.charCodeAt(i>>3)&(1<<(i%8)));
const walkXY=i=>[(i%walkWidth),Math.floor(i/walkWidth)];
const gates={'4号门':[126,594],'北校门':[601,148],'6号门':[1114,637],'南校门（1号门）':[602,1140],'2号门':[464,1139],'8号门':[672,1137]};
const walkLocations={...gates,...atlasCenters};
const walkPanel=document.createElement('section');walkPanel.id='walkPanel';walkPanel.hidden=true;el('detailsMount').after(walkPanel);
const routeLayer=document.createElementNS(map.namespaceURI,'g');routeLayer.style.pointerEvents='none';el('campusPlan').append(routeLayer);
function clearWalk(){pendingSide=null;pickBar.hidden=true;routeLayer.replaceChildren();walkPanel.hidden=true;el('drawer').classList.remove('routing')}
window.clearWalk=clearWalk;
function nearestRoad(point,accept){
 let best=-1,min=Infinity;
 for(let i=0;i<walkCount;i++){if(!road(i)||!accept(i))continue;const [x,y]=walkXY(i),d=(x-point[0])**2+(y-point[1])**2;if(d<min){best=i;min=d}}
 return min<=85**2?best:-1;
}
function contactsFor(value){
 if(!value)return new Map();
 if(typeof value==='string'&&!gates[value])return new Map((walkEdges[value]||[]).map(([i,x,y])=>[i,[x,y]]));
 const i=typeof value==='number'?value:nearestRoad(gates[value],()=>true);
 return i<0?new Map():new Map([[i,walkXY(i)]]);
}
function findWalk(start,end){
 const starts=contactsFor(start),ends=contactsFor(end);
 if(!starts.size||!ends.size)return [];
 const prev=new Int32Array(walkCount).fill(-1),queue=new Int32Array(walkCount);let head=0,tail=0;
 for(const i of starts.keys()){queue[tail++]=i;prev[i]=i}
 while(head<tail){
  const i=queue[head++];
  if(ends.has(i)){
   const path=[ends.get(i)];let j=i;
   while(prev[j]!==j){path.push(walkXY(j));j=prev[j]}
   path.push(walkXY(j),starts.get(j));return path.reverse();
  }
  for(const j of [i-1,i+1,i-walkWidth,i+walkWidth])if(road(j)&&prev[j]===-1&&Math.abs(j%walkWidth-i%walkWidth)<=1){prev[j]=i;queue[tail++]=j}
 }
 return [];
}
function svgElement(tag,attrs){const n=document.createElementNS(map.namespaceURI,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n}
const endpoints={start:null,end:null};
let pendingSide=null;
const pickBar=document.createElement('div');pickBar.id='pickBar';pickBar.hidden=true;
const hint=document.createElement('span'),cancelPick=document.createElement('button');cancelPick.textContent='取消';
pickBar.append(hint,cancelPick);document.querySelector('.stage').append(pickBar);
const sideNames={start:'起点',end:'终点'};
function pickSide(side){
 pendingSide=side;hint.textContent='点选'+sideNames[side]+'：建筑、校门或步道';pickBar.hidden=false;drawer(false);
}
function finishPicking(){pendingSide=null;pickBar.hidden=true;drawer(true);showPlanner()}
cancelPick.onclick=finishPicking;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pendingSide)finishPicking()});
function endpointName(value){
 if(value==null)return '在地图上选择';
 if(typeof value==='number')return '地图选点';
 const b=atlasCatalog.find(b=>b.code===value);return b?b.code+' '+b.name:value;
}
window.pickWalkEndpoint=e=>{
 if(!pendingSide||mode!=='ground')return false;
 const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(el('campusBase').getScreenCTM().inverse()),px=Math.floor(p.x),py=Math.floor(p.y);
 const other=pendingSide==='start'?'end':'start';
 let value;
 if(px>=0&&py>=0&&px<1244&&py<1265){
 const id=buildingPixels?.[4*(py*1244+px)];
 if(id)value=buildingData.items[id-1][0];
 else {
 const gate=Object.keys(gates).find(k=>Math.hypot(gates[k][0]-px,gates[k][1]-py)<8);
 const cell=py*walkWidth+px;if(gate)value=gate;else if(road(cell))value=cell;
 }}
 if(value==null||value===endpoints[other]){hint.textContent=value==null?'请点建筑、校门或米白色步道':'起点和终点相同，请重新选择';return true}
 endpoints[pendingSide]=value;if(endpoints[other]==null){pickSide(other);return true}finishPicking();return true;
};
function directions(code,side){
 clearWalk();highlight.remove();el('drawer').classList.add('routing');buildingCard.hidden=true;walkPanel.hidden=false;
 endpoints.start=null;endpoints.end=null;endpoints[side]=code;showPlanner();pickSide(side==='start'?'end':'start');
}
function showPlanner(){
 walkPanel.replaceChildren();routeLayer.replaceChildren();
 const title=document.createElement('h2');title.textContent='地上步行';walkPanel.append(title);
 for(const key of ['start','end']){
  const b=document.createElement('button');b.className='endpoint';b.textContent=sideNames[key]+'　'+endpointName(endpoints[key])+'　›';b.onclick=()=>pickSide(key);walkPanel.append(b);
 }
 const swap=document.createElement('button');swap.textContent='⇅ 交换起终点';swap.onclick=()=>{[endpoints.start,endpoints.end]=[endpoints.end,endpoints.start];showPlanner()};
 const exit=document.createElement('button');exit.textContent='结束规划';exit.onclick=clearWalk;walkPanel.append(swap,exit);
 if(endpoints.start==null||endpoints.end==null)return;
 const path=findWalk(endpoints.start,endpoints.end),note=document.createElement('p');walkPanel.append(note);
 if(!path.length){note.textContent='底图中未找到连续接边的步道，可改选建筑旁的道路。';return}
 note.textContent='按地上底图估算，实际出入口及通行情况以现场为准。';
 const points=path.map(p=>p.join(',')).join(' ');
 for(const [stroke,width] of [['white',6],['#08746a',3.5]])routeLayer.append(svgElement('polyline',{points,stroke,'stroke-width':width,fill:'none','stroke-linejoin':'round','stroke-linecap':'round'}));
 const xs=path.map(p=>p[0]),ys=path.map(p=>p[1]);const l=Math.min(...xs),r=Math.max(...xs),t=Math.min(...ys),b=Math.max(...ys);
 x=196+.585*(l+r)/2;y=.585*(t+b)/2;z=Math.min(5,Math.max(1,Math.min(1244/(r-l+160),1265/(b-t+180))*.68));render();
 const scale=map.getScreenCTM().a,panel=el('drawer').getBoundingClientRect();
 if(innerWidth<=740)y+=panel.height/(2*scale);else x-=panel.width/(2*scale);render();
}
let walkDataReady;
function loadWalkData(){
 if(!walkDataReady)walkDataReady=Promise.all(['walk-grid.js','walk-edges.js'].map(src=>new Promise((resolve,reject)=>{
 const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>reject(Error(src));document.head.append(script);
 }))).catch(err=>{walkDataReady=null;throw err});
 return walkDataReady;
}
window.addDirections=code=>{
 for(const [side,label] of [['end','去这里'],['start','从这里出发']]){
 const button=document.createElement('button');button.className='goHere';button.textContent=label;
 button.onclick=async()=>{button.disabled=true;try{await loadWalkData();if(button.isConnected&&!buildingCard.hidden)directions(code,side)}catch{button.textContent='重试：'+label}finally{button.disabled=false}};
 buildingCard.append(button);
 }
};
const planButton=document.createElement('button');planButton.className='startWalk';planButton.textContent='路线';
document.querySelector('.hud').append(planButton);
planButton.onclick=async()=>{
 planButton.disabled=true;
 try{
  await loadWalkData();if(mode!=='ground'){document.querySelector('[data-mode=ground]').click()}
  directions(null,'end');
 }catch{planButton.textContent='重试路线'}finally{planButton.disabled=false}
};