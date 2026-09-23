# ☕️ 咖啡店管理系统

一个优雅的咖啡店管理 Web 应用，采用日系设计风格，支持库存管理、员工管理、采购清单生成等功能。

![Coffee Shop Management](https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800)

## ☁️ 双端同步（Cloudflare Worker）

与整理券项目相同：同一静态站双入口 + Worker/KV。

| 入口 | 地址 | 默认 PIN |
|------|------|----------|
| 老板总结 | `/` | `2468` |
| 员工录入 | `/staff` | `1234` |

详见 [deploy/GITHUB_PAGES.md](deploy/GITHUB_PAGES.md)。

本地：

```bash
npm install
npm install --prefix worker
# 终端 1
npm run dev --prefix worker
# 终端 2（需 .env.local 中 VITE_API_URL=http://127.0.0.1:8787）
npm run dev
```

## ✨ 功能特性

### 📦 库存管理
- ✅ 添加/编辑/删除库存商品
- ✅ 库存低于阈值自动标红警告
- ✅ 支持商品分类（原料、耗材、清洁、设备等）
- ✅ 商品图片展示（Unsplash 集成）
- ✅ 实时库存数量追踪

### 👥 员工管理
- ✅ 员工信息管理（姓名、职位、联系方式）
- ✅ 工资自动计算（时薪 × 工作时数）
- ✅ 员工工资汇总统计
- ✅ 支持多种职位类型

### 📋 考勤管理
- ✅ 员工打卡记录（上班/下班时间）
- ✅ 自动计算每日工时
- ✅ 考勤历史记录查看
- ✅ 今日考勤统计
- ✅ 月度工时汇总

### 📊 每周报告
- ✅ 自动检测低库存商品
- ✅ 生成 Markdown 格式采购清单
- ✅ 文件名格式：`weekly-purchase-YYYY-MM-DD.md`
- ✅ 包含表格、emoji、分类汇总
- ✅ 一键下载功能

### 🎨 UI 设计
- ✅ 日系咖啡店风格（米白背景、圆角卡片、柔和阴影）
- ✅ iPhone 16 mockup 展示框架
- ✅ 响应式设计
- ✅ 优雅的动画过渡效果
- ✅ 底部导航栏

### 💾 数据存储
- ✅ IndexedDB 本地存储（Dexie.js）
- ✅ 离线可用
- ✅ 数据持久化
- ✅ 支持导入/导出

### 📱 PWA 支持
- ✅ 可添加到主屏幕
- ✅ 类原生应用体验
- ✅ 未来可迁移至 React Native / Capacitor

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 框架**: TailwindCSS
- **数据库**: Dexie.js (IndexedDB wrapper)
- **状态管理**: React Hooks
- **图片服务**: Unsplash

## 📂 项目结构

```
coffee-shop-management/
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/            # 可复用组件
│   │   ├── Button.tsx        # 按钮组件
│   │   ├── Card.tsx          # 卡片组件
│   │   ├── Modal.tsx         # 模态框组件
│   │   ├── Input.tsx         # 输入框组件
│   │   ├── PhoneMockup.tsx   # iPhone mockup 框架
│   │   └── BottomNav.tsx     # 底部导航栏
│   ├── pages/                # 页面组件
│   │   ├── InventoryPage.tsx    # 库存管理页面
│   │   ├── EmployeePage.tsx     # 员工管理页面
│   │   ├── AttendancePage.tsx   # 考勤管理页面 ⭐
│   │   ├── WeeklyReportPage.tsx # 每周报告页面
│   │   └── SettingsPage.tsx     # 设置页面
│   ├── utils/                # 工具函数
│   │   ├── db.ts             # Dexie.js 数据库封装
│   │   ├── generateMarkdown.ts # 采购清单生成器
│   │   └── generatePayroll.ts  # 工资报告生成器 ⭐
│   ├── App.tsx               # 主应用组件
│   ├── main.tsx              # 应用入口
│   └── index.css             # 全局样式
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产版本

```bash
npm run preview
```

## 📝 使用说明

### 初始化示例数据

首次使用时，系统会自动初始化示例数据，包括：
- 8 个示例库存商品（咖啡豆、牛奶、糖浆等）
- 4 名示例员工（店长、咖啡师、兼职）

你也可以在「设置」页面手动初始化或清除数据。

### 库存管理

1. 点击「➕ 添加商品」按钮
2. 填写商品信息（名称、数量、单位、阈值、类别）
3. 可选：添加商品图片链接
4. 点击保存

**低库存警告**：当商品数量 ≤ 阈值时，会自动标红并显示警告标签。

### 员工管理

1. 点击「➕ 添加员工」按钮
2. 填写员工信息（姓名、职位、时薪、工作时数）
3. 系统自动计算工资：工资 = 时薪 × 工作时数
4. 页面顶部显示员工总数和总工资

### 生成采购清单

**方式一**：在库存页面点击「🧾 生成采购清单」

**方式二**：在每周报告页面点击「📥 生成并下载采购清单」

系统会：
1. 自动检测所有低库存商品
2. 生成 Markdown 格式的采购清单
3. 包含商品表格、分类汇总、建议采购量
4. 自动下载为 `.md` 文件

**采购清单示例**：

```markdown
# ☕️ 每周采购清单

📅 **生成日期**: 2024年11月10日 星期一

---

## 📦 需要补充的商品

| 商品名称 | 当前库存 | 单位 | 安全库存 | 建议采购量 | 类别 |
|---------|---------|------|---------|-----------|------|
| 🌱 咖啡豆 - 哥伦比亚 | 2 | kg | 5 | **8** | 原料 |
| 🌱 糖浆 - 香草 | 3 | 瓶 | 5 | **7** | 原料 |

---

## 📊 采购汇总

- 📌 需采购商品数量: **2** 项
- 🔴 低库存警告: **2** 项
```

## 🎨 设计风格

### 配色方案

- **米白色系**: `#fdfcfb` ~ `#d4b8a1` (cream)
- **咖啡色系**: `#e8d5c4` ~ `#42301f` (coffee)
- **强调色**: 红色（警告）、绿色（成功）

### 设计理念

- 🌸 日系简约风格
- ☁️ 柔和圆角卡片
- ✨ 细腻阴影效果
- 🎯 清晰的信息层级
- 📱 移动端优先设计

## 📱 PWA 安装

### iOS (Safari)
1. 点击分享按钮
2. 选择「添加到主屏幕」
3. 点击「添加」

### Android (Chrome)
1. 点击菜单（三个点）
2. 选择「安装应用」或「添加到主屏幕」
3. 点击「安装」

### Desktop (Chrome/Edge)
1. 地址栏右侧会出现安装图标
2. 点击安装图标
3. 确认安装

## 🔧 开发指南

### 添加新的商品类别

编辑 `src/pages/InventoryPage.tsx`：

```typescript
const categories = [
  { value: '原料', label: '🌱 原料' },
  { value: '耗材', label: '📦 耗材' },
  { value: '你的类别', label: '🎯 你的类别' }, // 添加这里
];
```

### 修改配色主题

编辑 `tailwind.config.js`：

```javascript
colors: {
  cream: {
    50: '#fdfcfb',
    // ... 自定义颜色
  },
}
```

### 扩展数据库表

编辑 `src/utils/db.ts`：

```typescript
// 添加新表接口
export interface YourTable {
  id?: number;
  // ...字段
}

// 在数据库类中添加
export class CoffeeShopDB extends Dexie {
  yourTable!: Table<YourTable>;
  
  constructor() {
    super('CoffeeShopDB');
    this.version(2).stores({  // 增加版本号
      // ...现有表
      yourTable: '++id, ...字段',
    });
  }
}
```

## 🔮 未来规划

- [ ] 数据导出/导入功能（JSON/Excel）
- [ ] 销售记录与统计
- [ ] 多店铺管理
- [ ] 云端同步（Firebase）
- [ ] 暗色模式
- [ ] 多语言支持
- [ ] 图表可视化
- [ ] 打印功能
- [ ] React Native 移动端版本
- [ ] 后端 API 集成

## 📄 License

MIT License

## 🙏 致谢

- [Unsplash](https://unsplash.com) - 提供高质量图片
- [Dexie.js](https://dexie.org) - 优秀的 IndexedDB 封装库
- [TailwindCSS](https://tailwindcss.com) - 强大的 CSS 框架
- [Vite](https://vitejs.dev) - 快速的构建工具

---

<div align="center">

**Made with ☕️ and ❤️**

如果这个项目对你有帮助，请给个 ⭐️ 吧！

</div>

