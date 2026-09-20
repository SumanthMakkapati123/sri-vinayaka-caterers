import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { buildPausedDist, generateMaintenanceHtml } from '../scripts/pause.mjs';

test('generateMaintenanceHtml produces valid, self-contained HTML with business contact info', () => {
  const html = generateMaintenanceHtml();
  assert.ok(html.includes('Sri Vinayaka Caterers'));
  assert.ok(html.includes('Scheduled Maintenance'));
  assert.ok(html.includes('+91 95330 32737'));
  assert.ok(html.includes('tel:+919533032737'));
  assert.ok(html.includes('https://wa.me/919533032737'));
  assert.ok(html.includes('robots'));
  assert.ok(html.includes('noindex, nofollow'));
});

test('buildPausedDist creates maintenance files and protects catalog & photo assets', async () => {
  await buildPausedDist();

  // Maintenance files must exist
  assert.ok(existsSync('dist/index.html'), 'dist/index.html must exist');
  assert.ok(existsSync('dist/404.html'), 'dist/404.html must exist');
  assert.ok(existsSync('dist/.nojekyll'), 'dist/.nojekyll must exist');
  assert.ok(existsSync('dist/robots.txt'), 'dist/robots.txt must exist');

  // Verify robots disallows crawling
  const robots = readFileSync('dist/robots.txt', 'utf8');
  assert.ok(robots.includes('Disallow: /'));

  // Critical: Catalog and photos must be excluded in paused state
  assert.ok(!existsSync('dist/catalog.json'), 'dist/catalog.json must NOT exist while paused');
  assert.ok(!existsSync('dist/input_photos'), 'dist/input_photos must NOT exist while paused');
  assert.ok(!existsSync('dist/app.js'), 'dist/app.js must NOT exist while paused');
  assert.ok(!existsSync('dist/admin'), 'dist/admin must NOT exist while paused');

  // Verify custom message support
  const custom = 'System undergoing quarterly upgrades.';
  await buildPausedDist(custom);
  const indexHtml = readFileSync('dist/index.html', 'utf8');
  assert.ok(indexHtml.includes(custom));
});

test('build.mjs cleanly restores full catalog, 230 dishes, and public assets', () => {
  execSync('node scripts/build.mjs', { stdio: 'pipe' });

  assert.ok(existsSync('dist/index.html'), 'dist/index.html must exist');
  assert.ok(existsSync('dist/catalog.json'), 'dist/catalog.json must exist');
  assert.ok(existsSync('dist/app.js'), 'dist/app.js must exist');
  assert.ok(existsSync('dist/shared.js'), 'dist/shared.js must exist');
  assert.ok(existsSync('dist/input_photos'), 'dist/input_photos must exist');
  assert.ok(existsSync('dist/admin/index.html'), 'dist/admin/index.html must exist');

  const catalog = JSON.parse(readFileSync('dist/catalog.json', 'utf8'));
  const totalItems = catalog.categories.reduce((acc, c) => acc + c.items.length, 0);
  assert.equal(totalItems, 230, 'All 230 dishes must be present in restored catalog');
});
