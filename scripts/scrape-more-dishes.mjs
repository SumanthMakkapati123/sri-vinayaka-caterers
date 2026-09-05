import { writeFile, readFile } from 'node:fs/promises';

const dishesToScrape = [
  { id: 'ravva-laddu', query: 'Rava laddu' },
  { id: 'kurbanika-meeta', query: 'Khobani ka meetha' },
  { id: 'manchoria', query: 'Gobi manchurian' },
  { id: 'alu-bonda', query: 'Batata vada' },
  { id: 'mysore-bajji', query: 'Goli baje' },
  { id: 'palak-dal', query: 'Dal palak' },
  { id: 'pohe', query: 'Kanda poha' },
  { id: 'tomato-bath', query: 'Tomato rice Indian' },
  { id: 'vermicelli-upma', query: 'Semiya upma' },
  { id: 'onion-dosa', query: 'Rava dosa' },
  { id: 'vangi-bath', query: 'Vangi bath' },
  { id: 'jawari-roti', query: 'Jolada rotti' },
  { id: 'mooli-parotha', query: 'Mooli paratha' },
  { id: 'mango-pickle', query: 'Avakaya' },
  { id: 'allam-chatni', query: 'Allam pachadi' },
  { id: 'gongura-pickle', query: 'Gongura pachadi' },
  { id: 'tamato-rasam', query: 'Tomato rasam' },
  { id: 'pepper-rasam', query: 'Milagu rasam' },
  { id: 'tomato-dal', query: 'Tomato pappu' },
  { id: 'gutti-vankaya', query: 'Gutti vankaya' },
  { id: 'alu-fry', query: 'Potato fry Indian' },
  { id: 'alu-karam', query: 'Potato masala' },
  { id: 'babycorn-65', query: 'Crispy baby corn' },
  { id: 'cut-mirchi', query: 'Mirchi bajji' },
  { id: 'paneer-pakoda', query: 'Paneer pakora' }
];

const catalog = JSON.parse(await readFile('catalog.json', 'utf8'));
const existingCredits = new Set(catalog.photoCredits.map(c => c.file));

let addedCount = 0;

for (const item of dishesToScrape) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  u.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: item.query + ' filetype:bitmap',
    gsrnamespace: '6',
    gsrlimit: '1',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '500'
  });

  try {
    const res = await fetch(u, {
      headers: {
        'User-Agent': 'SriVinayakaCatalogBot/1.0 (https://sri-vinayaka-caterers; contact@srivinayaka.in) Node/22'
      }
    });

    if (res.status === 429) {
      console.log('Rate limit hit at ' + item.id + ', pausing 5s...');
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }

    const data = await res.json();
    const page = Object.values(data.query?.pages || {})[0];
    const info = page?.imageinfo?.[0];
    const meta = info?.extmetadata;
    const license = meta?.LicenseShortName?.value;

    if (!info?.thumburl || !license || !/^(CC BY|CC BY-SA|CC0|Public domain)/.test(license)) {
      console.log('Skipped ' + item.id + ': license ' + license);
      await new Promise(r => setTimeout(r, 2200));
      continue;
    }

    const imgRes = await fetch(info.thumburl, {
      headers: { 'User-Agent': 'SriVinayakaCatalogBot/1.0' }
    });

    if (!imgRes.ok) {
      console.log('Failed to fetch image for ' + item.id);
      await new Promise(r => setTimeout(r, 2200));
      continue;
    }

    const fileName = `dish-${item.id}.jpg`;
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    await writeFile(`input_photos/${fileName}`, buffer);

    // Update catalog dish
    for (const cat of catalog.categories) {
      const dish = cat.items.find(i => i.id === item.id);
      if (dish) {
        dish.image = fileName;
        dish.illustrative = true;
      }
    }

    // Add credit
    if (!existingCredits.has(fileName)) {
      catalog.photoCredits.push({
        file: fileName,
        creator: (meta.Artist?.value || meta.Credit?.value || 'Wikimedia Commons Contributor').replace(/<[^>]*>/g, '').trim(),
        source: (info.descriptionurl || '').replace(/^http:\/\//, 'https://'),
        license: license,
        licenseURL: (meta.LicenseUrl?.value || 'https://creativecommons.org/licenses/by-sa/4.0').replace(/^http:\/\//, 'https://'),
        changes: 'Resized from Wikimedia Commons; displayed cropped to fit dish cards.'
      });
      existingCredits.add(fileName);
    }

    addedCount++;
    console.log(`[${addedCount}] Downloaded & mapped: ${item.id} (${page.title}) [${license}]`);

  } catch (err) {
    console.log('Error for ' + item.id + ':', err.message);
  }

  // Polite delay
  await new Promise(r => setTimeout(r, 2500));
}

await writeFile('catalog.json', JSON.stringify(catalog, null, 2) + '\n');
console.log('Finished scraping. Added photos:', addedCount);
