import {writeFile,readFile} from 'node:fs/promises';
const queries=['Gulab jamun','Kesari bath','Badam burfi','rice payasam','Baby corn 65','Gobi 65','Palak pakoda','Vegetable biryani','Peas pulao','Lemon rice','Bisi bele bath','Rumali roti','Paneer masala','Bagara baingan','Chole masala','Pav bhaji','Fruit juice','Vanilla ice cream','Idli','Poori','White rice cooked','Dal tadka','Sambar','Rasam','Papad','Curd bowl','Sweet paan'];
const results=[];
for(const query of queries){try{
 const u=new URL('https://commons.wikimedia.org/w/api.php');u.search=new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:query+' filetype:bitmap',gsrnamespace:'6',gsrlimit:'3',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'480'});
 const res=await fetch(u,{headers:{'User-Agent':'SriVinayakaCatalog/1.0 (website photo attribution research)'}});if(!res.ok)throw Error(res.status);const data=await res.json();const candidates=Object.values(data.query?.pages||{}).map(p=>({title:p.title,...p.imageinfo?.[0]}));results.push({query,candidates});console.log(query+': '+candidates.map(p=>p.title).join(' | '));
 }catch(e){console.log(query+': '+e.message);}}
await writeFile('research/photo-candidates.json',JSON.stringify(results,null,2));
