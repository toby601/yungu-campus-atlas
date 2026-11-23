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
