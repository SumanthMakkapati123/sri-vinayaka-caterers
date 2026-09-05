import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { validateCatalog } from '../shared.js';

const catalog = JSON.parse(await readFile('catalog.json', 'utf8'));
const approvedIds = JSON.parse(await readFile('research/approved-wiki-photo-ids.json', 'utf8'));
const extraIds = ['palak-paneer', 'semiya-payasam', 'methi-paratha', 'chutney-powder', 'aloo-paratha'];
const targetIds = new Set([...approvedIds, ...extraIds]);

const candidates = JSON.parse(await readFile('research/more-photo-candidates.json', 'utf8'));
const candidateMap = new Map(candidates.map(c => [c.id, c]));

let copied = 0;
let mapped = 0;
const newCredits = [];

const existingFiles = new Set(catalog.photoCredits.map(c => c.file));

for (const id of targetIds) {
  const cand = candidateMap.get(id);
  if (!cand) {
    console.warn(`No candidate metadata for ${id}`);
    continue;
  }

  const srcFile = `research/more-photo-review/${cand.file}`;
  const destFile = `input_photos/${cand.file}`;

  await copyFile(srcFile, destFile);
  copied++;

  if (!existingFiles.has(cand.file)) {
    const licenseURL = (cand.licenseURL || 'https://creativecommons.org/licenses/by-sa/4.0').replace(/^http:\/\//, 'https://');
    const source = (cand.source || '').replace(/^http:\/\//, 'https://');
    newCredits.push({
      file: cand.file,
      creator: cand.creator,
      source,
      license: cand.license,
      licenseURL,
      changes: cand.changes
    });
    existingFiles.add(cand.file);
  }
}

// Map to dishes in catalog
for (const cat of catalog.categories) {
  for (const item of cat.items) {
    if (targetIds.has(item.id)) {
      const cand = candidateMap.get(item.id);
      item.image = cand.file;
      item.illustrative = true;
      mapped++;
    }
  }
}

catalog.photoCredits.push(...newCredits);

// Validate updated catalog
validateCatalog(catalog);

await writeFile('catalog.json', JSON.stringify(catalog, null, 2) + '\n');
console.log(`Successfully copied ${copied} photos, mapped ${mapped} dishes, added ${newCredits.length} photo credits.`);
