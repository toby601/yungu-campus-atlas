const fs=require('node:fs'), path=require('node:path');
const site=path.join(__dirname,'site'),dir=path.join(site,'buildings');
const catalog=fs.readdirSync(dir).filter(f=>f.endsWith('.md') && f!=='README.md').map(file=>{
 const text=fs.readFileSync(path.join(dir,file),'utf8').replace(/\r\n/g,'\n');
 const record=text.match(/^# ([^\n]+)\n\s*分类：([^\n]+)\n\s*## 介绍\n([\s\S]*?)^## 来源\n([\s\S]*)$/m);
 if(!record)throw Error('格式有误：'+file);
 const [,name,category,body,source]=record,url=source.trim();
 if(url&&!/^https?:\/\/\S+$/.test(url))throw Error('来源应为完整网址：'+file);
 return {code:path.basename(file,'.md'),name,category,summary:body.trim(),url};
}).sort((a,b)=>a.code.localeCompare(b.code,'en',{numeric:true}));
fs.writeFileSync(path.join(site,'catalog.js'),'const atlasCatalog='+JSON.stringify(catalog)+';\n');
const index=['# 建筑介绍','','按楼号首字母分区，区内按数字从小到大排列。'];
let section='';
for(const {code,name} of catalog){
 if(code[0]!==section){
  section=code[0];
  index.push('', '## '+section+' 区', '');
 }
 index.push('- ['+code+' '+name+'](./'+encodeURIComponent(code)+'.md)');
}
fs.writeFileSync(path.join(dir,'README.md'),index.join('\n')+'\n');
console.log('已生成 '+catalog.length+' 项建筑目录');
