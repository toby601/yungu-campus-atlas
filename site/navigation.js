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
const grip=el('drawer').querySelector('.brand');let dragStart;
grip.addEventListener('pointerdown',e=>{if(innerWidth>740||e.target.closest('button'))return;dragStart=[e.clientY,el('drawer').offsetHeight];grip.setPointerCapture(e.pointerId)});
grip.addEventListener('pointermove',e=>{if(dragStart)el('drawer').style.height=Math.max(innerHeight*.30,Math.min(innerHeight*.74,dragStart[1]+dragStart[0]-e.clientY))+'px'});
grip.addEventListener('pointerup',()=>dragStart=null);grip.addEventListener('pointercancel',()=>dragStart=null);
const drawerTitle=grip.querySelector('h1');
new MutationObserver(()=>{drawerTitle.textContent=el('drawer').classList.contains('routing')?'步行路线':'建筑导航'}).observe(el('drawer'),{attributes:true,attributeFilter:['class']});
