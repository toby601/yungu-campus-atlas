const query=el('atlasQuery'),listing=el('allBuildings');
function selectEntry(code){
 const [cx,cy]=atlasCenters[code];el('area').value='campus';mode='ground';
 z=3;x=196+.585*(cx+.5);y=.585*(cy+.5);render();
 const p=new DOMPoint(cx+.5,cy+.5).matrixTransform(el('campusBase').getScreenCTM());
 showBuilding({clientX:p.x,clientY:p.y});
}
function listBuildings(){
 const term=query.value.trim().toUpperCase();listing.replaceChildren();const groups=new Map();
 for(const b of atlasCatalog){
  if(!(b.code+' '+b.name).toUpperCase().includes(term))continue;
  const key=b.code[0];if(!groups.has(key)){const group=document.createElement('details'),title=document.createElement('summary');title.textContent=key+' 区';group.open=!!term;group.append(title);groups.set(key,group);listing.append(group)}
  const button=document.createElement('button');button.textContent=b.code+'　'+b.name;button.onclick=()=>selectEntry(b.code);groups.get(key).append(button);
 }
 if(!groups.size)listing.textContent='没有匹配的建筑';
}
query.oninput=listBuildings;query.onkeydown=e=>{if(e.key==='Enter'&&query.value.trim())listing.querySelector('button')?.click()};
el('place').onclick=()=>drawer(true);listBuildings();
const sheet=el('drawer'),grip=sheet.querySelector('.brand');
const phoneLayout=matchMedia('(max-width:740px)');
const searchButton=document.createElement('button');
searchButton.className='mapSearch';
searchButton.textContent='云谷图志 · 搜索';
searchButton.setAttribute('aria-label','云谷图志，搜索地点或楼号');
searchButton.onclick=()=>{
 hideBuilding();query.value='';listBuildings();
 sheet.dataset.detent='full';drawer(true);query.focus();
};
document.querySelector('.hud').prepend(searchButton);
const handle=document.createElement('button');
handle.className='sheetHandle';handle.setAttribute('aria-label','展开或收起面板');
sheet.prepend(handle);
const snap=full=>{sheet.style.height='';sheet.dataset.detent=full?'full':'half';handle.setAttribute('aria-expanded',String(full))};
function compactRoute(){
 sheet.style.height='';sheet.dataset.detent='compact';handle.setAttribute('aria-expanded','false');
}
function isRouteSheet(){return sheet.classList.contains('routing')&&phoneLayout.matches}
const closeSheet=el('closeMenu').onclick;
el('closeMenu').onclick=()=>{
 if(sheet.classList.contains('routing')){endNavigation();return}
 closeSheet();
};
grip.addEventListener('click',e=>{if(!ignoreClick&&!e.target.closest('button')&&sheet.dataset.detent==='compact')snap(false)});
let sheetDrag,ignoreClick=false;
handle.onclick=()=>{if(!ignoreClick)snap(sheet.dataset.detent==='half')};
for(const target of [handle,grip]){
 target.addEventListener('pointerdown',e=>{
  if(!phoneLayout.matches||e.target.closest('#closeMenu'))return;
  sheetDrag={y:e.clientY,h:sheet.offsetHeight};target.setPointerCapture(e.pointerId);
 });
 target.addEventListener('pointermove',e=>{
  if(!sheetDrag)return;
  const h=sheetDrag.h+sheetDrag.y-e.clientY;
  sheet.style.height=Math.max(90,Math.min(innerHeight*.82,h))+'px';
 });
 target.addEventListener('pointerup',e=>{
  if(!sheetDrag)return;
  const delta=e.clientY-sheetDrag.y;sheetDrag=null;sheet.style.height='';
  if(Math.abs(delta)<10)return;
  ignoreClick=true;setTimeout(()=>ignoreClick=false,0);
  if(delta>40&&isRouteSheet()){compactRoute();return}
  if(delta<0&&sheet.dataset.detent==='compact'){snap(false);return}
  if(delta>65&&sheet.dataset.detent!=='full'){drawer(false);return}
  snap(delta<0);
 });
 target.addEventListener('pointercancel',()=>{sheetDrag=null;sheet.style.height=''});
}
phoneLayout.addEventListener('change',()=>snap(false));
query.addEventListener('focus',()=>{if(phoneLayout.matches)snap(true)});
new MutationObserver(()=>{if(!buildingCard.hidden)snap(false)}).observe(buildingCard,{attributes:true,attributeFilter:['hidden']});
const drawerTitle=grip.querySelector('h1');
new MutationObserver(()=>{drawerTitle.textContent=el('drawer').classList.contains('routing')?routeTitle():'建筑导航'}).observe(el('drawer'),{attributes:true,attributeFilter:['class']});
const backToDirectory=document.createElement('button');
backToDirectory.className='backDirectory';backToDirectory.textContent='‹ 建筑目录';
el('detailsMount').before(backToDirectory);
backToDirectory.onclick=()=>{hideBuilding();query.value='';listBuildings();query.focus()};
function updateSelectionTitle(){
 if(el('drawer').classList.contains('routing'))drawerTitle.textContent=routeTitle();
 else drawerTitle.textContent=buildingCard.hidden?'建筑导航':'地点与路线';
}
new MutationObserver(updateSelectionTitle).observe(buildingCard,{attributes:true,attributeFilter:['hidden']});
