import { writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const remainingQueries = [
  // Sweets
  { id: 'mohan-laddu', queries: ['Besan laddu', 'Mohanthal', 'Motichoor laddu'] },
  { id: 'besan-chekki', queries: ['Besan barfi', 'Mohanthal', 'Besan ladoo'] },
  { id: 'cova-barfi', queries: ['Khoya barfi', 'Mawa barfi', 'Peda'] },
  { id: 'pheni-chekki', queries: ['Chirote sweet', 'Pheni sweet', 'Khaja'] },
  { id: 'charoti', queries: ['Chirote', 'Khaja sweet', 'Sweet samosa'] },
  { id: 'mandige', queries: ['Mandige sweet', 'Puran poli', 'Holige'] },
  { id: 'kadubu-karanja', queries: ['Karanji sweet', 'Gujiya', 'Nevri sweet'] },
  { id: 'annaras', queries: ['Anarsa sweet', 'Adhirasam'] },
  { id: 'malai-rools', queries: ['Malai roll sweet', 'Rasgulla roll', 'Ras malai'] },
  { id: 'malai-sandwich', queries: ['Malai sandwich sweet', 'Ras malai', 'Cham cham sweet'] },
  { id: 'pista-katli', queries: ['Pista barfi', 'Pista katli', 'Kaju katli'] },
  { id: 'masti-samosa', queries: ['Sweet samosa', 'Meetha samosa', 'Khasta kachori sweet'] },
  { id: 'anguru-dana', queries: ['Boondi sweet', 'Sweet boondi', 'Bundi laddu'] },
  { id: 'phene-burfi', queries: ['Sev barfi', 'Burfi sweet', 'Barfi'] },
  { id: 'badam-burfi', queries: ['Badam katli', 'Badam barfi', 'Almond burfi'] },
  { id: 'coconut-buri', queries: ['Coconut barfi', 'Nariyal barfi', 'Nariyal laddu'] },
  { id: 'badam-pista-cake', queries: ['Dry fruit roll sweet', 'Kaju roll', 'Pista barfi'] },
  { id: 'milk-mysorepak', queries: ['Mysore pak', 'Milk cake sweet', 'Kalakand'] },
  { id: 'pineapple-kesari', queries: ['Pineapple kesari', 'Kesari bath', 'Rava kesari'] },
  { id: 'juckfruit-halwa', queries: ['Chakka halwa', 'Halwa Kerala', 'Jackfruit sweet'] },
  { id: 'kaddu-ka-halwa', queries: ['Lauki halwa', 'Bottle gourd halwa', 'Gajar ka halwa'] },
  { id: 'appi-payasam', queries: ['Appam sweet', 'Payasam South Indian', 'Kheer'] },
  { id: 'haya-griva', queries: ['Hayagreeva sweet', 'Chana dal payasam', 'Parippu payasam'] },
  { id: 'laxmi-payasam', queries: ['Akkaravadisal', 'Rice payasam', 'Paal payasam'] },
  { id: 'kadduka-kheer', queries: ['Kaddu ki kheer', 'Lauki kheer', 'Sabudana kheer'] },

  // Hot & Khara
  { id: 'veg-65', queries: ['Veg 65', 'Gobi 65', 'Paneer 65'] },
  { id: 'alu-65', queries: ['Aloo 65', 'Potato 65', 'Potato wedges Indian'] },
  { id: 'navarang-chuduva', queries: ['Chivda', 'Poha chivda', 'Farsan mixture'] },
  { id: 'khara-bundi', queries: ['Kara boondi', 'Spicy boondi', 'Khara boondi'] },
  { id: 'kabage-pakoda', queries: ['Cabbage pakoda', 'Cabbage pakora', 'Vegetable pakora'] },
  { id: 'arati-bajji', queries: ['Aratikaya bajji', 'Plantain bajji', 'Raw banana bajji'] },
  { id: 'jaipur-bendi', queries: ['Kurkuri bhindi', 'Crispy bhindi', 'Bhindi fry'] },
  { id: 'brinjal-bajji', queries: ['Vankaya bajji', 'Brinjal pakora', 'Baingan pakora'] },
  { id: 'ghati', queries: ['Gathiya', 'Bhavnagari gathiya', 'Murukku snack'] },
  { id: 'alu-bajji', queries: ['Aloo bajji', 'Potato pakora', 'Batata vada'] },
  { id: 'onion-pakoda', queries: ['Kanda bhaji', 'Onion pakoda', 'Onion pakora'] },
  { id: 'pan-bajji', queries: ['Palak pakoda', 'Spinach pakora', 'Leaf pakora'] },

  // Fry Curries
  { id: 'donda-fry', queries: ['Tindora fry', 'Kovakkai fry', 'Dondakaya vepudu'] },
  { id: 'kanda-fry', queries: ['Senai kizhangu fry', 'Yam fry Indian', 'Elephant foot yam'] },
  { id: 'chama-fry', queries: ['Arbi fry', 'Colocasia fry', 'Seppankizhangu roast'] },

  // North Indian Curries
  { id: 'paneer-butter-masala', queries: ['Paneer butter masala', 'Paneer makhani', 'Shahi paneer'] },
  { id: 'navaratan-kurma', queries: ['Navratan korma', 'Navratan kurma', 'Vegetable korma'] },
  { id: 'vege-kurma', queries: ['Vegetable korma', 'Veg kurma', 'Mixed vegetable curry'] },
  { id: 'alu-ginger', queries: ['Aloo adraki', 'Ginger potato', 'Jeera aloo'] },
  { id: 'baigan-barta', queries: ['Baingan bharta', 'Mashed eggplant Indian', 'Baingan ka bharta'] },
  { id: 'veg-kofta', queries: ['Veg kofta curry', 'Lauki kofta', 'Malai kofta'] },
  { id: 'malai-kofta', queries: ['Malai kofta', 'Kofta curry Indian', 'Paneer kofta'] },
  { id: 'capscum-masala', queries: ['Capsicum masala', 'Shimla mirch ki sabzi', 'Capsicum paneer'] },
  { id: 'drum-stick-masala', queries: ['Drumstick curry', 'Murungakkai curry', 'Munakkaya curry'] },
  { id: 'stuffed-tamoto', queries: ['Bharwan tamatar', 'Stuffed tomato Indian', 'Tomato curry'] },
  { id: 'chole-with-paneer', queries: ['Chole paneer', 'Chana masala paneer', 'Chole bhature'] },
  { id: 'vegetable-taka-tak', queries: ['Veg tawa masala', 'Tawa sabzi', 'Mix veg tawa'] },

  // South Indian Curries
  { id: 'alu-upma-curry', queries: ['Poori masala aloo', 'Potato masala for poori', 'Aloo bhaji'] },
  { id: 'alu-karam-curry', queries: ['Bangaladumpa vepudu', 'Spicy potato fry Indian', 'Aloo fry'] },
  { id: 'vankaya-karampetti', queries: ['Ennegayi', 'Stuffed brinjal Andhra', 'Gutti vankaya'] },
  { id: 'beens-curry', queries: ['Beans poriyal', 'French beans curry Indian', 'Beans thoran'] },
  { id: 'dosakaya-borada', queries: ['Dosakaya pappu', 'Dosakaya curry', 'Yellow cucumber curry'] },
  { id: 'banana-curry', queries: ['Vazhakkai curry', 'Aratikaya kura', 'Raw banana curry'] },
  { id: 'cabage-curry', queries: ['Cabbage poriyal', 'Patta gobi sabzi', 'Cabbage thoran'] },
  { id: 'capscum-curry', queries: ['Capsicum curry', 'Shimla mirch besan', 'Capsicum masala'] },
  { id: 'donda-curry', queries: ['Tindora curry', 'Dondakaya kura', 'Ivy gourd curry'] },
  { id: 'alu-methi', queries: ['Aloo methi', 'Potato fenugreek sabzi', 'Methi aloo'] },
  { id: 'mix-veg-curry', queries: ['Mixed vegetable curry', 'Mix veg sabzi', 'Avial'] },
  { id: 'kanda-bachalli', queries: ['Kanda bachali kura', 'Yam curry Andhra', 'Senai kizhangu curry'] },
  { id: 'gowar-palli-curry', queries: ['Gavar sabzi', 'Cluster beans curry', 'Kothavarangai poriyal'] },
  { id: 'bendi-kairas', queries: ['Bhindi masala curry', 'Okra masala', 'Bendakaya pulusu'] },
  { id: 'pineapple-kairas', queries: ['Pineapple pachadi', 'Pineapple curry South Indian', 'Pineapple pullissery'] },
  { id: 'karela-kairas', queries: ['Karela sabzi', 'Bitter gourd fry Indian', 'Kakarakaya vepudu'] },

  // Dal, Sambar & Rasam
  { id: 'menthan-totakura-pappu', queries: ['Menthi kura pappu', 'Methi dal Indian', 'Totakura pappu'] },
  { id: 'gongura-pappu', queries: ['Gongura pappu', 'Gongura dal', 'Andhra gongura'] },
  { id: 'dosakaya-pappu', queries: ['Dosakaya pappu', 'Dosakaya dal', 'Cucumber dal'] },
  { id: 'mango-dal', queries: ['Mamidikaya pappu', 'Mango dal South Indian', 'Raw mango dal'] },
  { id: 'lemon-dal', queries: ['Lemon rasam dal', 'Nimmakaya pappu', 'Lemon dal'] },
  { id: 'birakaya-pappu', queries: ['Beerakaya pappu', 'Ridge gourd dal', 'Peerkangai kootu'] },
  { id: 'majjiga-pulusu', queries: ['Mor kuzhambu', 'Majjiga pulusu', 'Kadhi pakora'] },
  { id: 'pepper-rasam', queries: ['Milagu rasam', 'Pepper rasam', 'South Indian rasam'] },
  { id: 'mysore-rasam', queries: ['Mysore rasam', 'Rasam South Indian', 'Udupi rasam'] },
  { id: 'lemon-rasam', queries: ['Lemon rasam', 'Elumichai rasam', 'Nimmakaya rasam'] },
  { id: 'pachi-pulusu', queries: ['Pachi pulusu', 'Raw rasam Telangana', 'Chintapandu rasam'] },

  // Pickles & Podis
  { id: 'dosakaya-pickle', queries: ['Dosakaya avakaya', 'Dosakaya pachadi', 'Cucumber pickle'] },
  { id: 'tamato-pickle', queries: ['Tomato pickle South Indian', 'Thakkali thokku', 'Tomato thokku'] },
  { id: 'chintakaya-chatni', queries: ['Imli chutney', 'Tamarind chutney sweet', 'Chintakaya pachadi'] },
  { id: 'kachha-tamato-chatni', queries: ['Green tomato chutney', 'Pachi tomato pachadi', 'Tomato chutney'] },
  { id: 'birakaya-chatni', queries: ['Beerakaya pachadi', 'Ridge gourd chutney', 'Peerkangai thogayal'] },
  { id: 'allam-chatni', queries: ['Inji thogayal', 'Ginger chutney South Indian', 'Allam pachadi'] },
  { id: 'til-chatni', queries: ['Ellu thogayal', 'Sesame chutney', 'Nuvvula pachadi'] },
  { id: 'mixed-dal-chatni', queries: ['Paruppu thogayal', 'Dal chutney Indian', 'Thogayal'] },
  { id: 'gobi-pickle', queries: ['Cauliflower pickle Indian', 'Gobi achar', 'Mixed pickle'] },
  { id: 'vegetable-pickle', queries: ['Mixed vegetable pickle Indian', 'Pachranga achar', 'Achar'] },
  { id: 'dosakaya-mukkala-pachadi', queries: ['Dosakaya mukkala pachadi', 'Dosakaya salad Indian', 'Kachumber'] },
  { id: 'karivepak-podi', queries: ['Karivepaku podi', 'Curry leaf powder', 'Karuveppilai podi'] },
  { id: 'kandi-podi', queries: ['Paruppu podi', 'Kandi podi', 'Gunpowder podi'] },
  { id: 'karam-podi', queries: ['Idli podi', 'Milagai podi', 'Chutney podi'] },
  { id: 'mentham-podi', queries: ['Menthi podi', 'Fenugreek powder spice', 'Sambar powder'] },
  { id: 'katta-meta-chatni', queries: ['Saunth chutney', 'Meetha chutney', 'Tamarind chutney'] },
  { id: 'pudina-chatni', queries: ['Mint chutney', 'Pudina chutney', 'Coriander mint chutney'] },

  // Rice & Biryani
  { id: 'veg-palav', queries: ['Vegetable pulao', 'Veg pulao', 'Peas pulao'] },
  { id: 'green-peas-palav', queries: ['Matar pulao', 'Green peas pulao', 'Peas rice'] },
  { id: 'shahe-mutter-palav', queries: ['Shahi pulao', 'Kashmiri pulao', 'Peas pulao'] },
  { id: 'dumka-biryani', queries: ['Hyderabadi veg biryani', 'Vegetable dum biryani', 'Veg biryani'] },
  { id: 'lehar-biryani', queries: ['Veg biryani pot', 'Dum biryani vegetarian', 'Biryani rice'] },

  // Soups & Salads
  { id: 'vegetable-soup', queries: ['Mixed vegetable soup', 'Vegetable clear soup', 'Tomato soup'] },
  { id: 'baby-corn-soup', queries: ['Sweet corn soup', 'Sweet corn vegetable soup', 'Corn soup'] },
  { id: 'vegetable-salad', queries: ['Kachumber salad', 'Indian green salad', 'Cucumber tomato salad'] },

  // Chat Items
  { id: 'ragada', queries: ['Ragda patties', 'Ragda chaat', 'White peas curry'] },
  { id: 'vegtable-samosa', queries: ['Vegetable samosa', 'Punjabi samosa', 'Samosa'] },
  { id: 'kachori', queries: ['Khasta kachori', 'Pyaaz kachori', 'Raj kachori'] },

  // Puri, Roti & Naan
  { id: 'palak-puri', queries: ['Palak puri', 'Palak poori', 'Spinach poori'] },
  { id: 'masala-puri', queries: ['Masala poori', 'Masala puri chaat', 'Tikha puri'] },
  { id: 'vegtable-parotha', queries: ['Veg paratha', 'Mixed vegetable paratha', 'Aloo paratha'] },
  { id: 'tanduri-roti', queries: ['Tandoori roti', 'Roti tandoori', 'Naan bread'] },
  { id: 'peshaari-nan', queries: ['Peshawari naan', 'Kashmiri naan', 'Garlic naan'] },
  { id: 'rumali-roti', queries: ['Rumali roti', 'Roomali roti', 'Tandoori roti'] },

  // Ice Creams & Drinks
  { id: 'butter-stoch-ice-cream', queries: ['Butterscotch ice cream', 'Vanilla ice cream scoop', 'Ice cream dessert'] },
  { id: 'kasata', queries: ['Cassata ice cream', 'Neapolitan ice cream', 'Cassata cake'] },
  { id: 'kesar-ice-cream', queries: ['Kesar pista kulfi', 'Kulfi ice cream', 'Matka kulfi'] },
  { id: 'all-types-of-cool-drinks', queries: ['Rooh afza drink', 'Jaljeera drink', 'Indian lemonade shikanji'] },

  // Raitha
  { id: 'onion-raitha', queries: ['Onion raita', 'Onion tomato raita', 'Raita yogurt'] },
  { id: 'kheera-onion-raitha', queries: ['Cucumber raita', 'Kheera raita', 'Cucumber yogurt'] },
  { id: 'tomato-raitha', queries: ['Tomato raita', 'Tomato onion raita', 'Vegetable raita'] },
  { id: 'boondi-raitha', queries: ['Boondi raita', 'Bundi raita', 'Dahi boondi'] },
  { id: 'dry-fruit-raitha', queries: ['Fruit raita', 'Pomegranate raita', 'Mixed fruit raita'] },

  // Break-Fast
  { id: 'veg-idli', queries: ['Rava idli', 'Vegetable idli', 'Idli sambar'] },
  { id: 'pongal', queries: ['Ven pongal', 'Khichdi Indian', 'Pongal breakfast'] },
  { id: 'rawa-pongal', queries: ['Rava pongal', 'Ven pongal', 'Pongal'] }
];

async function run() {
  const catalog = JSON.parse(await readFile('catalog.json', 'utf8'));
  const existingCredits = new Set(catalog.photoCredits.map(c => c.file));

  // Filter only dishes that currently do NOT have an image
  const itemsToProcess = [];
  for (const q of remainingQueries) {
    let found = false;
    for (const cat of catalog.categories) {
      const item = cat.items.find(i => i.id === q.id);
      if (item && !item.image) {
        found = true;
        break;
      }
    }
    if (found) itemsToProcess.push(q);
  }

  console.log(`Starting scrape for ${itemsToProcess.length} dishes missing photos...`);
  let addedCount = 0;

  for (let idx = 0; idx < itemsToProcess.length; idx++) {
    const item = itemsToProcess[idx];
    let downloaded = false;

    for (const queryStr of item.queries) {
      if (downloaded) break;

      const u = new URL('https://commons.wikimedia.org/w/api.php');
      u.search = new URLSearchParams({
        action: 'query',
        format: 'json',
        generator: 'search',
        gsrsearch: queryStr + ' filetype:bitmap',
        gsrnamespace: '6',
        gsrlimit: '4',
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
          console.log(`Rate limit hit on query "${queryStr}", waiting 5s...`);
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }

        const data = await res.json();
        const pages = Object.values(data.query?.pages || {});

        for (const page of pages) {
          const info = page?.imageinfo?.[0];
          const meta = info?.extmetadata;
          const license = meta?.LicenseShortName?.value;

          if (!info?.thumburl || !license || !/^(CC BY|CC BY-SA|CC0|Public domain)/.test(license)) {
            continue;
          }

          const imgRes = await fetch(info.thumburl, {
            headers: { 'User-Agent': 'SriVinayakaCatalogBot/1.0' }
          });

          if (!imgRes.ok) continue;

          const fileName = `dish-${item.id}.jpg`;
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          await writeFile(`input_photos/${fileName}`, buffer);

          // Update catalog item
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
          downloaded = true;
          console.log(`[${addedCount}/${itemsToProcess.length}] Downloaded & mapped: ${item.id} from "${queryStr}" (${page.title}) [${license}]`);
          break;
        }
      } catch (err) {
        console.log(`Error searching "${queryStr}" for ${item.id}:`, err.message);
      }

      // Small delay between query attempts
      await new Promise(r => setTimeout(r, 1200));
    }

    if (!downloaded) {
      console.log(`[-] Could not find verified CC image for: ${item.id}`);
    }

    // Delay between items
    await new Promise(r => setTimeout(r, 1000));
  }

  await writeFile('catalog.json', JSON.stringify(catalog, null, 2) + '\n');
  console.log(`\n🎉 Scraping session complete! Added ${addedCount} new dish photos.`);
}

run();
