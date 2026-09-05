import {writeFile} from 'node:fs/promises';
const queries=[
['sweets','"badam burfi" OR "almond barfi" OR "rava laddu" OR "Kakinada" OR "Kaja" OR "Coconut burfi" OR "Hayagreeva" OR "Semiya payasam" OR "Khubani" OR "Kaddu kheer" OR "Chum chum" OR "pineapple kesari" OR "Malai roll"'],
['snacks','"baby corn 65" OR "crispy baby corn" OR "Aloo 65" OR "onion pakoda" OR "cabbage pakoda" OR "potato pakora" OR "brinjal bajji" OR "banana bajji" OR "paneer pakora" OR "Bonda" OR "Goli baje" OR "Chivda"'],
['rice-bread','"Peas pulao" OR "Matar pulao" OR "Vangi bath" OR "Mooli paratha" OR "Methi paratha" OR "Palak puri" OR "Masala puri" OR "Peshwari naan" OR "Tomato rice" OR "Semiya upma" OR "Ragi idli" OR "Onion dosa" OR "Rava pongal"'],
['curries','"Gutti vankaya" OR "Dondakaya" OR "Ivy gourd" OR "Beans palya" OR "Cabbage curry" OR "Aloo methi" OR "Gawar" OR "Kootu" OR "Aloo tomato" OR "Vegetable kurma" OR "Malai kofta" OR "Stuffed tomato" OR "Suran fry" OR "Taro fry"'],
['dal-pickle','"Tomato dal" OR "Palak dal" OR "Gongura pappu" OR "Mango dal" OR "Dosakaya" OR "Majjiga" OR "Lemon rasam" OR "Mysore rasam" OR "Tomato rasam" OR "Gongura pickle" OR "Tomato pickle" OR "Allam pachadi" OR "Kandi podi" OR "curry leaf powder"'],
['extras','"Boondi raita" OR "Onion raita" OR "Tomato raita" OR "Dry fruit raita" OR "Cassata ice cream" OR "Butterscotch ice cream" OR "Kesar ice cream" OR "Tutti frutti ice cream" OR "Ragda" OR "Fruit chaat" OR "Corn soup" OR "Mango pickle" OR "Sweet paan"']
];
const results=[];
for(const [group,query] of queries){const u=new URL('https://commons.wikimedia.org/w/api.php');u.search=new URLSearchParams({action:'query',format:'json',generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:'80',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'480'});const r=await fetch(u,{headers:{'User-Agent':'SriVinayakaCatalog/1.0 (food photo license research)'}});if(r.status===429){console.log('Rate limited. Stopping.');break;}if(!r.ok)throw Error(r.status);const d=await r.json();const candidates=Object.values(d.query?.pages||{});results.push({group,candidates});console.log(group+': '+candidates.length+' candidates');await new Promise(r=>setTimeout(r,5000));}
await writeFile('research/specific-photo-candidates.json',JSON.stringify(results,null,2));
