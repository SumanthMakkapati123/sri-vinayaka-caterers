import {readFile,writeFile} from 'node:fs/promises';
const mapping=JSON.parse(await readFile('research/dish-wiki-titles.json','utf8'));
const headers={'User-Agent':'SriVinayakaCatalog/1.0 (food photograph and license research)'};
const titles=[...new Set(Object.values(mapping))];const articles=[];
for(let i=0;i<titles.length;i+=40){const u=new URL('https://en.wikipedia.org/w/api.php');u.search=new URLSearchParams({action:'query',format:'json',titles:titles.slice(i,i+40).join('|'),redirects:'1',prop:'pageimages',piprop:'name|thumbnail',pithumbsize:'480'});const r=await fetch(u,{headers});if(!r.ok)throw Error(r.status+' '+await r.text());const d=await r.json();articles.push(d);console.log(`Articles ${i+1}–${Math.min(i+40,titles.length)}: ${Object.values(d.query?.pages||{}).filter(p=>p.pageimage).length} images`);await new Promise(r=>setTimeout(r,2500));}
await writeFile('research/wiki-articles.json',JSON.stringify(articles,null,2));
const files=[...new Set(articles.flatMap(a=>Object.values(a.query?.pages||{}).map(p=>p.pageimage).filter(Boolean)))];const info=[];
for(let i=0;i<files.length;i+=40){const u=new URL('https://commons.wikimedia.org/w/api.php');u.search=new URLSearchParams({action:'query',format:'json',titles:files.slice(i,i+40).map(f=>'File:'+f).join('|'),prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'480'});const r=await fetch(u,{headers});if(!r.ok)throw Error(r.status);const d=await r.json();info.push(d);console.log(`License records ${i+1}–${Math.min(i+40,files.length)}`);await new Promise(r=>setTimeout(r,2500));}
await writeFile('research/wiki-imageinfo.json',JSON.stringify(info,null,2));
