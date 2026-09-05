// Refresh only the local test database with the finished seed, then verify actual image decoding.
import {chromium,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const base='http://127.0.0.1:8787';
const catalog=JSON.parse(await readFile('catalog.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const login=await context.request.post(base+'/api/admin/login',{headers:{Origin:base},data:{password:process.env.SVC_TEST_PASSWORD||'LOCAL-TEST-ONLY-2026-catering'}});if(!login.ok())throw Error(await login.text());
 const state=await (await context.request.get(base+'/api/admin/draft')).json();
 const save=await context.request.put(base+'/api/admin/draft',{headers:{Origin:base},data:{catalog,revision:state.revision}});if(!save.ok())throw Error(await save.text());
 const saved=await save.json();const publish=await context.request.post(base+'/api/admin/publish',{headers:{Origin:base},data:{revision:saved.revision}});if(!publish.ok())throw Error(await publish.text());
 const page=await context.newPage();await page.goto(base);await expect(page.locator('.package-card')).toHaveCount(3);
 for(const item of catalog.categories.flatMap(c=>c.items).filter(i=>i.image)){
  await page.locator('#search').fill(item.name);const image=page.locator('.dish-card').filter({has:page.locator(`[data-dish="${item.id}"]`)}).locator('img');await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(i=>i.naturalWidth)).toBeGreaterThan(0);
 }
 await page.locator('#search').fill('');await page.locator('[data-category="sweets"]').click();await page.locator('#menu').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/menu-photos-mobile.png'});
 await page.locator('#credits-button').click();await expect(page.locator('#info-content')).toContainText('CC BY-SA 4.0');await expect(page.locator('#info-content')).toContainText('Suyash.dwivedi');
 await page.locator('#info-dialog [data-close]').click();await page.locator('[data-plan="silver"]').click();await page.locator('[data-pick="slot-1"]').click();await expect(page.locator('[data-slot="gulab-jamun"]')).toBeVisible();await expect.poll(()=>page.locator('.dish-card').filter({has:page.locator('[data-slot="gulab-jamun"]')}).locator('img').evaluate(i=>i.naturalWidth)).toBeGreaterThan(0);await page.screenshot({path:'test-results/package-photos-mobile.png'});
 console.log('All 9 matching dish images decode; mobile package picker and catalog show photos; source/creator/license credits render; finished seed published to LOCAL test server only.');
}finally{await browser.close();}
