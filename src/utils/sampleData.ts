// 示例数据定义（根据语言）
// 注意：category 和 unit 使用统一的英文键，在显示时根据语言翻译
export const getSampleData = (language: 'zh' | 'ja' | 'en') => {
  const data = {
    zh: {
      inventory: [
        { name: '咖啡豆 - 哥伦比亚', qty: 2, unit: 'kg', threshold: 5, category: 'ingredients' },
        { name: '咖啡豆 - 埃塞俄比亚', qty: 8, unit: 'kg', threshold: 5, category: 'ingredients' },
        { name: '牛奶', qty: 15, unit: 'liter', threshold: 10, category: 'ingredients' },
        { name: '糖浆 - 香草', qty: 3, unit: 'bottle', threshold: 5, category: 'ingredients' },
        { name: '一次性杯子 - 中杯', qty: 50, unit: 'piece', threshold: 100, category: 'supplies' },
        { name: '杯盖', qty: 80, unit: 'piece', threshold: 100, category: 'supplies' },
        { name: '吸管', qty: 45, unit: 'pack', threshold: 20, category: 'supplies' },
        { name: '抹布', qty: 8, unit: 'strip', threshold: 10, category: 'cleaning' },
      ],
      employees: [
        { name: '李晓明', position: 'manager', rate: 25 },
        { name: '王芳', position: 'barista', rate: 18 },
        { name: '张伟', position: 'barista', rate: 18 },
        { name: '刘洋', position: 'partTime', rate: 15 },
      ],
    },
    ja: {
      inventory: [
        { name: 'コーヒー豆 - コロンビア', qty: 2, unit: 'kg', threshold: 5, category: 'ingredients' },
        { name: 'コーヒー豆 - エチオピア', qty: 8, unit: 'kg', threshold: 5, category: 'ingredients' },
        { name: 'ミルク', qty: 15, unit: 'liter', threshold: 10, category: 'ingredients' },
        { name: 'シロップ - バニラ', qty: 3, unit: 'bottle', threshold: 5, category: 'ingredients' },
        { name: '使い捨てカップ - 中', qty: 50, unit: 'piece', threshold: 100, category: 'supplies' },
        { name: 'カップ蓋', qty: 80, unit: 'piece', threshold: 100, category: 'supplies' },
        { name: 'ストロー', qty: 45, unit: 'pack', threshold: 20, category: 'supplies' },
        { name: '布巾', qty: 8, unit: 'strip', threshold: 10, category: 'cleaning' },
      ],
      employees: [
        { name: '田中太郎', position: 'manager', rate: 25 },
        { name: '佐藤花子', position: 'barista', rate: 18 },
        { name: '鈴木一郎', position: 'barista', rate: 18 },
        { name: '山田美咲', position: 'partTime', rate: 15 },
      ],
    },
    en: {
      inventory: [
        { name: 'Coffee Beans - Colombian', qty: 2, unit: 'kg', threshold: 5, category: 'ingredients' },
        { name: 'Coffee Beans - Ethiopian', qty: 8, unit: 'kg', threshold: 5, category: 'ingredients' },
        { name: 'Milk', qty: 15, unit: 'liter', threshold: 10, category: 'ingredients' },
        { name: 'Syrup - Vanilla', qty: 3, unit: 'bottle', threshold: 5, category: 'ingredients' },
        { name: 'Disposable Cups - Medium', qty: 50, unit: 'piece', threshold: 100, category: 'supplies' },
        { name: 'Cup Lids', qty: 80, unit: 'piece', threshold: 100, category: 'supplies' },
        { name: 'Straws', qty: 45, unit: 'pack', threshold: 20, category: 'supplies' },
        { name: 'Cleaning Cloth', qty: 8, unit: 'strip', threshold: 10, category: 'cleaning' },
      ],
      employees: [
        { name: 'John Smith', position: 'manager', rate: 25 },
        { name: 'Sarah Johnson', position: 'barista', rate: 18 },
        { name: 'Michael Brown', position: 'barista', rate: 18 },
        { name: 'Emma Davis', position: 'partTime', rate: 15 },
      ],
    },
  };

  return data[language] || data.zh;
};

