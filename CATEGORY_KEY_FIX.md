# 类别键修复 - Category Key Fix

## 问题描述 (Problem Description)

切换到英语后，库存页面无法显示商品。原因是：

1. 数据库中存储的类别名称是各种语言的文本（中文：`'原料'`，英文：`'Ingredients'`）
2. 代码中硬编码了中文字符串进行比较（如 `filterCategory === '全部'`）
3. 当用户切换语言并初始化英文数据后，筛选逻辑失败

## 解决方案 (Solution)

采用语言无关的类别键（language-independent category keys）：

- `'all'` - 全部
- `'ingredients'` - 原料/原材料
- `'supplies'` - 耗材/消耗品
- `'cleaning'` - 清洁/清掃用品
- `'equipment'` - 设备/設備
- `'other'` - 其他/その他

## 修改的文件 (Modified Files)

### 1. `src/utils/sampleData.ts`

**更改**: 所有样本数据的 `category` 字段现在使用英文键而不是翻译后的文本。

```typescript
// 之前 (Before)
{ name: '咖啡豆 - 哥伦比亚', qty: 2, unit: 'kg', threshold: 5, category: '原料' }

// 之后 (After)
{ name: '咖啡豆 - 哥伦比亚', qty: 2, unit: 'kg', threshold: 5, category: 'ingredients' }
```

### 2. `src/pages/InventoryPage.tsx`

**新增功能**:
- 添加了 `getCategoryLabel()` 辅助函数，用于将类别键翻译为当前语言的文本
- 将所有硬编码的中文类别字符串替换为英文键

**主要更改**:
```typescript
// 状态初始化
const [filterCategory, setFilterCategory] = useState<string>('all');  // 之前: '全部'
const [formData, setFormData] = useState({
  category: 'ingredients',  // 之前: '原料'
  // ...
});

// 类别定义
const categories = [
  { value: 'ingredients', label: `🌱 ${t.inventory.categories.ingredients}` },
  // ...
];

// 辅助函数
const getCategoryLabel = (categoryKey: string): string => {
  const categoryMap: { [key: string]: string } = {
    'all': t.inventory.categories.all,
    'ingredients': t.inventory.categories.ingredients,
    // ...
  };
  return categoryMap[categoryKey] || categoryKey;
};

// 筛选逻辑
if (filterCategory !== 'all') {  // 之前: '全部'
  filtered = filtered.filter(item => item.category === filterCategory);
}

// 显示时使用翻译
<span className="text-xs text-coffee-400 px-1.5 py-0.5 bg-cream-100 rounded flex-shrink-0">
  {getCategoryLabel(item.category)}
</span>
```

### 3. `src/pages/WeeklyReportPage.tsx`

**新增功能**:
- 添加了 `getCategoryLabel()` 辅助函数
- 更新了类别统计逻辑，使用类别键而不是翻译后的文本

**主要更改**:
```typescript
// 辅助函数
const getCategoryLabel = (categoryKey: string): string => {
  const categoryMap: { [key: string]: string } = {
    'ingredients': t.inventory.categories.ingredients,
    'supplies': t.inventory.categories.supplies,
    // ...
  };
  return categoryMap[categoryKey] || categoryKey;
};

// 类别统计
const getCategoryCount = (categoryKey: string) => {
  return lowStockItems.filter(item => item.category === categoryKey).length;
};

// 显示时使用翻译
{[
  { key: 'ingredients', icon: 'grass' },
  // ...
].map((cat) => {
  const count = getCategoryCount(cat.key);
  return (
    <div key={cat.key}>
      <Icon name={cat.icon} size={18} />
      {getCategoryLabel(cat.key)}
      <span>{count} {t.inventory.items}</span>
    </div>
  );
})}
```

### 4. `src/i18n/translations.ts`

**更改**: 将 `materials` 键统一改为 `ingredients`，保持三种语言的一致性。

```typescript
// 中文 (Chinese)
categories: {
  all: '全部',
  ingredients: '原料',  // 之前: materials: '原料'
  supplies: '耗材',
  // ...
}

// 日文 (Japanese)
categories: {
  all: '全て',
  ingredients: '原材料',  // 之前: materials: '原材料'
  supplies: '消耗品',
  // ...
}

// 英文 (English) - 已经正确
categories: {
  all: 'All Categories',
  ingredients: 'Ingredients',
  supplies: 'Supplies',
  // ...
}
```

### 5. `src/utils/generateMarkdown.ts`

**更改**: 更新 `getCategoryEmoji()` 函数，使用英文类别键。

```typescript
const getCategoryEmoji = (category: string): string => {
  const emojiMap: { [key: string]: string } = {
    'ingredients': '🌱',  // 之前: '原料': '🌱'
    'supplies': '📦',     // 之前: '耗材': '📦'
    'cleaning': '🧹',     // 之前: '清洁': '🧹'
    'equipment': '🔧',    // 之前: '设备': '🔧'
    'other': '📌',        // 之前: '其他': '📌'
  };
  return emojiMap[category] || '📌';
};
```

## 优势 (Benefits)

1. **语言无关**: 数据库存储的类别键不依赖于任何特定语言
2. **易于维护**: 添加新语言时，只需要在翻译文件中添加对应的翻译
3. **一致性**: 所有页面和功能使用相同的类别键系统
4. **可扩展**: 未来添加新类别时，只需要：
   - 在类别键列表中添加新键
   - 在翻译文件中为每种语言添加翻译
   - 在 emoji 映射中添加对应的图标

## 测试步骤 (Testing Steps)

1. 切换到英语界面
2. 在设置中点击"初始化示例数据"
3. 返回库存页面，确认商品正常显示
4. 使用筛选器按类别筛选商品，确认筛选功能正常
5. 切换到中文/日文，确认类别名称正确显示
6. 查看每周报告页面，确认类别统计正确
7. 生成采购清单，确认类别 emoji 显示正确

## 注意事项 (Notes)

- 旧数据（使用中文/日文类别名称的数据）需要清除并重新初始化
- 用户可以在设置页面点击"初始化示例数据"按钮来清除旧数据并加载新数据
- 如果遇到问题，可以访问 `/public/reset-language.html` 重置语言设置

## 相关文件 (Related Files)

- `src/utils/sampleData.ts` - 示例数据定义
- `src/pages/InventoryPage.tsx` - 库存管理页面
- `src/pages/WeeklyReportPage.tsx` - 每周报告页面
- `src/i18n/translations.ts` - 翻译文件
- `src/utils/generateMarkdown.ts` - Markdown 生成工具

---

**修复日期**: 2025-11-12  
**修复版本**: 2.1.0



