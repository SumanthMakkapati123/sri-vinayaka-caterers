import seed from '../catalog.json';
import photoFiles from './photo-files.json';
const bundledPhotos=new Set(photoFiles);
import { validateCatalog, publicCatalog } from '../shared.js';
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const hex=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
const hash=async s=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
const bad=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
async function body(req,max=260000){if(Number(req.headers.get('Content-Length'))>max)bad('Upload too large.',413);const reader=req.body?.getReader();if(!reader)bad('Missing request body.');let size=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();bad('Upload too large.',413);}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}return bytes;}
async function readJSON(req,max){try{return JSON.parse(new TextDecoder().decode(await body(req,max)));}catch(e){if(e.status)throw e;bad('Invalid request JSON.');}}
function cookie(req,value,age){const secure=new URL(req.url).protocol==='https:';return `${secure?'__Host-':''}svc_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${secure?'; Secure':''}`;}
function token(req){const key=new URL(req.url).protocol==='https:'?'__Host-svc_session':'svc_session';return req.headers.get('Cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(key+'='))?.slice(key.length+1)||'';}
async function authenticated(req,env){const t=token(req);if(!/^[a-f0-9]{64}$/.test(t))return false;const s=await env.DB.prepare('SELECT expires FROM sessions WHERE token = ?').bind(await hash(t)).first();return Boolean(s&&s.expires>Date.now());}
async function state(env){await env.DB.prepare('INSERT OR IGNORE INTO catalog (id,live,draft,revision) VALUES (1,?,?,0)').bind(JSON.stringify(seed),JSON.stringify(seed)).run();return env.DB.prepare('SELECT * FROM catalog WHERE id=1').first();}
async function checkPhotos(c,env){const stored=new Set((await env.DB.prepare('SELECT id FROM photos').all()).results.map(p=>p.id));for(const path of new Set([c.business.heroImage,...c.plans.map(p=>p.image),...c.categories.flatMap(cat=>cat.items.map(i=>i.image))].filter(Boolean))){if(path.startsWith('/media/')){if(!stored.has(path.slice(7)))bad('A selected photo no longer exists. Choose another photo.');}else{if(!bundledPhotos.has(path))bad('A selected photo is missing from the library.');}}}
export default {async fetch(req,env){try{
 const url=new URL(req.url),path=url.pathname;
 if(!path.startsWith('/api/')&&!path.startsWith('/media/'))return env.ASSETS.fetch(req);
 if(!env.DB)return json({error:'Catalog service is not configured. Please call the caterer.'},503);
 if(!['GET','HEAD'].includes(req.method)&&req.headers.get('Origin')!==url.origin)bad('This request must come from this website.',403);
 if(path==='/api/catalog'&&req.method==='GET'){
  const row=await env.DB.prepare('SELECT live,published_at FROM catalog WHERE id=1').first();
  return json({catalog:publicCatalog(row?JSON.parse(row.live):seed),publishedAt:row?.published_at||null});
 }
 if(path.startsWith('/media/')&&['GET','HEAD'].includes(req.method)){
  const id=path.slice(7);if(!/^[a-f0-9-]{36}$/.test(id))bad('Photo not found.',404);
  const photo=await env.DB.prepare('SELECT type,data FROM photos WHERE id=?').bind(id).first();if(!photo)bad('Photo not found.',404);
  return new Response(req.method==='HEAD'?null:(Array.isArray(photo.data)?new Uint8Array(photo.data):photo.data),{headers:{'Content-Type':photo.type,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
 }
 if(path==='/api/admin/login'&&req.method==='POST'){
  if(!env.OWNER_PASSWORD_HASH)bad('Owner sign-in is not configured. Ask the site maintainer to set the owner password.',503);
  const {password}=await readJSON(req,2000);if(typeof password!=='string'||password.length>256)bad('Invalid password.',401);
  const now=Date.now();const key=await hash(req.headers.get('CF-Connecting-IP')||'local');
  // Atomic fixed window. Reserve an attempt before verification; concurrent requests cannot bypass it.
  const limit=await env.DB.prepare('INSERT INTO login_limits(key,attempts,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN expires<=? THEN 1 ELSE attempts+1 END, expires=CASE WHEN expires<=? THEN ? ELSE expires END RETURNING attempts').bind(key,now+900000,now,now,now+900000).first();
  if(limit.attempts>5)bad('Too many attempts. Try again in 15 minutes.',429);
  const [alg,rounds,salt,expected]=env.OWNER_PASSWORD_HASH.split(':');
  if(alg!=='pbkdf2'||rounds!=='100000'||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{64}$/.test(expected))bad('Owner sign-in needs configuration.',503);
  const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const actual=hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:Number(rounds),hash:'SHA-256'},k,256));
  let diff=0;for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^actual.charCodeAt(i);
  if(diff)bad('Incorrect password.',401);
  const t=hex(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE expires <= ?').bind(now),env.DB.prepare('DELETE FROM login_limits WHERE expires <= ? OR key=?').bind(now,key),env.DB.prepare('INSERT INTO sessions(token,expires) VALUES(?,?)').bind(await hash(t),now+28800000)]);
  return json({ok:true},200,{'Set-Cookie':cookie(req,t,28800)});
 }
 if(!path.startsWith('/api/admin/'))bad('Not found.',404);
 if(!await authenticated(req,env))bad('Please sign in to the owner dashboard.',401);
 if(path==='/api/admin/logout'&&req.method==='POST'){await env.DB.prepare('DELETE FROM sessions WHERE token=?').bind(await hash(token(req))).run();return json({ok:true},200,{'Set-Cookie':cookie(req,'',0)});}
 if(path==='/api/admin/session'&&req.method==='GET')return json({ok:true});
 if(path==='/api/admin/draft'&&req.method==='GET'){const row=await state(env);return json({catalog:JSON.parse(row.draft),revision:row.revision,publishedAt:row.published_at});}
 if(path==='/api/admin/draft'&&req.method==='PUT'){
  const data=await readJSON(req);validateCatalog(data.catalog);await checkPhotos(data.catalog,env);
  const result=await env.DB.prepare('UPDATE catalog SET draft=?, revision=revision+1 WHERE id=1 AND revision=? RETURNING revision').bind(JSON.stringify(data.catalog),data.revision).first();
  if(!result)bad('Another session changed the catalog. Export your edits, then reload before saving.',409);return json(result);
 }
 if(path==='/api/admin/publish'&&req.method==='POST'){
  const {revision}=await readJSON(req,1000);const row=await state(env);if(row.revision!==revision)bad('The draft changed. Reload and review before publishing.',409);
  const c=validateCatalog(JSON.parse(row.draft));await checkPhotos(c,env);const visibleIds=new Set(c.categories.filter(cat=>cat.visible).flatMap(cat=>cat.items.filter(i=>i.visible).map(i=>i.id)));for(const p of c.plans.filter(p=>p.visible))for(const s of p.slots)if(s.itemIds.filter(id=>visibleIds.has(id)).length<s.count)bad(`${p.name}: ${s.label} needs ${s.count} visible dish choice(s). Make dishes visible or update this inclusion.`);if(!c.plans.some(p=>p.visible)&&!c.categories.some(c=>c.visible&&c.items.some(i=>i.visible)))bad('Make at least one package or dish visible before publishing.');
  const now=new Date().toISOString();
  const results=await env.DB.batch([
   env.DB.prepare('INSERT INTO history(catalog,created_at) SELECT live,? FROM catalog WHERE id=1 AND revision=?').bind(now,revision),
   env.DB.prepare('UPDATE catalog SET live=draft,published_at=?,revision=revision+1 WHERE id=1 AND revision=? RETURNING revision').bind(now,revision),
   env.DB.prepare('DELETE FROM history WHERE id NOT IN (SELECT id FROM history ORDER BY id DESC LIMIT 10)')]);
  const updated=results[1].results[0];if(!updated)bad('Draft changed while publishing. Reload and review.',409);return json({...updated,publishedAt:now});
 }
 if(path==='/api/admin/history'&&req.method==='GET')return json({history:(await env.DB.prepare('SELECT id,created_at FROM history ORDER BY id DESC').all()).results});
 if(path==='/api/admin/restore'&&req.method==='POST'){
  const {id,revision}=await readJSON(req,1000);const old=await env.DB.prepare('SELECT catalog FROM history WHERE id=?').bind(id).first();if(!old)bad('Backup not found.',404);
  const result=await env.DB.prepare('UPDATE catalog SET draft=?,revision=revision+1 WHERE id=1 AND revision=? RETURNING revision').bind(old.catalog,revision).first();if(!result)bad('Draft changed. Reload first.',409);return json(result);
 }
 if(path==='/api/admin/photos'&&req.method==='GET')return json({photos:(await env.DB.prepare('SELECT id,name,type,created_at FROM photos ORDER BY created_at DESC').all()).results});
 if(path==='/api/admin/photos'&&req.method==='POST'){
  const bytes=await body(req,350000);const type=req.headers.get('Content-Type');
  const sig=Array.from(bytes.slice(0,12));
  const valid=(type==='image/jpeg'&&sig[0]===255&&sig[1]===216&&sig[2]===255)||(type==='image/png'&&sig.slice(0,8).join(',')==='137,80,78,71,13,10,26,10')||(type==='image/webp'&&String.fromCharCode(...sig.slice(0,4))==='RIFF'&&String.fromCharCode(...sig.slice(8,12))==='WEBP');
  if(!valid)bad('Upload a JPG, PNG or WebP photo.');
  const id=crypto.randomUUID(),name=decodeURIComponent(req.headers.get('X-Photo-Name')||'Photo').slice(0,100);
  const result=await env.DB.prepare('INSERT INTO photos(id,name,type,data,created_at) SELECT ?,?,?,?,? WHERE (SELECT COUNT(*) FROM photos)<100 RETURNING id').bind(id,name,type,bytes.buffer,new Date().toISOString()).first();
  if(!result)bad('Photo library is full (100 photos). Ask the maintainer to archive unused photos.',409);
  return json({id,path:`/media/${id}`},201);
 }
 bad('Not found.',404);
 }catch(e){return json({error:e.status?e.message:e.message?.match(/enter|must|limit|photo|price|catalog|package|dish|visibility|unsupported|missing|invalid|set /i)?e.message:'The catalog service is temporarily unavailable. Please try again or call us.'},e.status||(/D1_|SQLITE|binding/i.test(e.message)?503:400));}}};
