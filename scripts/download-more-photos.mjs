import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
const mapping=JSON.parse(await readFile('research/dish-wiki-titles.json','utf8'));
const articles=JSON.parse(await readFile('research/wiki-articles.json','utf8'));
const metadata=JSON.parse(await readFile('research/wiki-imageinfo.json','utf8')).flatMap(r=>Object.values(r.query?.pages||{}));
const redirects=new Map(articles.flatMap(a=>[...(a.query?.normalized||[]),...(a.query?.redirects||[])].map(r=>[r.from,r.to])));
const resolve=t=>{for(let n=0;n<10&&redirects.has(t);n++)t=redirects.get(t);return t;};
const articlePages=articles.flatMap(a=>Object.values(a.query?.pages||{}));
const candidates=[];await mkdir('research/more-photo-review',{recursive:true});
for(const [id,title] of Object.entries(mapping)){
 const article=articlePages.find(a=>a.title===resolve(title));if(!article?.pageimage)continue;
 const p=metadata.find(p=>p.title.slice(5).replaceAll('_',' ')===article.pageimage.replaceAll('_',' '));const info=p?.imageinfo?.[0];const m=info?.extmetadata;
 if(!m||!info.thumburl||!/^image\/(jpeg|png|webp)$/.test(info.mime||'image/jpeg'))continue;
 const license=m.LicenseShortName?.value||'';if(!/^(CC BY-SA [\d.]|CC BY [\d.]|CC0|Public domain)/.test(license))continue;
 const file=`dish-${id}.jpg`,local=`research/more-photo-review/${file}`;
 const candidate={id,file,title:p.title,article:article.title,creator:(m.Artist?.value||m.Credit?.value||'See source attribution').replace(/<[^>]*>/g,''),source:info.descriptionurl,license,licenseURL:m.LicenseUrl?.value||'https://creativecommons.org/publicdomain/mark/1.0/',changes:'Wikimedia thumbnail; displayed cropped to fit dish cards.',description:(m.ImageDescription?.value||'').replace(/<[^>]*>/g,''),thumburl:info.thumburl};
 try{await access(local);candidates.push(candidate);continue;}catch{}
 const res=await fetch(info.thumburl,{headers:{'User-Agent':'SriVinayakaCatalog/1.0'}});
 if(res.status===429){console.log('Rate limited; stopping downloads. Retry after '+res.headers.get('retry-after'));break;}
 if(!res.ok){console.log('Unavailable '+id+' '+res.status);continue;}
 const bytes=Buffer.from(await res.arrayBuffer());if(bytes.length>500000){console.log('Oversized '+id);continue;}
 await writeFile(local,bytes);candidates.push(candidate);console.log(`${candidates.length}. ${id}: ${p.title}`);await new Promise(r=>setTimeout(r,1200));
}
await writeFile('research/more-photo-candidates.json',JSON.stringify(candidates,null,2));
