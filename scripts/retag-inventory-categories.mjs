const API = 'https://inventory-api.sai-shirley.workers.dev';

const REMOVED = new Set(['frozen', 'cleaning', 'equipment']);

function remapCategory(category, name) {
  if (!REMOVED.has(category)) return category;
  if (name.includes('冷凍')) return 'ingredients';
  if (category === 'cleaning') return 'supplies';
  if (category === 'equipment') return 'other';
  return 'ingredients';
}

function categorize(name) {
  const rules = [
    {
      cat: 'produce',
      keys: ['トマト', 'レタス', 'タマネギ', 'いちご', '紫芋'],
    },
    {
      cat: 'dairy',
      keys: ['ミルク', 'タマゴ', 'バター', 'ホイップ', 'ココナッツ'],
    },
    {
      cat: 'bakery',
      keys: ['ケーキ', 'ゼリー', 'ゼ', 'ナタデココ', 'パン', '抹茶'],
    },
    {
      cat: 'sauce',
      keys: [
        'サルサ',
        'チリソース',
        'シロップ',
        'ソース',
        'ドレッシング',
        'ドレ',
        'ねりごま',
        'カレー',
      ],
    },
    {
      cat: 'beverage',
      keys: ['ジュース', 'サイダー', 'コーヒー（', '紅茶（', '紅茶P', 'ココア'],
    },
    {
      cat: 'ingredients',
      keys: ['レンズ', 'タコミート', '鶏肉', 'コーヒー豆', 'トマト缶', '冷凍'],
    },
  ];

  for (const rule of rules) {
    if (rule.keys.some((k) => name.includes(k))) return rule.cat;
  }
  return 'other';
}

const backupRes = await fetch(`${API}/api/backup`);
const backupJson = await backupRes.json();
if (!backupJson.success) throw new Error(JSON.stringify(backupJson));
const prev = backupJson.data;

const inventory = prev.inventory.map((item) => {
  let category = remapCategory(item.category, item.name);
  if (REMOVED.has(item.category) || !category) {
    category = categorize(item.name);
  }
  return {
    ...item,
    category,
    lastUpdated: new Date().toISOString(),
  };
});

const byCat = {};
for (const item of inventory) {
  byCat[item.category] = (byCat[item.category] || 0) + 1;
}
console.log('categories', byCat);

const payload = {
  ...prev,
  settings: {
    bossPin: prev.settings?.bossPin || '2468',
    staffPin: prev.settings?.staffPin || '1234',
  },
  inventory,
  updatedAt: new Date().toISOString(),
};

const put = await fetch(`${API}/api/backup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});
const putJson = await put.json();
if (!putJson.success) throw new Error(JSON.stringify(putJson));
console.log('updated', putJson.data.inventory.length, 'items');
