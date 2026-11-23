const query=document.getElementById('atlasQuery'),results=document.getElementById('suggestions'),dirDialog=document.getElementById('directoryDialog');
function goBuilding(code){
 const center=atlasCenters[code];if(!center)return;
 dirDialog.close();results.hidden=true;query.value='';
 el('area').value='campus';el('area').onchange();mode='ground';z=3;x=196+.585*(center[0]+.5);y=.585*(center[1]+.5);render();
 const p=new DOMPoint(center[0]+.5,center[1]+.5).matrixTransform(el('campusBase').getScreenCTM());showBuilding({clientX:p.x,clientY:p.y});
}
function addRows(box,rows){
 box.replaceChildren();for(const b of rows){const btn=document.createElement('button');btn.textContent=b.code+'　'+b.name;btn.onclick=()=>goBuilding(b.code);box.append(btn);}
}
query.oninput=()=>{const term=query.value.trim().toUpperCase();results.hidden=!term;if(!term)return;
 const matches=atlasCatalog.filter(b=>(b.code+' '+b.name).toUpperCase().includes(term));addRows(results,matches);if(!matches.length)results.textContent='没有匹配的建筑';};
query.onkeydown=e=>{if(e.key==='Enter'&&!results.hidden)results.querySelector('button')?.click();if(e.key==='Escape')results.hidden=true;if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('button')?.focus()}};
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.atlassearch'))results.hidden=true});
document.getElementById('atlasDirectory').onclick=()=>{addRows(document.getElementById('allBuildings'),atlasCatalog);dirDialog.showModal()};
document.getElementById('closeDir').onclick=()=>dirDialog.close();
