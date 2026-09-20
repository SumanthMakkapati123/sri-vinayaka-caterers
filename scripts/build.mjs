import { mkdir, rm, copyFile, cp, readFile, writeFile, readdir } from 'node:fs/promises';
import { validateCatalog } from '../shared.js';
const photoFiles=(await readdir('input_photos',{withFileTypes:true})).filter(f=>f.isFile()&&/\.(jpg|jpeg|png|webp)$/.test(f.name)).map(f=>f.name).sort();
await writeFile('server/photo-files.json',JSON.stringify(photoFiles,null,2)+'\n');
validateCatalog(JSON.parse(await readFile('catalog.json', 'utf8')));
const distExists = await readdir('dist').then(() => true).catch(() => false);
if (distExists) {
  for (const f of await readdir('dist')) {
    if (f !== '.git') await rm(`dist/${f}`, {recursive: true, force: true});
  }
} else {
  await mkdir('dist', {recursive: true});
}
await mkdir('dist/admin', {recursive:true});
for (const file of ['index.html','styles.css','app.js','shared.js','catalog.json','_headers','404.html']) await copyFile(file, `dist/${file}`);
for (const file of ['index.html','admin.js']) await copyFile(`admin/${file}`,`dist/admin/${file}`);
await cp('input_photos','dist/input_photos',{recursive:true});
await writeFile('dist/robots.txt','User-agent: *\nDisallow: /admin\nDisallow: /api/admin\n');
await writeFile('dist/.nojekyll','');
console.log('Built public assets only. Reference sheets, backups, secrets and server source are excluded.');
