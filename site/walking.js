const walkWidth=1244, walkHeight=1265, walkCount=walkWidth*walkHeight;
const road=i=>i>=0&&i<walkCount&&(walkBits.charCodeAt(i>>3)&(1<<(i%8)));
const walkXY=i=>[(i%walkWidth),Math.floor(i/walkWidth)];
const gates={'4号门':[126,594],'北校门':[601,148],'6号门':[1114,637],'南校门（1号门）':[602,1140],'2号门':[464,1139],'8号门':[672,1137]};
const walkLocations=[...atlasCatalog.map(building=>building.code),...Object.keys(gates)];
const walkPanel=document.createElement('section');walkPanel.id='walkPanel';walkPanel.hidden=true;el('detailsMount').after(walkPanel);
const routeLayer=document.createElementNS(map.namespaceURI,'g');routeLayer.style.pointerEvents='none';el('campusPlan').append(routeLayer);
function clearWalk(){if(el('drawer').dataset.detent==='compact')el('drawer').dataset.detent='half';pendingSide=null;pickBar.hidden=true;routeLayer.replaceChildren();walkPanel.hidden=true;el('drawer').classList.remove('routing')}
window.clearWalk=clearWalk;
function nearestRoad(point,accept){
 let best=-1,min=Infinity;
 for(let i=0;i<walkCount;i++){if(!road(i)||!accept(i))continue;const [x,y]=walkXY(i),d=(x-point[0])**2+(y-point[1])**2;if(d<min){best=i;min=d}}
 return min<=85**2?best:-1;
}
const ringSpine=[[510,561],[507,567],[502,572],[498,577],[494,583],[491,589],[488,596],[486,602],[482,608],[481,615],[478,621],[477,628],[477,635],[476,642],[476,649],[476,656],[476,662],[477,669],[478,676],[480,683],[482,689],[484,696],[486,702],[489,708],[493,714],[497,720],[500,726],[504,732],[508,737],[512,743],[518,747],[522,752],[528,756],[533,760],[539,764],[545,768],[551,771],[558,773],[564,776],[571,778],[577,781],[584,781],[591,782],[598,783],[605,783],[612,783],[619,783],[625,782],[632,782],[639,779],[646,777],[652,775],[659,773],[665,770],[671,766],[677,763],[683,759],[688,755],[694,751],[698,745],[703,740],[708,736],[712,730],[716,724],[719,718],[724,713],[727,707],[729,700],[732,694],[735,688],[736,681],[737,674],[738,667],[738,660],[738,653],[730,647]];
const ringBranches={"E1":[65,738,720],"E2":[58,705,762],"E3":[53,680,786],"E4":[48,633,798],"E5":[40,571,795],"E6":[29,502,756],"E7":[29,502,755],"E8":[18,462,679],"E9":[10,464,613]};
const ringPortals=[[688448,0],[796882,75],[868778,20],[846424,20],[970850,34],[924838,34],[977214,53],[932407,53],[878963,64]];
// Schematic first-floor corridor. Portal pairs connect outdoor pavement cells to spine stations.
const ringLinks=new Map();
function linkRing(a,b){
 for(const [from,to] of [[a,b],[b,a]]){
  if(!ringLinks.has(from))ringLinks.set(from,[]);
  ringLinks.get(from).push(to);
 }
}
for(let n=1;n<ringSpine.length;n++)linkRing(walkCount+n-1,walkCount+n);
for(const [cell,n] of ringPortals)linkRing(cell,walkCount+n);
// Bidirectional lower paths, isolated from the bridge decks above.
const underpasses=new Map();
for(const [x1,y1,x2,y2] of [[584,366,618,362],[775,385,802,396],[844,461,871,480]]){
 const a=y1*walkWidth+x1,b=y2*walkWidth+x2;
 underpasses.set(a,b);underpasses.set(b,a);
}
const routeXY=i=>i>=walkCount?ringSpine[i-walkCount]:walkXY(i);
function contactsFor(value,allowIndoor=true){
 if(value instanceof Map)return value;
 if(value==null)return new Map();
 if(typeof value==='string'&&!gates[value]){
  const stops=new Map();
  for(const [i,x,y] of walkEdges[value]||[]){
   const [u,v]=walkXY(i),prior=stops.get(i);
   if(!prior||Math.hypot(x-u,y-v)<Math.hypot(prior[0]-u,prior[1]-v))stops.set(i,[x,y]);
  }
  if(!allowIndoor)return stops;
  if(value==='E10')ringSpine.forEach((p,n)=>stops.set(walkCount+n,p));
  if(ringBranches[value]){
   const [n,x,y]=ringBranches[value];
   stops.set(walkCount+n,[x,y]);
  }
  return stops;
 }
 const i=typeof value==='number'?value:nearestRoad(gates[value],()=>true);
 return i<0?new Map():new Map([[i,walkXY(i)]]);
}
function findWalk(start,end,allowIndoor=true,arrival=null){
 const starts=contactsFor(start,allowIndoor),ends=contactsFor(end,allowIndoor);
 if(!starts.size||!ends.size)return [];
 // Multi-source Dijkstra, including the short approaches to building edges.
 const prev=new Int32Array(walkCount+ringSpine.length).fill(-1);
 const dist=new Float64Array(walkCount+ringSpine.length).fill(Infinity), heap=[];
 function push(cell,cost){
  let n=heap.length;
  while(n>0){
   const parent=(n-1)>>1;
   if(heap[parent].cost<=cost)break;
   heap[n]=heap[parent];n=parent;
  }
  heap[n]={cell,cost};
 }
 function pop(){
  const first=heap[0],last=heap.pop();
  if(heap.length){
   let n=0;
   while(2*n+1<heap.length){
    let child=2*n+1;
    if(child+1<heap.length&&heap[child+1].cost<heap[child].cost)child++;
    if(last.cost<=heap[child].cost)break;
    heap[n]=heap[child];n=child;
   }
   heap[n]=last;
  }
  return first;
 }
 function approach(i,p){const [x,y]=routeXY(i);return Math.hypot(x-p[0],y-p[1])}
 for(const [i,p] of starts){dist[i]=approach(i,p);prev[i]=i;push(i,dist[i])}
 let best=Infinity,goal=-1;
 while(heap.length){
  const {cell:i,cost}=pop();
  if(cost>=best)break;
  if(cost!==dist[i])continue;
  if(ends.has(i)){
   const total=cost+approach(i,ends.get(i));
   if(total<best){best=total;goal=i}
  }
  if(allowIndoor)for(const j of ringLinks.get(i)||[]){
   const next=cost+approach(i,routeXY(j));
   if(next<dist[j]){dist[j]=next;prev[j]=i;push(j,next)}
  }
  const below=underpasses.get(i);
  if(below!==undefined){
   const next=cost+approach(i,walkXY(below));
   if(next<dist[below]){dist[below]=next;prev[below]=i;push(below,next)}
  }
  if(i>=walkCount)continue;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   if(!dx&&!dy)continue;
   const x=i%walkWidth+dx,j=i+dx+dy*walkWidth;
   if(x<0||x>=walkWidth||!road(j))continue;
   if(dx&&dy&&(!road(i+dx)||!road(i+dy*walkWidth)))continue;
   const next=cost+(dx&&dy?Math.SQRT2:1);
   if(next<dist[j]){dist[j]=next;prev[j]=i;push(j,next)}
  }
 }
 if(goal>=0){
  if(arrival)arrival.set(goal,ends.get(goal));
  const path=[ends.get(goal)];let i=goal;
  while(prev[i]!==i){path.push(routeXY(i));i=prev[i]}
  path.push(routeXY(i),starts.get(i));return path.reverse();
 }
 return [];
}
// Walk every grid cell touched by a straight segment, including both sides
// of a diagonal corner. Inputs are integer outdoor route cells.
function clearWalkSegment([x,y],[endX,endY]){
 const dx=Math.abs(endX-x),dy=Math.abs(endY-y);
 const sx=Math.sign(endX-x),sy=Math.sign(endY-y);
 let ix=0,iy=0;
 while(ix<dx||iy<dy){
  const cross=(2*ix+1)*dy-(2*iy+1)*dx;
  if(cross===0&&(!road(y*walkWidth+x+sx)||!road((y+sy)*walkWidth+x)))return false;
  if(cross<=0){x+=sx;ix++}
  if(cross>=0){y+=sy;iy++}
  if(!road(y*walkWidth+x))return false;
 }
 return true;
}
const ringStations=new Set(ringSpine);
function straightenWalk(path){
 if(path.length<3)return path;
 const result=[path[0]];
 // The end approaches, portals and indoor spine carry their own geometry.
 for(let i=1;i<path.length-1;){
  result.push(path[i]);
  let next=i+1;
  if(!ringStations.has(path[i])&&next<path.length-1&&!ringStations.has(path[next])){
   while(next+1<path.length-1&&!ringStations.has(path[next+1])&&clearWalkSegment(path[i],path[next+1]))next++;
  }
  i=next;
 }
 result.push(path[path.length-1]);
 return result;
}
function svgElement(tag,attrs){const n=document.createElementNS(map.namespaceURI,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n}
const endpoints={start:null,end:null};
const waypoints=[];
let waypointIndex=0;
let pendingSide=null;
const placeChoices=document.createElement('datalist');
placeChoices.id='walkPlaceChoices';
for(const place of walkLocations){
 const option=document.createElement('option');option.value=endpointName(place);placeChoices.append(option);
}
const placeSearch=document.createElement('input');
placeSearch.setAttribute('list',placeChoices.id);
placeSearch.placeholder='搜索楼号或校门';
placeSearch.setAttribute('aria-label',placeSearch.placeholder);
placeSearch.className='routePlaceSearch';
placeSearch.oninput=()=>{
 const place=walkLocations.find(key=>endpointName(key)===placeSearch.value);
 if(place)acceptPlace(place);
};
const pickBar=document.createElement('div');pickBar.id='pickBar';pickBar.hidden=true;
const hint=document.createElement('span'),cancelPick=document.createElement('button');cancelPick.textContent='取消';
pickBar.append(hint,placeSearch,placeChoices,cancelPick);document.querySelector('.stage').append(pickBar);
const sideNames={start:'起点',end:'终点',via:'途经点'};
function drawPathMarkers(routeStops=[]){
 routeLayer.querySelectorAll('[data-path-marker]').forEach(marker=>marker.remove());
 const stops=[endpoints.start,...waypoints,endpoints.end];
 stops.forEach((stop,index)=>{
  const point=routeStops[index] ?? (typeof stop==='number'?walkXY(stop):null);
  if(!point)return;
  const first=index===0,last=index===stops.length-1;
  const marker=svgElement('g',{'data-path-marker':first?'start':last?'end':'via',transform:'translate('+point.join(' ')+')'});
  const label=svgElement('text',{x:0,y:3,'font-size':9,'text-anchor':'middle',fill:'white'});
  label.textContent=first?'起':last?'终':String(index);
  marker.append(svgElement('circle',{r:8,fill:'#12665c',stroke:'white','stroke-width':1.5}),label);
  routeLayer.append(marker);
 });
}
function pickSide(side){
 pendingSide=side;placeSearch.value='';hint.textContent='点选'+sideNames[side];pickBar.hidden=false;drawer(false);
}
function finishPicking(){pendingSide=null;pickBar.hidden=true;drawer(true);showPlanner()}
function endNavigation(){
 clearWalk();endpoints.start=null;endpoints.end=null;walkSummary.textContent='';
 drawer(false);
}
function cancelPicking(){if(pendingSide==='via')finishPicking();else endNavigation()}
cancelPick.onclick=cancelPicking;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pendingSide)cancelPicking()});
function endpointName(value){
 if(value==null)return '在地图上选择';
 if(typeof value==='number')return '地图选点';
 const b=atlasCatalog.find(b=>b.code===value);return b?b.code+' '+b.name:value;
}
window.pickWalkEndpoint=e=>{
 if(mode!=='ground')return false;
 if(!pendingSide)return !walkPanel.hidden;
 const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(el('campusBase').getScreenCTM().inverse()),px=Math.floor(p.x),py=Math.floor(p.y);

 let value;
 if(px>=0&&py>=0&&px<1244&&py<1265){
 const id=buildingAt(px,py);
 if(id)value=buildingData.items[id-1][0];
 else {
 const gate=Object.keys(gates).find(k=>Math.hypot(gates[k][0]-px,gates[k][1]-py)<8);
 const cell=py*walkWidth+px;if(gate)value=gate;else if(road(cell))value=cell;
 }}
 acceptPlace(value);return true;
};
function acceptPlace(value){
 if(!pendingSide)return;
 if(pendingSide==='via'){
  if(value==null){hint.textContent='请点建筑、校门或步道';return}
  waypoints[waypointIndex]=value;finishPicking();return;
 }
 const other=pendingSide==='start'?'end':'start';
 if(value==null||value===endpoints[other]){hint.textContent=value==null?'请点建筑、校门或米白色步道':'起点和终点相同，请重新选择';return true}
 endpoints[pendingSide]=value;drawPathMarkers();if(endpoints[other]==null){pickSide(other);return true}finishPicking();return true;
};
function directions(code,side){
 clearWalk();highlight.remove();el('drawer').classList.add('routing');buildingCard.hidden=true;walkPanel.hidden=false;
 waypoints.length=0;endpoints.start=null;endpoints.end=null;endpoints[side]=code;showPlanner();pickSide(side==='start'?'end':'start');
}
// East/west perimeter road centerlines: about 480 screenshot pixels,
// versus 1016 map units. The screenshot scale bar is 375 m per 175 px.
const metresPerUnit=(375/175)*480/1016;
const walkSummary=document.createElement('span');
walkSummary.className='walkSummary';walkSummary.setAttribute('aria-live','polite');
el('drawer').querySelector('.brand').insertBefore(walkSummary,el('closeMenu'));
let travelMode='walk';
function routeTitle(){return travelMode==='bike'?'骑行路线':'步行路线'}
function showPlanner(){
 walkSummary.textContent='';walkPanel.replaceChildren();routeLayer.replaceChildren();drawPathMarkers();
 el('drawer').querySelector('h1').textContent=routeTitle();
 const modes=document.createElement('div');modes.className='travelModes';modes.setAttribute('role','group');modes.setAttribute('aria-label','出行方式');
 for(const [key,name] of [['walk','步行'],['bike','骑行']]){
  const button=document.createElement('button');button.textContent=name;button.dataset.travel=key;
  button.setAttribute('aria-pressed',String(travelMode===key));
  button.onclick=()=>{if(travelMode===key)return;travelMode=key;showPlanner();walkPanel.querySelector('[data-travel='+key+']').focus({preventScroll:true})};
  modes.append(button);
 }
 walkPanel.append(modes);
 for(const key of ['start','end']){
  if(key==='end')waypoints.forEach((value,index)=>{
   const row=document.createElement('div');row.style.display='flex';
   const change=document.createElement('button');change.className='endpoint';
   change.textContent='途经 '+(index+1)+'　'+endpointName(value)+'　›';
   change.onclick=()=>{waypointIndex=index;pickSide('via')};
   const remove=document.createElement('button');remove.textContent='移除';
   remove.setAttribute('aria-label','移除途经点 '+(index+1));
   remove.style.flexShrink='0';remove.onclick=()=>{waypoints.splice(index,1);showPlanner()};
   row.append(change,remove);walkPanel.append(row);
  });
  const b=document.createElement('button');b.className='endpoint';b.textContent=sideNames[key]+'　'+endpointName(endpoints[key])+'　›';b.onclick=()=>pickSide(key);walkPanel.append(b);
 }
 const add=document.createElement('button');add.textContent='＋ 添加途经点';
 add.onclick=()=>{waypointIndex=waypoints.length;pickSide('via')};
 const swap=document.createElement('button');swap.textContent='⇅ 交换起终点';swap.onclick=()=>{[endpoints.start,endpoints.end]=[endpoints.end,endpoints.start];waypoints.reverse();showPlanner()};
 const exit=document.createElement('button');exit.textContent='结束规划';exit.onclick=endNavigation;
 const actions=document.createElement('div');actions.className='routeActions';actions.append(add,swap,exit);walkPanel.append(actions);
 if(endpoints.start==null||endpoints.end==null)return;
 const note=document.createElement('p');walkPanel.append(note);
 const path=[],line=[],routeStops=[];
 const stops=[endpoints.start,...waypoints,endpoints.end];
 let departure=stops[0];
 for(let i=1;i<stops.length;i++){
  const arrival=new Map();
  const leg=findWalk(departure,stops[i],travelMode!=='bike',arrival);
  if(!leg.length){
   note.textContent=endpointName(stops[i-1])+' → '+endpointName(stops[i])+' 未找到连续路线，可改选附近道路。';return;
  }
  if(i===1)routeStops.push(leg[0]);
  routeStops.push(leg.at(-1));
  path.push(...leg);line.push(...straightenWalk(leg));
  departure=arrival;
 }
 if(travelMode==='bike')note.textContent='沿室外道路估算，按 12 公里/小时计算；通行以现场标识为准。';else if(path.some(p=>ringSpine.includes(p)))note.textContent='经 E10 学术环首层 · 室内段为示意路线';else note.textContent='按地上底图估算，实际出入口及通行情况以现场为准。';

 let length=0;
 for(let i=1;i<line.length;i++)length+=Math.hypot(line[i][0]-line[i-1][0],line[i][1]-line[i-1][1]);
 const metres=length*metresPerUnit;
 const distance=metres<10?Math.round(metres):Math.round(metres/10)*10;
 walkSummary.textContent='约 '+distance+' 米 · '+Math.max(1,Math.round(metres/(travelMode==='bike'?200:75)))+' 分钟';
 const points=line.map(p=>p.join(',')).join(' ');
 for(const [stroke,width] of [['white',7.5],['#08746a',4.5]])routeLayer.append(svgElement('polyline',{points,stroke,'stroke-width':width,fill:'none','stroke-linejoin':'round','stroke-linecap':'round'}));
 drawPathMarkers(routeStops);
 const xs=path.map(p=>p[0]),ys=path.map(p=>p[1]);const l=Math.min(...xs),r=Math.max(...xs),t=Math.min(...ys),b=Math.max(...ys);
 x=196+.585*(l+r)/2;y=.585*(t+b)/2;z=Math.min(5,Math.max(1,Math.min(1244/(r-l+160),1265/(b-t+180))*.68));render();
 const scale=map.getScreenCTM().a,panel=el('drawer').getBoundingClientRect();
 if(innerWidth<=740)y+=panel.height/(2*scale);else x-=panel.width/(2*scale);render();
}
let walkDataReady;
function loadWalkData(){
 if(!walkDataReady)walkDataReady=Promise.all(['walk-grid.js','walk-edges.js'].map(src=>new Promise((resolve,reject)=>{
 const script=document.createElement('script');script.src=src+'?v=e67-court-2';script.onload=resolve;script.onerror=()=>reject(Error(src));document.head.append(script);
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