// 检查翻译完整性的脚本
const fs = require('fs');

// 读取翻译文件
const content = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// 提取每个语言的键
function extractKeys(lang) {
  const regex = new RegExp(`${lang}:\\s*\\{([\\s\\S]*?)\\n\\s*\\},?\\n\\s*(?:ja:|en:|\\};)`, 'm');
  const match = content.match(regex);
  if (!match) return [];
  
  const keys = [];
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const keyMatch = line.match(/^\s*(\w+):/);
    if (keyMatch) {
      keys.push(keyMatch[1]);
    }
  }
  
  return keys;
}

const zhKeys = extractKeys('zh');
const jaKeys = extractKeys('ja');
const enKeys = extractKeys('en');

console.log('Chinese keys:', zhKeys.length);
console.log('Japanese keys:', jaKeys.length);
console.log('English keys:', enKeys.length);

// 找出缺失的键
const missingInEn = zhKeys.filter(k => !enKeys.includes(k));
const extraInEn = enKeys.filter(k => !zhKeys.includes(k));

if (missingInEn.length > 0) {
  console.log('\n❌ Missing in English:', missingInEn);
}

if (extraInEn.length > 0) {
  console.log('\n⚠️ Extra in English:', extraInEn);
}

if (missingInEn.length === 0 && extraInEn.length === 0) {
  console.log('\n✅ All keys match!');
}



