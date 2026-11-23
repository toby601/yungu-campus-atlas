const fs=require('node:fs'), path=require('node:path');
const site=path.join(__dirname,'site'),dir=path.join(site,'buildings');
const catalog=fs.readdirSync(dir).filter(f=>f.endsWith('.md')).map(file=>{
 const text=fs.readFileSync(path.join(dir,file),'utf8').replace(/\r\n/g,'\n');
 const record=text.match(/^# ([^\n]+)\n\s*分类：([^\n]+)\n\s*## 介绍\n([\s\S]*?)^## 来源\n([\s\S]*)$/m);
 if(!record)throw Error('格式有误：'+file);
 const [,name,category,body,source]=record,url=source.trim();
 if(url&&!/^https?:\/\/\S+$/.test(url))throw Error('来源应为完整网址：'+file);
 return {code:path.basename(file,'.md'),name,category,summary:body.trim(),url};
}).sort((a,b)=>a.code.localeCompare(b.code,'en',{numeric:true}));
fs.writeFileSync(path.join(site,'catalog.js'),'const atlasCatalog='+JSON.stringify(catalog)+';\n');
console.log('已生成 '+catalog.length+' 项建筑目录');
