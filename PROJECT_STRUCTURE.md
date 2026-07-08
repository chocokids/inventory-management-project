# 📁 项目结构说明

```
coffee-shop-management/
│
├── 📄 配置文件
│   ├── package.json              # 项目依赖和脚本
│   ├── tsconfig.json             # TypeScript 配置
│   ├── tsconfig.node.json        # Node 环境 TS 配置
│   ├── vite.config.ts            # Vite 构建配置
│   ├── tailwind.config.js        # TailwindCSS 配置
│   ├── postcss.config.js         # PostCSS 配置
│   ├── .eslintrc.cjs             # ESLint 配置
│   └── .gitignore                # Git 忽略文件
│
├── 📚 文档
│   ├── README.md                 # 项目说明文档
│   ├── QUICKSTART.md             # 快速启动指南
│   └── PROJECT_STRUCTURE.md      # 项目结构说明（本文件）
│
├── 🌐 入口文件
│   └── index.html                # HTML 入口
│
├── 📦 public/（静态资源）
│   ├── manifest.json             # PWA manifest
│   └── vite.svg                  # 应用图标
│
└── 💻 src/（源代码）
    ├── main.tsx                  # 应用入口
    ├── App.tsx                   # 主应用组件
    ├── index.css                 # 全局样式
    ├── vite-env.d.ts             # Vite 类型定义
    │
    ├── 🧩 components/（可复用组件）
    │   ├── Button.tsx            # 按钮组件
    │   ├── Card.tsx              # 卡片组件
    │   ├── Modal.tsx             # 模态框组件
    │   ├── Input.tsx             # 输入框/选择框组件
    │   ├── PhoneMockup.tsx       # iPhone 16 mockup 框架
    │   └── BottomNav.tsx         # 底部导航栏
    │
    ├── 📄 pages/（页面组件）
    │   ├── InventoryPage.tsx     # 库存管理页面
    │   ├── EmployeePage.tsx      # 员工管理页面
    │   ├── WeeklyReportPage.tsx  # 每周报告页面
    │   └── SettingsPage.tsx      # 设置页面
    │
    └── 🛠️ utils/（工具函数）
        ├── db.ts                 # Dexie.js 数据库封装
        └── generateMarkdown.ts   # Markdown 生成器

```

## 📋 文件说明

### 核心配置文件

| 文件 | 说明 |
|-----|------|
| `package.json` | 定义项目依赖、脚本命令、项目元信息 |
| `tsconfig.json` | TypeScript 编译配置（严格模式、目标版本等） |
| `vite.config.ts` | Vite 开发服务器和构建配置（端口、插件等） |
| `tailwind.config.js` | TailwindCSS 主题配置（颜色、间距等） |

### 组件详解

#### 🧩 可复用组件

- **Button.tsx**: 多种样式的按钮（primary, secondary, danger, outline）
- **Card.tsx**: 卡片容器，支持标题和副标题
- **Modal.tsx**: 模态对话框，支持自定义内容
- **Input.tsx**: 输入框和下拉选择框，支持标签和错误提示
- **PhoneMockup.tsx**: iPhone 16 模拟框架，包含刘海和状态栏
- **BottomNav.tsx**: 底部导航栏，支持多标签切换

#### 📄 页面组件

**InventoryPage.tsx** - 库存管理
- 商品列表展示（带图片）
- 添加/编辑/删除商品
- 低库存警告（红色标注）
- 生成采购清单功能

**EmployeePage.tsx** - 员工管理
- 员工列表展示
- 添加/编辑/删除员工
- 自动计算工资（时薪 × 工时）
- 总工资统计

**WeeklyReportPage.tsx** - 每周报告
- 低库存商品统计
- 分类汇总
- 生成并下载 Markdown 采购清单
- 可视化库存状态

**SettingsPage.tsx** - 设置
- 初始化示例数据
- 清除所有数据
- 应用信息展示
- PWA 安装引导

### 工具函数

#### db.ts - 数据库封装

**表结构**:
- `inventory`: 库存商品表
- `employees`: 员工信息表

**核心函数**:
```typescript
// 库存管理
getAllInventory()          // 获取所有库存
addInventoryItem()         // 添加库存
updateInventoryItem()      // 更新库存
deleteInventoryItem()      // 删除库存
getLowStockItems()         // 获取低库存商品

// 员工管理
getAllEmployees()          // 获取所有员工
addEmployee()              // 添加员工
updateEmployee()           // 更新员工
deleteEmployee()           // 删除员工
calculateSalary()          // 计算工资

// 初始化
initializeSampleData()     // 初始化示例数据
```

#### generateMarkdown.ts - Markdown 生成器

**核心函数**:
```typescript
generatePurchaseListMarkdown()      // 生成 Markdown 内容
downloadMarkdownFile()              // 下载 Markdown 文件
generateAndDownloadPurchaseList()   // 一键生成并下载
```

**生成内容**:
- 标题和日期
- 低库存商品表格
- 分类汇总
- 采购建议
- Emoji 装饰

## 🔄 数据流

```
用户操作
   ↓
页面组件 (InventoryPage.tsx)
   ↓
工具函数 (db.ts)
   ↓
Dexie.js (IndexedDB 封装)
   ↓
浏览器 IndexedDB
```

## 🎨 样式系统

### TailwindCSS 配置

**自定义颜色**:
- `cream`: 米白色系 (50-500)
- `coffee`: 咖啡色系 (100-700)

**常用类名**:
- `rounded-2xl`: 大圆角
- `shadow-lg`: 柔和阴影
- `bg-cream-50`: 米白背景
- `text-coffee-700`: 深咖啡色文字

### 全局样式 (index.css)

- 自定义滚动条样式
- 平滑过渡动画
- 响应式设计

## 🔌 扩展指南

### 添加新页面

1. 在 `src/pages/` 创建新组件
2. 在 `App.tsx` 中导入并添加路由逻辑
3. 在 `BottomNav` 添加导航项

### 添加新数据表

1. 在 `db.ts` 定义接口
2. 在 `CoffeeShopDB` 类中声明表
3. 在 `version()` 中添加表结构
4. 创建 CRUD 函数

### 修改主题

1. 编辑 `tailwind.config.js` 颜色配置
2. 更新组件中的颜色类名
3. 可选：修改 `index.css` 自定义样式

## 📱 PWA 配置

**manifest.json** 配置项:
- `name`: 应用全名
- `short_name`: 应用简称
- `display`: 显示模式 (standalone)
- `theme_color`: 主题颜色
- `background_color`: 背景颜色
- `icons`: 应用图标

## 🚀 构建流程

```bash
# 开发环境
npm run dev
  ↓
Vite 开发服务器 (热更新)
  ↓
浏览器 (http://localhost:3000)

# 生产环境
npm run build
  ↓
TypeScript 编译
  ↓
Vite 打包优化
  ↓
dist/ 文件夹 (可部署)
```

## 📊 性能优化

- ✅ Vite 快速构建
- ✅ React 组件懒加载
- ✅ TailwindCSS 按需加载
- ✅ IndexedDB 离线存储
- ✅ 图片懒加载

## 🔒 数据安全

- ✅ 数据存储在客户端 IndexedDB
- ✅ 无后端服务器，无数据泄露风险
- ✅ 用户完全控制自己的数据
- ⚠️ 注意：清除浏览器数据会丢失所有信息

---

**提示**: 这是一个纯前端应用，所有数据存储在浏览器本地。如需多设备同步或数据备份，请考虑添加云端存储功能。




