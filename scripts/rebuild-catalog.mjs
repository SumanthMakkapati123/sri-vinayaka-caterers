import { readFile, writeFile, readdir } from 'node:fs/promises';

const oldCatalog = JSON.parse(await readFile('catalog.json', 'utf8'));
const photoFiles = new Set(await readdir('input_photos'));

// Verified photo mappings
const photoMap = {
  'laddu': 'dish-laddu.jpg',
  'srikhand': 'dish-srikhanda.jpg',
  'basundi': 'dish-basundi.jpg',
  'jilebi': 'dish-jilebi.jpg',
  'balushai': 'dish-balushai.jpg',
  'kakinada-kaja': 'dish-kakinada-kaja.jpg',
  'madata-kaja': 'dish-kakinada-kaja.jpg',
  'carrot-halwa': 'dish-carrot-halwa.jpg',
  'jhangri': 'dish-jangri.jpg',
  'mysorepak': 'dish-mysore-pak.jpg',
  'bobbatlu': 'dish-bobbatlu.jpg',
  'rasgulla': 'dish-rasgulla.jpg',
  'gulab-jamun': 'dish-gulab-jamun.jpg',
  'kala-jamun': 'dish-gulab-jamun.jpg',
  'kaju-katli': 'dish-kaju-katli.jpg',
  'kalakan': 'dish-kalakand.jpg',
  'agra-peta': 'dish-agra-petha.jpg',
  'chocolate-cake': 'dish-chocolate-cake.jpg',
  'son-papudi': 'dish-son-papdi.jpg',
  'chandrakala': 'dish-chandrakala.jpg',
  'bombay-halwa': 'dish-bombay-halwa.jpg',
  'ravva-kesari': 'dish-rava-kesari.jpg',
  'pala-payasam': 'dish-pala-payasam.jpg',
  'samiya-payasam': 'dish-semiya-payasam.jpg',
  'goby-65': 'dish-gobi-65.jpg',
  'palak-pokada': 'dish-palak-pakoda.jpg',
  'mirchi-bajji': 'dish-mirchi-bajji.jpg',
  'sev': 'dish-sev.jpg',
  'murukulu': 'dish-murukulu.jpg',
  'chips': 'dish-chips.jpg',
  'bendi-fry': 'dish-bhindi-fry.jpg',
  'palak-paneer': 'dish-palak-paneer.jpg',
  'paneer-tikka': 'dish-paneer-tikka.jpg',
  'alu-mutter': 'dish-aloo-mutter.jpg',
  'alu-govi': 'dish-aloo-gobi.jpg',
  'dum-alu': 'dish-dum-aloo.jpg',
  'bagara-baigan': 'dish-bagara-baingan.jpg',
  'shahi-paneer': 'dish-shahi-paneer.jpg',
  'mirchi-salan': 'dish-mirchi-salan.jpg',
  'rajma': 'dish-rajma.jpg',
  'availi': 'dish-avial.jpg',
  'madars-kootu': 'dish-madras-kootu.jpg',
  'kootu': 'dish-kootu.jpg',
  'madres-samber': 'dish-madras-sambar.jpg',
  'karnataka-samber': 'dish-karnataka-sambar.jpg',
  'coconut-chatni': 'dish-coconut-chutney.jpg',
  'chatni-podi': 'dish-chutney-powder.jpg',
  'tiffin-chatni': 'dish-tiffin-chutney.jpg',
  'jeera-rice': 'dish-jeera-rice.jpg',
  'lemon-rice': 'dish-lemon-rice.jpg',
  'tamarind-rice': 'dish-tamarind-rice.jpg',
  'white-rice': 'dish-white-rice.jpg',
  'curd-rice': 'dish-curd-rice.jpg',
  'bisi-bela-bath': 'dish-bisi-bele-bath.jpg',
  'pongal-khichdi': 'dish-pongal-khichdi.jpg',
  'tamoto-soup': 'dish-tomato-soup.jpg',
  'fruit-chat': 'dish-fresh-fruit-salad.jpg',
  'cut-let': 'dish-cutlet.jpg',
  'bale-puri': 'dish-bhel-puri.jpg',
  'pav-bajji': 'dish-pav-bhaji.jpg',
  'samosa': 'samosa.jpg',
  'pani-puri': 'pani-puri.jpg',
  'puri': 'dish-puri.jpg',
  'parotha': 'dish-paratha.jpg',
  'alu-parotha': 'dish-aloo-paratha.jpg',
  'methi-parotha': 'dish-methi-paratha.jpg',
  'roti': 'dish-roti.jpg',
  'chapathi': 'dish-chapathi.jpg',
  'butter-nan': 'dish-butter-naan.jpg',
  'kulcha': 'dish-kulcha.jpg',
  'batoora': 'dish-bhatura.jpg',
  'vanilla-pista-ice-cream': 'dish-vanilla-ice-cream.jpg',
  'strawbury-ice-cream': 'dish-strawberry-ice-cream.jpg',
  'tutti-frutiy': 'dish-tutti-frutti-ice-cream.jpg',
  'all-types-of-fresh-fruit-juices': 'dish-fruit-juice.jpg',
  'idli': 'dish-idli.jpg',
  'rawa-idli': 'dish-rava-idli.jpg',
  'wada': 'dish-vada.jpg',
  'dosa': 'dish-dosa.jpg',
  'masala-dosa': 'dish-masala-dosa.jpg',
  'uttappa': 'dish-uttapam.jpg',
  'pesaratu': 'dish-pesarattu.jpg'
};

const categoriesRaw = [
  {
    id: 'sweets',
    name: 'Sweets & Payasam',
    description: 'Traditional sweets, rich halwas, payasams and celebratory kheers',
    items: [
      'Laddu', 'Mohan Laddu', 'Srikhand', 'Basundi', 'Jilebi', 'Besan Chekki',
      'Cova Barfi', 'Balushai', 'Ravva Laddu', 'Pheni Chekki', 'Madata Kaja',
      'Kakinada Kaja', 'Charoti', 'Mandige', 'Jhangri', 'Mysorepak', 'Bobbatlu',
      'Kadubu (Karanja)', 'Annaras', 'Rasgulla', 'Gulab Jamun', 'Kala Jamun',
      'Malai Rools', 'Malai Sandwich', 'Kaju Katli', 'Pista Katli', 'Kurbanika Meeta',
      'Kalakan', 'Masti Samosa', 'Anguru Dana', 'Phene Burfi', 'Agra Peta',
      'Badam Burfi', 'Chocolate Cake', 'Son Papudi', 'Coconut Buri',
      'Badam Pista Cake', 'Chandrakala', 'Milk Mysorepak',
      'Ravva Kesari', 'Pineapple Kesari', 'Carrot Halwa', 'Juckfruit Halwa',
      'Kaddu Ka Halwa', 'Bombay Halwa', 'Appi Payasam', 'Haya Griva',
      'Laxmi Payasam', 'Samiya Payasam', 'Kadduka Kheer', 'Pala Payasam'
    ]
  },
  {
    id: 'hot-snacks',
    name: 'Hot & Khara',
    description: 'Crisp hot snacks, pakodas, savouries and bajjis',
    items: [
      'Samosa', 'Babycorn 65', 'Veg 65', 'Goby 65', 'Alu 65', 'Manchoria', 'Navarang Chuduva',
      'Khara Bundi', 'Kabage Pakoda', 'Palak Pokada', 'Alu Karam', 'Arati Bajji',
      'Cut Mirchi', 'Jaipur Bendi', 'Brinjal Bajji', 'Mirchi Bajji', 'Sev', 'Ghati',
      'Murukulu', 'Alu Bonda', 'Mysore Bajji', 'Alu Bajji', 'Onion Pakoda',
      'Pan Bajji', 'Paneer Pakoda', 'Chips'
    ]
  },
  {
    id: 'fry-curries',
    name: 'Fry Curries',
    description: 'Traditional vegetable fry dishes',
    items: [
      'Alu Fry', 'Bendi Fry', 'Donda Fry', 'Kanda Fry', 'Chama Fry'
    ]
  },
  {
    id: 'north-curries',
    name: 'North Indian Curries',
    description: 'Rich North Indian gravies and curries',
    items: [
      'Paneer Butter Masala', 'Palak Paneer', 'Paneer Tikka', 'Navaratan Kurma',
      'Vege Kurma', 'Alu Mutter', 'Alu Govi', 'Dum Alu', 'Alu Ginger',
      'Baigan Barta', 'Bagara Baigan', 'Veg Kofta', 'Malai Kofta', 'Shahi Paneer',
      'Mirchi Salan', 'Capscum Masala', 'Drum Stick Masala', 'Stuffed Tamoto',
      'Chole With Paneer', 'Rajma', 'Vegetable Taka Tak'
    ]
  },
  {
    id: 'south-curries',
    name: 'South Indian Curries',
    description: 'Authentic South Indian & Andhra special curries',
    items: [
      'Alu Upma Curry', 'Alu Karam Curry', 'Gutti Vankaya', 'Vankaya Karampetti',
      'Beens Curry', 'Dosakaya Borada', 'Banana Curry', 'Cabage Curry',
      'Capscum Curry', 'Donda Curry', 'Alu Methi', 'Mix Veg Curry',
      'Kanda Bachalli', 'Availi', 'Gowar Palli Curry', 'Madars Kootu',
      'Bendi Kairas', 'Pineapple Kairas', 'Karela Kairas'
    ]
  },
  {
    id: 'dal-sambar-rasam',
    name: 'Dal, Sambar & Rasam',
    description: 'Pappu, authentic sambars and piping hot rasams',
    items: [
      'Tomato Dal', 'Palak Dal', 'Menthan Totakura Pappu', 'Gongura Pappu',
      'Dosakaya Pappu', 'Mango Dal', 'Lemon Dal', 'Birakaya Pappu', 'Kootu',
      'Madres Samber', 'Karnataka Samber', 'Majjiga Pulusu', 'Tamota Rasam',
      'Pepper Rasam', 'Mysore Rasam', 'Lemon Rasam', 'Pachi Pulusu'
    ]
  },
  {
    id: 'pickles',
    name: 'Pickles',
    description: 'Fresh Andhra pickles, chutneys and aromatic podis',
    items: [
      'Dosakaya Pickle', 'Gongura Pickle', 'Tamato Pickle', 'Chintakaya Chatni',
      'Coconut Chatni', 'Kachha Tamato Chatni', 'Birakaya Chatni', 'Allam Chatni',
      'Til Chatni', 'Mixed Dal Chatni', 'Gobi Pickle', 'Vegetable Pickle',
      'Mango Pickle', 'Dosakaya Mukkala Pachadi', 'Karivepak Podi', 'Kandi Podi',
      'Karam Podi', 'Chatni Podi', 'Mentham Podi', 'Katta Meta Chatni',
      'Pudina Chatni', 'Tiffin Chatni'
    ]
  },
  {
    id: 'rice',
    name: 'Rice, Palav & Biryani',
    description: 'Celebration biryanis, palavs and flavoured rices',
    items: [
      'Veg Palav', 'Green Peas Palav', 'Shahe Mutter Palav', 'Dumka Biryani',
      'Lehar Biryani', 'Jeera Rice', 'Lemon Rice', 'Tamarind Rice', 'White Rice',
      'Curd Rice', 'Vangi Bath', 'Bisi Bela Bath', 'Pongal Khichdi'
    ]
  },
  {
    id: 'soups',
    name: 'Soups & Salads',
    description: 'Comforting soups and garden salads',
    items: [
      'Tamoto Soup', 'Vegetable Soup', 'Baby Corn Soup', 'Vegetable Salad', 'Fruit Chat'
    ]
  },
  {
    id: 'chats',
    name: 'Chat Items',
    description: 'Freshly prepared evening chaats and live counter favourites',
    items: [
      'Cut Let', 'Ragada', 'Bale Puri', 'Pav Bajji', 'Vegtable Samosa',
      'Kachori', 'Pani Puri'
    ]
  },
  {
    id: 'breads',
    name: 'Puri, Roti & Naan',
    description: 'Tandoori breads, naans, rotis and fluffy puris',
    items: [
      'Puri', 'Palak Puri', 'Masala Puri', 'Parotha', 'Alu Parotha',
      'Mooli Parotha', 'Methi Parotha', 'Vegtable Parotha', 'Roti',
      'Tanduri Roti', 'Jawari Roti', 'Chapathi', 'Butter Nan', 'Peshaari Nan',
      'Kulcha', 'Batoora', 'Rumali Roti'
    ]
  },
  {
    id: 'ice-creams',
    name: 'Ice Creams & Drinks',
    description: 'Dessert ice creams, fresh juices and cool drinks',
    items: [
      'Vanilla / Pista Ice Cream', 'Strawbury Ice Cream', 'Butter Stoch Ice Cream',
      'Kasata', 'Kesar Ice Cream', 'Tutti Frutiy', 'All Types of Cool Drinks',
      'All Types of Fresh Fruit Juices'
    ]
  },
  {
    id: 'raitha',
    name: 'Raitha',
    description: 'Cooling seasoned yoghurt raithas',
    items: [
      'Onion Raitha', 'Kheera Onion Raitha', 'Tomato Raitha', 'Boondi Raitha',
      'Dry Fruit Raitha'
    ]
  },
  {
    id: 'breakfast',
    name: 'Break-Fast',
    description: 'Hot breakfast specials, idlis, dosas and vadas',
    items: [
      'Idli', 'Rawa Idli', 'Veg Idli', 'Wada', 'Vermicelli Upma', 'Tomato Bath',
      'Dosa', 'Masala Dosa', 'Onion Dosa', 'Uttappa', 'Pesaratu', 'Pongal',
      'Rawa Pongal', 'Pohe'
    ]
  }
];

// Helper to convert dish name to ID
function toId(name) {
  return name.toLowerCase()
    .replace(/[&/()]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const categories = categoriesRaw.map(cat => ({
  id: cat.id,
  name: cat.name,
  description: cat.description,
  visible: true,
  items: cat.items.map(name => {
    const id = toId(name);
    const photo = photoMap[id];
    return {
      id,
      name,
      description: '',
      price: null,
      unit: 'guest',
      visible: true,
      image: (photo && photoFiles.has(photo)) ? photo : '',
      illustrative: (photo && photoFiles.has(photo)) ? true : false
    };
  })
}));

// Create plans
const allSweets = categories[0].items.map(i => i.id);
const allHots = categories[1].items.map(i => i.id);
const allFries = categories[2].items.map(i => i.id);
const allFlavouredRice = categories[7].items.filter(i => i.id !== 'white-rice').map(i => i.id);
const allDals = ['tomato-dal', 'palak-dal', 'menthan-totakura-pappu', 'gongura-pappu', 'dosakaya-pappu', 'mango-dal', 'lemon-dal', 'birakaya-pappu', 'kootu'];
const allSambarsRasams = ['madres-samber', 'karnataka-samber', 'tamota-rasam', 'pepper-rasam', 'mysore-rasam', 'lemon-rasam', 'pachi-pulusu'];
const allPickles = ['dosakaya-pickle', 'gongura-pickle', 'tamato-pickle', 'chintakaya-chatni', 'gobi-pickle', 'vegetable-pickle', 'mango-pickle'];
const allRotiPachadis = ['dosakaya-mukkala-pachadi', 'birakaya-chatni', 'kachha-tamato-chatni', 'coconut-chatni', 'allam-chatni', 'til-chatni', 'mixed-dal-chatni', 'katta-meta-chatni', 'pudina-chatni', 'tiffin-chatni'];
const allRaithas = categories[12].items.map(i => i.id);
const allBreads = categories[10].items.map(i => i.id);
const allNorthCurries = categories[3].items.map(i => i.id);
const allSouthCurries = categories[4].items.map(i => i.id);
const allCurries = [...allNorthCurries, ...allSouthCurries];
const allIceCreams = ['vanilla-pista-ice-cream', 'strawbury-ice-cream', 'butter-stoch-ice-cream', 'kasata', 'kesar-ice-cream', 'tutti-frutiy'];

const plans = [
  {
    id: 'silver',
    name: 'Silver Plate',
    description: 'A classic, satisfying wedding and celebration feast with essential traditional courses.',
    pricePerPlate: null,
    image: 'silver-plate.jpg',
    illustrative: true,
    badge: 'Popular choice',
    visible: true,
    includes: [
      'Sweet',
      'Hot snack',
      'Vegetable fry',
      'Flavoured rice',
      'Plain rice',
      'Dal / Pappu',
      'Sambar / Rasam',
      'Pickle',
      'Roti pachadi',
      'Papad',
      'Curd'
    ],
    slots: [
      { id: 'slot-1', label: 'Sweet', count: 1, itemIds: allSweets },
      { id: 'slot-2', label: 'Hot snack', count: 1, itemIds: allHots },
      { id: 'slot-3', label: 'Vegetable fry', count: 1, itemIds: allFries },
      { id: 'slot-4', label: 'Flavoured rice', count: 1, itemIds: allFlavouredRice },
      { id: 'slot-5', label: 'Plain rice', count: 1, itemIds: ['white-rice'] },
      { id: 'slot-6', label: 'Dal / Pappu', count: 1, itemIds: allDals },
      { id: 'slot-7', label: 'Sambar / Rasam', count: 1, itemIds: allSambarsRasams },
      { id: 'slot-8', label: 'Pickle', count: 1, itemIds: allPickles },
      { id: 'slot-9', label: 'Roti pachadi', count: 1, itemIds: allRotiPachadis }
    ]
  },
  {
    id: 'gold',
    name: 'Gold Plate',
    description: 'An elevated feast with hot puris or rumali rotis, paneer or chole masala, vegetable biryani and raita.',
    pricePerPlate: null,
    image: 'gold-plate.jpg',
    illustrative: true,
    badge: 'Most loved',
    visible: true,
    includes: [
      'Sweet',
      'Hot snack',
      'Vegetable fry',
      'Flavoured rice',
      'Puri / Rumali roti',
      'Paneer / Chole masala',
      'Vegetable biryani',
      'Bagara baingan',
      'Raita',
      'Plain rice',
      'Dal / Pappu',
      'Sambar / Rasam',
      'Pickle',
      'Roti pachadi',
      'Papad',
      'Curd'
    ],
    slots: [
      { id: 'slot-1', label: 'Sweet', count: 1, itemIds: allSweets },
      { id: 'slot-2', label: 'Hot snack', count: 1, itemIds: allHots },
      { id: 'slot-3', label: 'Vegetable fry', count: 1, itemIds: allFries },
      { id: 'slot-4', label: 'Flavoured rice', count: 1, itemIds: allFlavouredRice },
      { id: 'slot-5', label: 'Puri / Rumali roti', count: 1, itemIds: ['puri', 'rumali-roti'] },
      { id: 'slot-6', label: 'Paneer / Chole masala', count: 1, itemIds: ['paneer-butter-masala', 'palak-paneer', 'paneer-tikka', 'chole-with-paneer', 'shahi-paneer'] },
      { id: 'slot-7', label: 'Vegetable biryani', count: 1, itemIds: ['dumka-biryani'] },
      { id: 'slot-8', label: 'Bagara baingan', count: 1, itemIds: ['bagara-baigan'] },
      { id: 'slot-9', label: 'Raita', count: 1, itemIds: allRaithas },
      { id: 'slot-10', label: 'Plain rice', count: 1, itemIds: ['white-rice'] },
      { id: 'slot-11', label: 'Dal / Pappu', count: 1, itemIds: allDals },
      { id: 'slot-12', label: 'Sambar / Rasam', count: 1, itemIds: allSambarsRasams },
      { id: 'slot-13', label: 'Pickle', count: 1, itemIds: allPickles },
      { id: 'slot-14', label: 'Roti pachadi', count: 1, itemIds: allRotiPachadis }
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum Plate',
    description: 'A grand royal spread featuring two sweets, two hot snacks, breads, paneer, biryani, masala curry and ice cream.',
    pricePerPlate: null,
    image: 'platinum-plate.jpg',
    illustrative: true,
    badge: 'Grand celebration',
    visible: true,
    includes: [
      'Any 2 sweets',
      'Any 2 hot snacks',
      'Vegetable fry',
      'Flavoured rice',
      'Puri / Roti / Rumali roti',
      'Paneer / Chole masala',
      'Vegetable biryani / Palav',
      'Raita',
      'Masala curry',
      'Plain rice',
      'Dal / Pappu',
      'Sambar',
      'Rasam',
      'Any 2 pickles',
      'Roti pachadi',
      'Papad',
      'Curd',
      'Ice cream',
      'Sweet paan',
      'Water'
    ],
    slots: [
      { id: 'slot-1', label: 'Any 2 sweets', count: 2, itemIds: allSweets },
      { id: 'slot-2', label: 'Any 2 hot snacks', count: 2, itemIds: allHots },
      { id: 'slot-3', label: 'Vegetable fry', count: 1, itemIds: allFries },
      { id: 'slot-4', label: 'Flavoured rice', count: 1, itemIds: allFlavouredRice },
      { id: 'slot-5', label: 'Puri / Roti / Rumali roti', count: 1, itemIds: ['puri', 'roti', 'rumali-roti', 'butter-nan', 'chapathi'] },
      { id: 'slot-6', label: 'Paneer / Chole masala', count: 1, itemIds: ['paneer-butter-masala', 'palak-paneer', 'paneer-tikka', 'chole-with-paneer', 'shahi-paneer'] },
      { id: 'slot-7', label: 'Vegetable biryani / Palav', count: 1, itemIds: ['dumka-biryani', 'veg-palav', 'shahe-mutter-palav', 'lehar-biryani'] },
      { id: 'slot-8', label: 'Raita', count: 1, itemIds: allRaithas },
      { id: 'slot-9', label: 'Masala curry', count: 1, itemIds: allCurries },
      { id: 'slot-10', label: 'Plain rice', count: 1, itemIds: ['white-rice'] },
      { id: 'slot-11', label: 'Dal / Pappu', count: 1, itemIds: allDals },
      { id: 'slot-12', label: 'Sambar', count: 1, itemIds: ['madres-samber', 'karnataka-samber'] },
      { id: 'slot-13', label: 'Rasam', count: 1, itemIds: ['tamota-rasam', 'pepper-rasam', 'mysore-rasam', 'lemon-rasam', 'pachi-pulusu'] },
      { id: 'slot-14', label: 'Any 2 pickles', count: 2, itemIds: allPickles },
      { id: 'slot-15', label: 'Roti pachadi', count: 1, itemIds: allRotiPachadis },
      { id: 'slot-16', label: 'Ice cream', count: 1, itemIds: allIceCreams }
    ]
  }
];

const newCatalog = {
  ...oldCatalog,
  business: {
    ...oldCatalog.business,
    tagline: 'Specialist in: South & North Indian Foods & Chats',
    description: 'Specialist in South & North Indian Foods & Chats for weddings, house functions and celebrations in Hyderabad. Proprietor: P. Damodha Krishna.'
  },
  plans,
  categories
};

await writeFile('catalog.json', JSON.stringify(newCatalog, null, 2) + '\n');
console.log('Rebuilt catalog.json successfully. Total categories:', categories.length, 'Total dishes:', categories.reduce((n, c) => n + c.items.length, 0));
