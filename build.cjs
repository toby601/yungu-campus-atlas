const fs=require('node:fs'),path=require('node:path');
const site=path.join(__dirname,'site'),dir=path.join(site,'buildings');
const catalog=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>{
 const b=JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
 if(f!==b.code+'.json'||!b.name||typeof b.summary!=='string'||(b.url&&!/^https?:\/\//i.test(b.url)))throw Error('请检查 '+f);
 return b;
}).sort((a,b)=>a.code.localeCompare(b.code,'en',{numeric:true}));
fs.writeFileSync(path.join(site,'catalog.js'),'const atlasCatalog='+JSON.stringify(catalog)+';\n');
console.log('已生成 '+catalog.length+' 项建筑目录');
