import {chromium,expect} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:8787';
const password=process.env.SVC_TEST_PASSWORD||'LOCAL-TEST-ONLY-2026-catering';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const failures=[];
try{
 for(const width of [360,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:width>700?1000:844},isMobile:width<700,hasTouch:width<700});
  const page=await context.newPage();page.on('pageerror',err=>failures.push(err.message));
  await page.goto(base);await expect(page.locator('.package-card')).toHaveCount(3);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No horizontal overflow at ${width}`);
  await page.locator('#main-guests').fill('50');await page.locator('[data-plan="silver"]').click();
  const slots=await page.locator('[data-pick]').evaluateAll(nodes=>nodes.map(n=>n.dataset.pick));
  for(const slot of slots){await page.locator(`[data-pick="${slot}"]`).click();const added=await page.locator('[data-slot][aria-pressed="true"]').count();if(!added)await page.locator('[data-slot]').first().click();await page.locator('#picker-done').click();}
  await page.locator('[data-inclusion="Hot snack"]').uncheck();
  await page.locator('#search').fill('samosa');await page.locator('[data-dish="samosa"]').click();
  await expect(page.locator('#menu-summary')).toContainText('Silver Plate + 1');
  await page.locator('#event-button').click();
  await page.locator('[name="name"]').fill('Test Family');await page.locator('[name="phone"]').fill('9999999999');await page.locator('[name="date"]').fill('2099-12-20');await page.locator('[name="venue"]').fill('Test Hall, Hyderabad');await page.locator('[name="notes"]').fill('No peanuts; add a juice counter if available.');
  await expect(page.locator('[name="guests"]')).toHaveValue('50');
  await page.getByRole('button',{name:'Review my request'}).click();
  await expect(page.locator('#review-dialog')).toBeVisible();await expect(page.locator('#review-content')).toContainText('Excluded: Hot snack');
  const href=await page.locator('#whatsapp-link').getAttribute('href');const url=new URL(href);assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/919618406012');const text=url.searchParams.get('text');for(const value of ['Test Family','9999999999','2099-12-20','Guests: 50','Test Hall','Exclude: Hot snack','Samosa','No peanuts','not a confirmed booking'])assert.ok(text.includes(value),value);
  assert.ok(await page.locator('#review-content .review-dish img').count()>=10);
  const missing=await page.locator('#review-content img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src));assert.deepEqual(missing,[]);
  await page.screenshot({path:`test-results/review-${width}.png`});await page.locator('#review-dialog [data-close]').click();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`test-results/home-${width}.png`,fullPage:false});
  // Standalone dishes without a package.
  await page.locator('#remove-package').click();await page.locator('#event-button').click();await page.getByRole('button',{name:'Review my request'}).click();await expect(page.locator('#review-content')).toContainText('Your own menu');
  assert.equal(await page.evaluate(()=>localStorage.length),0,'No customer personal data is persisted');
  await context.close();console.log(`Customer journey passed at ${width}px`);
 }
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();page.on('pageerror',err=>failures.push(err.message));
 await page.goto(base+'/admin/');await page.locator('[name=password]').fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.locator('#dashboard')).toBeVisible();
 await expect(page.locator('#admin-dish-list .admin-row').first()).toBeVisible();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('#dish-search').fill('Gulab Jamun');await page.locator('[data-edit-dish="gulab-jamun"]').click();await page.locator('#edit-form [name=description]').fill('A lovely classic, prepared for your celebration.');await page.locator('#edit-form [name=price]').fill('65');await page.getByRole('button',{name:'Apply to draft',exact:true}).click();await expect(page.locator('#save-state')).toContainText('Unsaved');
 await page.locator('#save').click();await expect(page.locator('#save-state')).toContainText('Draft saved on server');
 const liveBefore=await (await context.request.get(base+'/api/catalog')).json();assert.notEqual(liveBefore.catalog.categories[0].items[0].description,'A lovely classic, prepared for your celebration.','Saving does not publish');
 await page.locator('[data-tab="photos"]').click();const photoCount=await page.locator('.photo-grid').first().locator('img').count();await page.locator('#photo-upload').setInputFiles('input_photos/samosa.jpg');await expect(page.locator('.photo-grid').first().locator('img')).toHaveCount(photoCount+1,{timeout:15000});
 await page.locator('[data-tab="dishes"]').click();await page.locator('#dish-search').fill('Samosa');await page.locator('[data-edit-dish="samosa"]').click();const value=await page.locator('#edit-form [name=image] option').last().getAttribute('value');await page.locator('#edit-form [name=image]').selectOption(value);await page.getByRole('button',{name:'Apply to draft',exact:true}).click();
 await page.locator('#save').click();await expect(page.locator('#save-state')).toContainText('Draft saved on server');
 const preview=await context.newPage();await preview.goto(base+'/?preview=1');await expect(preview.locator('#preview-banner')).toBeVisible();await preview.close();
 await page.locator('#publish').click();await expect(page.locator('#confirm-dialog')).toBeVisible();await page.locator('#confirm-publish').click();await expect(page.locator('#admin-status')).toContainText('Published.');
 const published=await (await context.request.get(base+'/api/catalog')).json();assert.equal(published.catalog.categories[0].items.find(i=>i.id==='gulab-jamun').description,'A lovely classic, prepared for your celebration.');assert.equal(published.catalog.categories[0].items.find(i=>i.id==='gulab-jamun').price,null,'Unapproved price stays hidden');
 const media=await context.request.get(base+value);assert.equal(media.status(),200);assert.equal(media.headers()['content-type'],'image/jpeg');
 await expect.poll(()=>page.locator('#admin-dish-list img').first().evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);await page.screenshot({path:'test-results/owner-mobile.png'});
 await page.locator('#history').click();await page.locator('[data-restore]').first().click();await expect(page.locator('#admin-status')).toContainText('restored to draft');await page.locator('#publish').click();await page.locator('#confirm-publish').click();await expect(page.locator('#admin-status')).toContainText('Published.');
 const cookies=await context.cookies();const session=cookies.find(c=>c.name==='svc_session');assert.ok(session.httpOnly);assert.equal(session.sameSite,'Strict');
 const stale=await context.request.put(base+'/api/admin/draft',{headers:{Origin:base},data:{catalog:published.catalog,revision:-1}});assert.equal(stale.status(),409);
 const csrf=await context.request.post(base+'/api/admin/publish',{headers:{Origin:'https://attacker.example'},data:{revision:0}});assert.equal(csrf.status(),403);
 await page.locator('#logout').click();await expect(page.locator('#login')).toBeVisible();
 assert.equal((await context.request.get(base+'/api/admin/draft')).status(),401);
 assert.equal((await context.request.post(base+'/api/admin/photos',{headers:{Origin:base,'Content-Type':'image/jpeg'},data:'fake'})).status(),401);
 await context.close();console.log('Owner mobile edit, upload, private preview, live publish, restore, cookie and API protection passed.');
 assert.deepEqual(failures,[],'No browser JavaScript errors');
 await writeFile('test-results/browser-report.json',JSON.stringify({passed:true,widths:[360,390,768,1440],checks:['customer package choices','exclusions','additions','guest sync','standalone menu','full WhatsApp payload (no external navigation or send)','review images','no horizontal overflow','no personal localStorage','owner login','editing','photo upload and serving','draft privacy','preview','publish','restore','HttpOnly SameSite cookie','stale revision conflict','CSRF rejection','unauthenticated denial'],browserErrors:failures},null,2));
} finally {await browser.close();}
