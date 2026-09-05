import {escapeHTML as e, money, photoURL, publicCatalog, localDate, buildRequest, requestText, dishImage, photoCaption} from './shared.js';
const $=s=>document.querySelector(s);
let catalog,category='all',showSelected=false,request=null,picker=null;
const selection={planId:null,itemIds:[],excluded:[],choices:{}};
const preview=new URLSearchParams(location.search).has('preview');
const allItems=()=>catalog.categories.flatMap(c=>c.items);
const currentPlan=()=>catalog.plans.find(p=>p.id===selection.planId);
let toastTimer;
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function imageMarkup(item,cls=''){return `<img class="${cls}" src="${e(dishImage(item))}" alt="${e(item.image?`${item.name} — ${photoCaption(item)}`:`Photo unavailable for ${item.name}`)}" loading="lazy" width="100" height="100">`;}
function price(value){return catalog.ordering.pricesApproved&&Number.isFinite(value)?`${money(value)} / guest`:'Quote on request';}
function dishCard(item,selected,action='dish'){return `<article class="dish-card ${selected?'selected':''}"><div class="dish-visual">${imageMarkup(item)}${item.image?`<span class="photo-label">${e(photoCaption(item))}</span>`:''}</div><div class="dish-info"><h4>${e(item.name)}</h4>${item.description?`<p>${e(item.description)}</p>`:''}<div class="dish-bottom"><span>${action==='slot'?'Package choice':e(price(item.price))}</span><button class="add-button" data-${action}="${e(item.id)}" aria-label="${selected?'Remove':'Select'} ${e(item.name)}" aria-pressed="${selected}">${selected?'✓ Added':'+ Add'}</button></div></div></article>`;}
function renderPlans(){
 $('#packages-list').innerHTML=catalog.plans.map(p=>`<article class="package-card ${p.id===selection.planId?'selected':''}"><figure><img src="${e(photoURL(p.image)||'./input_photos/photo-pending.svg')}" alt="${e(p.name)} — ${p.illustrative===false?"caterer photograph":"illustrative serving suggestion"}" width="360" height="200" loading="lazy"><figcaption class="photo-label">${p.image?(p.illustrative===false?'Caterer’s photograph':'Serving inspiration'):'Photo pending'}</figcaption></figure><div class="package-body"><p class="eyebrow">${e(p.badge)}</p><h3>${e(p.name)}</h3><p>${e(p.description)}</p><div class="package-meta"><span>${p.includes.length} inclusions</span><strong>${e(price(p.pricePerPlate))}</strong></div><button class="button ${p.id===selection.planId?'quiet':'primary'} full-width" data-plan="${e(p.id)}">${p.id===selection.planId?'Customize your dishes':'Choose '+e(p.name)} →</button></div></article>`).join('')||'<p class="empty">Build your own menu from the dishes below.</p>';
 renderCustomizer();
}
function renderCustomizer(){
 const p=currentPlan(),box=$('#package-customizer');box.hidden=!p;if(!p)return;
 const items=allItems();
 const slotLabels=new Set(p.slots.map(s=>s.label));
 const standardInclusions=p.includes.filter(label=>!slotLabels.has(label));
 box.innerHTML=`<div class="package-custom"><div class="custom-heading"><div><h3>Your ${e(p.name)}.</h3><p>Choose the dishes you love. Untick any inclusion to leave it out.</p></div><button class="button quiet" id="remove-package">Remove package</button></div><div class="inclusion-grid">
 ${p.slots.map(slot=>{
 const excluded=selection.excluded.includes(slot.label),chosen=(selection.choices[slot.id]||[]).map(id=>items.find(i=>i.id===id)).filter(Boolean);
 return `<div class="inclusion"><label class="inclusion-label"><input type="checkbox" data-inclusion="${e(slot.label)}" ${excluded?'':'checked'}><strong>${e(slot.label)}</strong></label>${excluded?'<p class="muted">Excluded from your request</p>':`<div class="slot-choices">${chosen.map(i=>`<div class="slot-choice">${imageMarkup(i)}<span>${e(i.name)}<br><small>${e(photoCaption(i))}</small></span></div>`).join('')}</div>${chosen.length<slot.count?`<p class="slot-status">Choose ${slot.count} · ${chosen.length} selected</p>`:''}<button class="button quiet choose-slot" data-pick="${e(slot.id)}">${chosen.length?'Change dishes':'Choose dishes'} →</button>`}</div>`;
 }).join('')}
 ${standardInclusions.map(label=>{
 const excluded=selection.excluded.includes(label);
 return `<div class="inclusion"><label class="inclusion-label"><input type="checkbox" data-inclusion="${e(label)}" ${excluded?'':'checked'}><strong>${e(label)}</strong></label><p class="muted">${excluded?'Excluded from your request':'Included standard with plate'}</p></div>`;
 }).join('')}
 </div><p class="muted">Package prices, if shown, are indicative. Exclusions and additions need a revised quote.</p></div>`;
}
function renderMenu(){
 const query=$('#search').value.trim().toLowerCase();
 const visible=catalog.categories.filter(c=>category==='all'||c.id===category).flatMap(c=>c.items).filter(i=>(!query||(i.name+' '+i.description).toLowerCase().includes(query))&&(!showSelected||selection.itemIds.includes(i.id)));
 $('#categories').innerHTML=[{id:'all',name:'All dishes'},...catalog.categories].map(c=>`<button data-category="${e(c.id)}" aria-pressed="${category===c.id}">${e(c.name)}</button>`).join('');
 $('#category-title').textContent=showSelected?'Your additions':category==='all'?'All your favourites':catalog.categories.find(c=>c.id===category)?.name;
 $('#dish-count').textContent=`${visible.length} dishes`;
 $('#dishes').innerHTML=visible.map(i=>dishCard(i,selection.itemIds.includes(i.id))).join('')||'<p class="empty">No dishes here yet. Try another category, clear your search, or turn off “Selected”.</p>';
 $('#selected-filter').setAttribute('aria-pressed',String(showSelected));
 $('#selected-count').textContent=selection.itemIds.length;
}
function summary(){
 const p=currentPlan(),count=selection.itemIds.length;
 $('#menu-bar').hidden=!p&&!count;
 $('#menu-summary').textContent=p?`${p.name}${count?' + '+count+' additions':''}`:`${count} dish${count===1?'':'es'} selected`;
 $('#selected-count').textContent=count;
 $('#menu-bar small').textContent=`${$('#main-guests').value||'—'} GUESTS · YOUR MENU`;
}
function choosePlan(id){if(id!==selection.planId){selection.planId=id;selection.excluded=[];selection.choices={};currentPlan().slots.forEach(s=>{if(s.itemIds.length===1&&allItems().some(i=>i.id===s.itemIds[0]))selection.choices[s.id]=[s.itemIds[0]];});}renderPlans();summary();$('#package-customizer').scrollIntoView({behavior:'smooth',block:'start'});}
function openPicker(id){
 const slot=currentPlan().slots.find(s=>s.id===id);picker={slot,ids:[...(selection.choices[id]||[])]};
 $('#picker-title').textContent=slot.label;$('#picker-search').value='';renderPicker();$('#picker-dialog').showModal();
}
function renderPicker(){
 const q=$('#picker-search').value.toLowerCase();const items=allItems().filter(i=>picker.slot.itemIds.includes(i.id)&&i.name.toLowerCase().includes(q));
 $('#picker-help').textContent=`Choose ${picker.slot.count}. ${picker.ids.length} selected.`;
 $('#picker-list').innerHTML=items.map(i=>dishCard(i,picker.ids.includes(i.id),'slot')).join('')||'<p class="empty">No matching dishes available. Try another search or exclude this inclusion.</p>';
 $('#picker-done').disabled=picker.ids.length!==picker.slot.count;
}
function reviewDish(d){const item=allItems().find(i=>i.id===d.id);return `<div class="review-dish">${imageMarkup(item)}<div>${e(d.name)}<small>${e(d.slot||'Additional dish')} · ${e(photoCaption(item))}</small></div></div>`;}
function review(r){
 $('#review-content').innerHTML=`<dl class="review-event"><dt>Name</dt><dd>${e(r.customer.name)}</dd><dt>Contact</dt><dd>${e(r.customer.phone)}</dd><dt>Date</dt><dd>${e(r.event.date)}</dd><dt>Guests</dt><dd>${r.event.guests}</dd><dt>Occasion</dt><dd>${e(r.event.occasion)} · ${e(r.event.service)}</dd><dt>Venue</dt><dd>${e(r.event.venue)}</dd></dl><div class="review-block"><h3>${e(r.menu.package?.name||'Your own menu')}</h3>${r.menu.package?.dishes.map(reviewDish).join('')||''}${r.menu.package?.excluded.length?`<p><strong>Excluded:</strong> ${e(r.menu.package.excluded.join(', '))}</p>`:''}${r.menu.dishes.length?`<h3>${r.menu.package?'Additions':'Selected dishes'}</h3>${r.menu.dishes.map(reviewDish).join('')}`:''}</div>${r.event.notes?`<div class="review-block"><h3>Your notes</h3><p>${e(r.event.notes)}</p></div>`:''}<div class="review-block"><h3>${r.pricing.estimatedTotal===null?'A personal quote for your menu':e(money(r.pricing.estimatedTotal))+' · indicative'}</h3><p>${e(r.pricing.note)}</p></div>`;
 const text=requestText(r);$('#request-message').value=text;
 $('#whatsapp-link').href=`https://wa.me/${catalog.business.whatsappNumber}?text=${encodeURIComponent(text)}`;
 $('#handoff-status').hidden=true;
 if(preview){$('#whatsapp-link').removeAttribute('href');$('#whatsapp-link').textContent='Owner preview · WhatsApp handoff disabled';}
 $('#review-dialog').showModal();
}
async function load(){try{
 let data;
 try {
  const res=await fetch(preview?'/api/admin/draft':'/api/catalog',{cache:'no-store'});
  if(res.ok) data = await res.json();
 }catch{}
 if(!data){
  const staticRes=await fetch('./catalog.json');
  if(staticRes.ok) data = {catalog: await staticRes.json()};
  else throw Error('Unable to load menu.');
 }
 catalog=publicCatalog(data.catalog);
 if(preview)$('#preview-banner').hidden=false;
 $('#catalog-status').hidden=true;
 $('#business-description').textContent=catalog.business.description;
 $('#hero-image').src=photoURL(catalog.business.heroImage)||'./input_photos/photo-pending.svg';
 $('#hero-image').alt=catalog.business.heroImage?(catalog.business.heroIllustrative===false?'Sri Vinayaka Caterers serving photograph':'Representative catering serving presentation'):'Catering photo pending';
 $('.hero-visual figcaption').textContent=catalog.business.heroImage?(catalog.business.heroIllustrative===false?'From our celebrations · caterer’s photograph':'Serving inspiration · representative photograph'):'Catering photograph pending';
 $('#call-link').href=`tel:${catalog.business.phone}`;$('#review-call').href=`tel:${catalog.business.phone}`;
 $('#contact-details').innerHTML=`<a href="tel:${e(catalog.business.phone)}">${e(catalog.business.phone)}</a><a href="tel:${e(catalog.business.alternatePhone)}">${e(catalog.business.alternatePhone)}</a><a class="email" href="mailto:${e(catalog.business.email)}">${e(catalog.business.email)}</a><address>${e(catalog.business.address)}</address>`;
 $('#event-form').elements.date.min=localDate();$('#event-form').elements.guests.min=catalog.ordering.minimumGuests;$('#main-guests').min=catalog.ordering.minimumGuests;$('#main-guests').value=Math.max(100,catalog.ordering.minimumGuests);$('#event-form').elements.guests.value=$('#main-guests').value;$('#main-guest-hint').textContent=`A little gathering or a grand celebration · minimum ${catalog.ordering.minimumGuests}`;$('#guest-hint').textContent=`Minimum ${catalog.ordering.minimumGuests} guests`;
 renderPlans();renderMenu();summary();
 }catch(err){$('#catalog-status').innerHTML=`${e(err.message)} <a href="tel:+919618406012">Call +91 96184 06012</a> or <button class="text-link" id="retry-load">try again</button>.`;}}
$('#year').textContent=new Date().getFullYear();
document.body.insertAdjacentHTML('beforeend',`<dialog id="picker-dialog" class="sheet" aria-labelledby="picker-title"><div class="dialog-top"><p class="eyebrow">MAKE YOUR PACKAGE YOURS</p><button class="icon-button" data-close aria-label="Close dish picker">×</button></div><h2 id="picker-title"></h2><p id="picker-help"></p><input id="picker-search" type="search" placeholder="Find a dish in this choice…" aria-label="Search package dishes"><div id="picker-list" class="slot-picker-list"></div><div class="slot-picker-footer"><button class="button primary full-width" id="picker-done">Keep these dishes</button></div></dialog>`);
document.addEventListener('click',ev=>{
 const b=ev.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-close'))b.closest('dialog').close();
 if(b.id==='retry-load')load();
 if(!catalog)return;
 if(b.dataset.plan)choosePlan(b.dataset.plan);
 if(b.id==='remove-package'){selection.planId=null;selection.excluded=[];selection.choices={};renderPlans();summary();}
 if(b.dataset.pick)openPicker(b.dataset.pick);
 if(b.dataset.slot){const id=b.dataset.slot;if(picker.ids.includes(id))picker.ids=picker.ids.filter(i=>i!==id);else if(picker.slot.count===1)picker.ids=[id];else if(picker.ids.length<picker.slot.count)picker.ids.push(id);else{toast(`Choose up to ${picker.slot.count}. Remove a dish first.`);return;}renderPicker();}
 if(b.id==='picker-done'){selection.choices[picker.slot.id]=picker.ids;$('#picker-dialog').close();renderCustomizer();}
 if(b.dataset.category){category=b.dataset.category;renderMenu();$('#categories').querySelector('[aria-pressed=true]')?.scrollIntoView({block:'nearest',inline:'nearest'});}
 if(b.dataset.dish){const id=b.dataset.dish;if(selection.itemIds.includes(id))selection.itemIds=selection.itemIds.filter(x=>x!==id);else{if(selection.itemIds.length>=40){toast('Choose up to 40 additions; mention any others in your notes.');return;}selection.itemIds.push(id);}renderMenu();summary();}
 if(b.id==='selected-filter'){showSelected=!showSelected;renderMenu();}
 if(b.id==='event-button'){if(!$('#main-guests').reportValidity())return;$('#event-form').elements.guests.value=$('#main-guests').value;$('#event-form').elements.date.min=localDate();$('#event-dialog').showModal();}
 if(b.id==='edit-event'){$('#review-dialog').close();$('#event-dialog').showModal();}
 if(b.id==='copy-request'){navigator.clipboard.writeText($('#request-message').value).then(()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy request',2500);}).catch(()=>{$('#request-message').closest('details').open=true;$('#request-message').select();});}
 if(b.id==='privacy-button'){$('#info-title').textContent='Your privacy';$('#info-content').innerHTML='<p>Your name, phone and event details stay in this page until you choose to open WhatsApp. We do not store customer requests on this website or use advertising cookies. Opening WhatsApp passes your request text to WhatsApp, whose privacy terms apply. You must tap Send there for the owner to receive it.</p><p>Cloudflare hosts this website and may process basic connection data to provide and protect it. The owner dashboard uses a secure session cookie for sign-in. For questions about a request you sent, contact the caterer using the details below.</p>';$('#info-dialog').showModal();}
 if(b.id==='credits-button'){$('#info-title').textContent='About our photographs';$('#info-content').innerHTML='<p>Real stock photographs show serving inspiration and are not photographs of Sri Vinayaka Caterers’ actual dishes. Dishes without an appropriate photograph are marked “Photo pending”.</p>'+catalog.photoCredits.map(p=>`<p><a href="${e(p.source)}" target="_blank" rel="noopener noreferrer">${e(p.file)} · ${e(p.creator)}</a>${p.license?` · <a href="${e(p.licenseURL)}" target="_blank" rel="noopener noreferrer">${e(p.license)}</a><br><small>${e(p.changes)}</small>`:''}</p>`).join('');$('#info-dialog').showModal();}
});
document.addEventListener('change',ev=>{if(ev.target.dataset.inclusion){const label=ev.target.dataset.inclusion;selection.excluded=ev.target.checked?selection.excluded.filter(x=>x!==label):[...selection.excluded,label];renderCustomizer();}});
$('#search').addEventListener('input',renderMenu);$('#picker-search').addEventListener('input',renderPicker);
$('#event-form').addEventListener('submit',ev=>{ev.preventDefault();try{const data=Object.fromEntries(new FormData(ev.target));data.guests=Number(data.guests);request=buildRequest(catalog,selection,data);$('#event-error').hidden=true;$('#event-dialog').close();review(request);}catch(err){$('#event-error').textContent=err.message;$('#event-error').hidden=false;}});
$('#whatsapp-link').addEventListener('click',()=>{if(!preview)$('#handoff-status').hidden=false;});
$('#main-guests').addEventListener('input',()=>{if(catalog)summary();});
$('#event-form').elements.guests.addEventListener('input',ev=>{$('#main-guests').value=ev.target.value;summary();});
load();
