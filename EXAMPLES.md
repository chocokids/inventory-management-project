# 💡 使用示例

## 📝 示例场景

### 场景 1: 每周库存盘点

**步骤**:
1. 打开「库存管理」页面
2. 查看所有商品的库存状态
3. 发现咖啡豆库存只剩 2kg（红色警告）
4. 点击「编辑」更新实际库存数量
5. 点击「生成采购清单」生成本周采购单

**预期结果**:
- 低库存商品被标红
- 生成的 Markdown 文件包含所有需要采购的商品
- 文件名: `weekly-purchase-2024-11-10.md`

---

### 场景 2: 新员工入职

**步骤**:
1. 打开「员工管理」页面
2. 点击「➕ 添加员工」
3. 填写员工信息:
   - 姓名: 陈小红
   - 职位: 咖啡师
   - 时薪: ¥18
   - 工作时数: 140h
   - 电话: 138-0000-0005
4. 点击「添加」保存

**预期结果**:
- 员工列表中显示新员工
- 自动计算工资: ¥2,520
- 总工资数更新

---

### 场景 3: 添加新商品

**步骤**:
1. 打开「库存管理」页面
2. 点击「➕ 添加商品」
3. 填写商品信息:
   - 商品名称: 抹茶粉
   - 库存数量: 10
   - 单位: kg
   - 安全库存阈值: 5
   - 商品类别: 🌱 原料
   - 图片链接: `https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400`
4. 点击「添加」保存

**预期结果**:
- 商品列表中显示新商品
- 显示抹茶粉图片
- 库存状态正常（绿色）

---

### 场景 4: 生成采购清单

**步骤**:
1. 进入「每周报告」页面
2. 查看低库存统计
3. 点击「📥 生成并下载采购清单」
4. 打开下载的 Markdown 文件

**预期 Markdown 内容**:

```markdown
# ☕️ 每周采购清单

📅 **生成日期**: 2024年11月10日 星期日

---

## 📦 需要补充的商品

> 以下商品库存已低于阈值，请及时采购

| 商品名称 | 当前库存 | 单位 | 安全库存 | 建议采购量 | 类别 |
|---------|---------|------|---------|-----------|------|
| 🌱 咖啡豆 - 哥伦比亚 | 2 | kg | 5 | **8** | 原料 |
| 🌱 糖浆 - 香草 | 3 | 瓶 | 5 | **7** | 原料 |
| 📦 一次性杯子 - 中杯 | 50 | 个 | 100 | **150** | 耗材 |
| 📦 杯盖 | 80 | 个 | 100 | **120** | 耗材 |
| 🧹 抹布 | 8 | 条 | 10 | **12** | 清洁 |

---

## 📊 采购汇总

- 📌 需采购商品数量: **5** 项
- 🔴 低库存警告: **5** 项

## 📋 分类汇总

### 🌱 原料 (2 项)

- [ ] 咖啡豆 - 哥伦比亚 - 当前: 2kg
- [ ] 糖浆 - 香草 - 当前: 3瓶

### 📦 耗材 (2 项)

- [ ] 一次性杯子 - 中杯 - 当前: 50个
- [ ] 杯盖 - 当前: 80个

### 🧹 清洁 (1 项)

- [ ] 抹布 - 当前: 8条

---

## 📝 备注

- ⏰ 请在本周内完成采购
- 📞 如有问题，请联系供应商
- ✅ 采购完成后，请及时更新库存系统

---

*由咖啡店管理系统自动生成*
```

---

## 🎯 实际工作流程

### 周一上午：库存盘点

```
1. 打开应用 → 库存页面
2. 逐一核对实际库存
3. 更新系统中的数量
4. 标记低库存商品
```

### 周一下午：生成采购清单

```
1. 进入每周报告页面
2. 查看低库存统计
3. 生成采购清单
4. 发送给供应商
```

### 周二：采购到货

```
1. 收到货物
2. 打开库存页面
3. 更新各商品库存数量
4. 验证库存状态恢复正常
```

### 月末：工资结算

```
1. 打开员工页面
2. 更新每位员工的工作时数
3. 查看自动计算的工资
4. 导出或记录工资信息
```

---

## 🔧 高级使用技巧

### 技巧 1: 批量更新库存

使用浏览器开发者工具（F12）直接操作 IndexedDB:

```javascript
// 打开控制台
const db = await Dexie.getDatabaseNames();
const coffeeDB = new Dexie('CoffeeShopDB');
await coffeeDB.open();

// 批量更新库存（示例）
const items = await coffeeDB.inventory.toArray();
console.log('所有库存:', items);
```

### 技巧 2: 自定义采购清单格式

编辑 `src/utils/generateMarkdown.ts`:

```typescript
// 添加自定义内容
markdown += `## 🏪 供应商信息\n\n`;
markdown += `- 咖啡豆供应商: XXX公司 (电话: XXX)\n`;
markdown += `- 耗材供应商: YYY公司 (电话: YYY)\n\n`;
```

### 技巧 3: 导出数据到 JSON

添加导出功能（在 SettingsPage.tsx）:

```typescript
const handleExportData = async () => {
  const inventory = await getAllInventory();
  const employees = await getAllEmployees();
  
  const data = {
    inventory,
    employees,
    exportDate: new Date().toISOString(),
  };
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};
```

### 技巧 4: 设置定期提醒

使用浏览器通知 API（需要用户授权）:

```typescript
// 检查低库存并发送通知
const checkLowStock = async () => {
  const lowStock = await getLowStockItems();
  
  if (lowStock.length > 0 && Notification.permission === 'granted') {
    new Notification('⚠️ 库存警告', {
      body: `有 ${lowStock.length} 个商品库存不足，请及时补充！`,
      icon: '/vite.svg',
    });
  }
};

// 每天早上 9 点检查
setInterval(checkLowStock, 24 * 60 * 60 * 1000);
```

---

## 📊 数据分析示例

### 分析 1: 月度采购成本

```typescript
// 统计本月采购次数和商品数
const lowStockHistory = []; // 需要添加历史记录功能
const totalItems = lowStockHistory.reduce((sum, record) => sum + record.items.length, 0);
console.log(`本月共生成 ${lowStockHistory.length} 次采购清单`);
console.log(`累计采购商品 ${totalItems} 项`);
```

### 分析 2: 员工成本统计

```typescript
const employees = await getAllEmployees();
const monthlyCost = employees.reduce((sum, emp) => sum + calculateSalary(emp), 0);
const avgSalary = monthlyCost / employees.length;

console.log(`月度人力成本: ¥${monthlyCost.toFixed(2)}`);
console.log(`人均工资: ¥${avgSalary.toFixed(2)}`);
```

---

## 🎨 界面自定义示例

### 修改主题色为蓝色调

`tailwind.config.js`:

```javascript
colors: {
  cream: {
    50: '#f0f9ff',   // 浅蓝
    100: '#e0f2fe',
    // ...
  },
  coffee: {
    500: '#0284c7',  // 天蓝色
    600: '#0369a1',
    // ...
  },
}
```

### 添加暗色模式

`tailwind.config.js`:

```javascript
darkMode: 'class',
```

然后在组件中添加暗色样式:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  {/* 内容 */}
</div>
```

---

## 🚀 部署示例

### 部署到 Vercel

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 生产部署
vercel --prod
```

### 部署到 Netlify

```bash
# 1. 构建
npm run build

# 2. 使用 Netlify CLI
npm i -g netlify-cli
netlify login
netlify deploy

# 3. 生产部署
netlify deploy --prod
```

---

## 💡 实用小贴士

1. **定期备份**: 每周导出一次数据（JSON 格式）
2. **图片管理**: 使用 Unsplash 固定链接避免图片变化
3. **移动端**: 添加到主屏幕后体验更佳
4. **采购清单**: 可以用 Markdown 编辑器美化后打印
5. **员工管理**: 月初重置工作时数，月末结算工资

---

**更多使用技巧，请参考 [README.md](./README.md) 和 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**




