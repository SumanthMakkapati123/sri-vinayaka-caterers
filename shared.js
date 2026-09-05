export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
export function localDate() { return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
export function photoURL(path) { return path?.startsWith('/media/') ? path : path ? `./input_photos/${path}` : ''; }
export function publicCatalog(c) {
 const copy = structuredClone(c);
 copy.plans = copy.plans.filter(p=>p.visible!==false);
 copy.categories = copy.categories.filter(c=>c.visible!==false).map(c=>({...c,items:c.items.filter(i=>i.visible!==false)}));
 if (!copy.ordering.pricesApproved) {copy.plans.forEach(p=>p.pricePerPlate=null);copy.categories.forEach(c=>c.items.forEach(i=>i.price=null));}
 return copy;
}
export function validateCatalog(c) {
 const fail = m=>{throw new Error(m);};
 const str=(s,label,max=300,required=false)=>{if(typeof s!=='string'||s.length>max||(required&&!s.trim()))fail(`${label}: enter ${required?'a value of ':''}up to ${max} characters.`);};
 const price=(n)=>{if(n!==null&&(!Number.isFinite(n)||n<0||n>100000))fail('Prices must be blank or between ₹0 and ₹100,000.');};
 const photo=(p)=>{if(typeof p!=='string'||(p&&!/^(?:[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)|\/media\/[a-f0-9-]{36})$/.test(p)))fail('Choose a photo from the photo library.');};
 const visible=o=>{if(typeof o.visible!=='boolean')fail('Visibility must be on or off.');};
 if(!c||c.schemaVersion!==1||!c.business||!c.ordering||!Array.isArray(c.plans)||!Array.isArray(c.categories))fail('Unsupported catalog format.');
 const b=c.business;
 for(const key of ['name','tagline','description','phone','alternatePhone','whatsappNumber','email','address'])str(b[key],key,key==='description'?600:300,true);
 if(!/^\+\d{10,15}$/.test(b.phone)||!/^\+\d{10,15}$/.test(b.alternatePhone)||!/^\d{10,15}$/.test(b.whatsappNumber))fail('Use country code and phone number; WhatsApp uses digits only.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))fail('Enter a valid email.');
 photo(b.heroImage);
 if(!Number.isInteger(c.ordering.minimumGuests)||c.ordering.minimumGuests<10||c.ordering.minimumGuests>5000)fail('Minimum guests must be from 10 to 5,000.');
 if(typeof c.ordering.pricesApproved!=='boolean')fail('Set price approval.');
 str(c.ordering.priceNote,'Price note',500,true);
 if(c.plans.length>20||c.categories.length>30)fail('Limit: 20 packages and 30 categories.');
 const ids=new Set();let count=0;
 const item=(o)=>{if(!o||typeof o.id!=='string'||!/^[a-z0-9-]{1,80}$/.test(o.id)||ids.has(o.id))fail('Every entry needs a unique ID.');ids.add(o.id);str(o.name,'Name',100,true);str(o.description,'Description',500);visible(o);};
 for(const p of c.plans){item(p);price(p.pricePerPlate);photo(p.image);str(p.badge,'Badge',60);if(!Array.isArray(p.includes)||p.includes.length<1||p.includes.length>40)fail('Packages need 1–40 inclusions.');p.includes.forEach(s=>str(s,'Inclusion',100,true));if(new Set(p.includes).size!==p.includes.length)fail('Package inclusions must not repeat.');}
 for(const cat of c.categories){item(cat);if(!Array.isArray(cat.items))fail('Missing dishes.');for(const i of cat.items){item(i);count++;price(i.price);photo(i.image);if(typeof i.illustrative!=='boolean')fail('Set whether each dish photo is illustrative.');}}
 if(count>500)fail('Limit: 500 dishes.');
 const dishIds=new Set(c.categories.flatMap(c=>c.items.map(i=>i.id)));
 for(const p of c.plans){
  if(!Array.isArray(p.slots))fail('Every package needs dish choice slots.');
  const slotIds=new Set();
  for(const slot of p.slots){
   if(!slot||typeof slot.id!=='string'||slotIds.has(slot.id))fail('Package slot IDs must be unique.');slotIds.add(slot.id);
   str(slot.label,'Slot label',100,true);
   if(!p.includes.includes(slot.label)||!Number.isInteger(slot.count)||slot.count<1||slot.count>5||!Array.isArray(slot.itemIds)||slot.itemIds.length<slot.count||new Set(slot.itemIds).size!==slot.itemIds.length||slot.itemIds.some(id=>!dishIds.has(id)))fail('Each package slot needs enough valid dish choices.');
  }
 }
 if(!Array.isArray(c.photoCredits)||c.photoCredits.length>500)fail('Invalid photo credits.');
 for(const p of c.photoCredits){str(p.file,'Photo file',100,true);str(p.creator,'Photo creator',1000,true);str(p.source,'Photo source',300,true);if(!p.source.startsWith('https://'))fail('Photo credits require HTTPS links.');if(p.license){str(p.license,'License',100,true);str(p.licenseURL,'License URL',300,true);str(p.changes,'Photo changes',300,true);if(!p.licenseURL.startsWith('https://'))fail('License links require HTTPS.');}}
 if(JSON.stringify(c).length>250000)fail('Catalog is too large.');
 return c;
}
export function buildRequest(c, selection, event) {
 const plan=c.plans.find(p=>p.id===selection.planId);
 const items=c.categories.flatMap(c=>c.items).filter(i=>selection.itemIds.includes(i.id));
 if(!plan&&!items.length)throw new Error('Choose a package or at least one dish.');
 if(items.length>40)throw new Error('Please select up to 40 dishes, then describe any others in your notes.');
 if(!Number.isInteger(event.guests)||event.guests<c.ordering.minimumGuests||event.guests>5000)throw new Error(`Enter ${c.ordering.minimumGuests}–5,000 guests.`);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(event.date)||Number.isNaN(Date.parse(event.date))||new Date(event.date).toISOString().slice(0,10)!==event.date||event.date<localDate())throw new Error('Choose today or a future event date.');
 for(const [key,max] of [['name',80],['venue',250]])if(typeof event[key]!=='string'||!event[key].trim()||event[key].length>max)throw new Error(`Enter your ${key} (${max} characters maximum).`);
 if(!/^[+\d ()-]{10,20}$/.test(event.phone)||event.phone.replace(/\D/g,'').length<10)throw new Error('Enter a valid contact number.');
 if(typeof event.notes!=='string'||event.notes.length>1000)throw new Error('Keep notes within 1,000 characters.');
 const allItems=c.categories.flatMap(cat=>cat.items);
 const availableIds=new Set(allItems.map(i=>i.id));
 const selectedDishes=[];
 const slotLabels=new Set(plan?.slots.map(s=>s.label)||[]);
 const slotIncluded=plan?.slots.filter(slot=>!selection.excluded.includes(slot.label)).map(slot=>{
  const chosen=selection.choices?.[slot.id]||[];
  if(chosen.length!==slot.count||new Set(chosen).size!==chosen.length||chosen.some(id=>!slot.itemIds.includes(id)||!availableIds.has(id)))throw new Error(`Choose ${slot.count} dish${slot.count>1?'es':''} for ${slot.label} in your package, or exclude that inclusion.`);
  const dishes=chosen.map(id=>allItems.find(i=>i.id===id));
  selectedDishes.push(...dishes.map(i=>({id:i.id,name:i.name,slot:slot.label})));
  return `${slot.label}: ${dishes.map(i=>i.name).join(', ')}`;
 })||[];
 const standardIncluded=plan?.includes.filter(s=>!slotLabels.has(s)&&!selection.excluded.includes(s)).map(s=>`${s}: Included`)||[];
 const included=[...slotIncluded,...standardIncluded];
 const excluded=plan?.includes.filter(s=>selection.excluded.includes(s))||[];
 if(plan&&!included.length)throw new Error('Keep at least one package inclusion, or remove the package to build your own menu.');
 const quoted=c.ordering.pricesApproved&&(!plan||Number.isFinite(plan.pricePerPlate))&&items.every(i=>Number.isFinite(i.price))&&!excluded.length;
 const perGuest=quoted?(plan?.pricePerPlate||0)+items.reduce((n,i)=>n+i.price,0):null;
 return {business:c.business.name,customer:{name:event.name.trim(),phone:event.phone.trim()},event:{date:event.date,guests:event.guests,venue:event.venue.trim(),occasion:event.occasion,service:event.service,notes:event.notes.trim()},menu:{package:plan?{id:plan.id,name:plan.name,included,excluded,dishes:selectedDishes}:null,dishes:items.map(i=>({id:i.id,name:i.name}))},pricing:{estimatedTotal:perGuest===null?null:perGuest*event.guests,note:c.ordering.priceNote},status:'Request to be sent by customer; owner confirmation required'};
}
export function requestText(r) {
 const p=r.menu.package;
 const lines=[
  `*Namaste ${r.business}!* 🙏`,
  `*New Catering Enquiry*`,
  `━━━━━━━━━━━━━━━━━━━━`,
  ``,
  `📋 *EVENT DETAILS*`,
  `• Name: ${r.customer.name}`,
  `• Phone: ${r.customer.phone}`,
  `• Date: ${r.event.date}`,
  `• Guests: ${r.event.guests}`,
  `• Occasion: ${r.event.occasion} (${r.event.service})`,
  `• Venue / area: ${r.event.venue}`,
  ``,
  `🍽️ *MENU: ${p?.name||'Build my own menu'}*`
 ];

 if(p){
  p.included.forEach(item=>lines.push(`• ${item}`));
  if(p.excluded.length){
   lines.push(``);
   lines.push(`🚫 Exclude: ${p.excluded.join(', ')}`);
  }
 }

 if(r.menu.dishes.length){
  lines.push(``);
  lines.push(`➕ *${p?'Additional dishes':'Selected dishes'}:*`);
  r.menu.dishes.forEach(d=>lines.push(`• ${d.name}`));
 }

 if(r.event.notes){
  lines.push(``);
  lines.push(`📝 *Notes / dietary needs:*`);
  lines.push(`${r.event.notes}`);
 }

 lines.push(``);
 lines.push(`━━━━━━━━━━━━━━━━━━━━`);
 if(r.pricing.estimatedTotal!==null){
  lines.push(`💰 *Indicative estimate:* ${money(r.pricing.estimatedTotal)}`);
 }else{
  lines.push(`💰 *Price:* quote requested`);
 }
 lines.push(r.pricing.note);
 lines.push(``);
 lines.push(`_Please confirm availability, menu and final price. This is an enquiry, not a confirmed booking._`);

 return lines.join('\n');
}
export function dishImage(item) { return photoURL(item.image)||'./input_photos/photo-pending.svg'; }
export function photoCaption(item) { return !item.image?'Dish photo pending':item.illustrative?'Representative photo':'Caterer’s photo'; }
