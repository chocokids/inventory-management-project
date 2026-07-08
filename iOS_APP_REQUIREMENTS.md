# ☕️ 咖啡店管理系统 - iOS 应用需求文档

## 📋 项目概述

### 应用名称
**Coffee Shop Manager** (咖啡店管理)

### 应用简介
一款专为咖啡店设计的综合管理应用，提供库存管理、员工管理、考勤打卡、工资计算、采购清单生成等核心功能。采用优雅的日系设计风格，简洁易用。

### 目标用户
- 咖啡店店长/经理
- 小型咖啡店老板
- 咖啡店运营人员

### 平台要求
- **最低支持版本**: iOS 15.0+
- **目标设备**: iPhone (优先), iPad (适配)
- **方向**: Portrait (竖屏为主)

---

## 🎯 核心功能需求

### 1. 库存管理 (Inventory Management)

#### 1.1 功能列表
- ✅ 查看所有库存商品列表
- ✅ 添加新商品
- ✅ 编辑现有商品信息
- ✅ 删除商品
- ✅ 搜索/筛选商品
- ✅ 低库存预警（数量 ≤ 安全阈值时高亮显示）
- ✅ 按类别分类显示
- ✅ 生成采购清单

#### 1.2 数据模型
```swift
struct InventoryItem {
    var id: UUID
    var name: String              // 商品名称
    var quantity: Double          // 当前库存数量
    var unit: String              // 单位（kg, 瓶, 个, 包, 条等）
    var threshold: Double         // 安全库存阈值
    var category: String          // 类别（原料/耗材/清洁/设备/其他）
    var imageUrl: String?         // 商品图片URL（可选）
    var lastUpdated: Date         // 最后更新时间
}
```

#### 1.3 商品类别
- `ingredients` - 🌱 原料（咖啡豆、牛奶、糖浆等）
- `supplies` - 📦 耗材（杯子、吸管、餐巾纸等）
- `cleaning` - 🧹 清洁用品（洗涤剂、抹布等）
- `equipment` - 🔧 设备（机器配件等）
- `other` - 📋 其他

#### 1.4 单位选项
- `kg` - 千克
- `g` - 克
- `liter` - 升
- `bottle` - 瓶
- `piece` - 个
- `pack` - 包
- `strip` - 条

#### 1.5 UI 要求
- 列表视图展示所有商品
- 低库存商品用红色边框/标签标识
- 顶部显示统计信息：商品总数、低库存数量
- 支持下拉刷新
- 添加/编辑使用表单页面或 Modal
- 删除操作需要确认对话框

---

### 2. 员工管理 (Employee Management)

#### 2.1 功能列表
- ✅ 查看所有员工列表
- ✅ 添加新员工
- ✅ 编辑员工信息
- ✅ 删除员工
- ✅ 查看员工本月工时统计
- ✅ 查看员工本月工资计算
- ✅ 查看员工汇总统计

#### 2.2 数据模型
```swift
struct Employee {
    var id: UUID
    var name: String              // 姓名
    var position: String          // 职位（店长/咖啡师/兼职/实习生）
    var hourlyRate: Double        // 时薪（元/小时）
    var dailyTransportAllowance: Double  // 每日交通补贴（元/天）
    var phone: String?            // 电话（可选）
    var email: String?            // 邮箱（可选）
    var hireDate: Date            // 入职日期
}
```

#### 2.3 职位类型
- `manager` - 👔 店长
- `barista` - ☕️ 咖啡师
- `partTime` - ⏰ 兼职
- `intern` - 📚 实习生

#### 2.4 工资计算规则
```
月工资 = (本月总工时 × 时薪) + (本月工作天数 × 每日交通补贴)
```

#### 2.5 UI 要求
- 卡片式列表展示员工
- 每个员工卡片显示：姓名、职位、时薪、本月工时、本月工资
- 顶部显示统计：员工总数、本月总工时、本月总工资
- 无考勤记录的员工显示提示信息

---

### 3. 考勤管理 (Attendance Management)

#### 3.1 功能列表
- ✅ 查看考勤记录列表
- ✅ 添加打卡记录
- ✅ 编辑考勤记录
- ✅ 删除考勤记录
- ✅ 按员工筛选
- ✅ 按日期范围筛选
- ✅ 查看今日考勤统计
- ✅ 生成月度工资报告

#### 3.2 数据模型
```swift
struct AttendanceRecord {
    var id: UUID
    var employeeId: UUID          // 员工ID
    var employeeName: String      // 员工姓名
    var date: Date                // 日期
    var clockIn: String           // 上班时间 (HH:mm 格式)
    var clockOut: String          // 下班时间 (HH:mm 格式)
    var hoursWorked: Double       // 工作时长（小时）
    var notes: String?            // 备注（可选）
}
```

#### 3.3 工时计算规则
```
工作时长 = 下班时间 - 上班时间
// 自动处理跨天情况
// 保留两位小数
```

#### 3.4 UI 要求
- 顶部显示今日考勤统计（已打卡人数、总工时）
- 考勤记录按日期倒序排列（最新的在前）
- 支持筛选功能（员工、日期范围）
- 每条记录显示：员工、日期、上下班时间、工时
- 月度工资报告生成按钮

---

### 4. 每周报告 (Weekly Report)

#### 4.1 功能列表
- ✅ 自动检测低库存商品
- ✅ 显示低库存商品列表
- ✅ 按类别统计
- ✅ 生成采购清单文件
- ✅ 导出为 Markdown 格式
- ✅ 分享/保存文件

#### 4.2 采购清单内容
```markdown
# ☕️ 每周采购清单

📅 生成日期: 2026年2月5日 星期四

---

## 📦 需要补充的商品

| 商品名称 | 当前库存 | 单位 | 安全库存 | 建议采购量 | 类别 |
|---------|---------|------|---------|-----------|------|
| 咖啡豆 - 哥伦比亚 | 2 | kg | 5 | 8 | 原料 |

---

## 📊 采购汇总

- 📌 需采购商品数量: 2 项
- 🔴 低库存警告: 2 项

## 📦 分类汇总

### 🌱 原料
- 咖啡豆: 当前 2 kg, 建议采购 8 kg

---

## 📝 备注

- 请在本周内完成采购
- 如有问题，请联系供应商
- 采购完成后，请及时更新库存系统

---

*由咖啡店管理系统自动生成*
```

#### 4.3 建议采购量计算
```
建议采购量 = max(安全库存 × 2 - 当前库存, 安全库存)
```

#### 4.4 UI 要求
- 显示低库存商品数量（大字体高亮）
- 按类别展示统计
- 低库存商品列表（卡片形式）
- 生成并下载按钮
- 使用说明卡片

---

### 5. 设置页面 (Settings)

#### 5.1 功能列表
- ✅ 查看应用信息（名称、版本）
- ✅ 初始化示例数据
- ✅ 清除所有数据
- ✅ 导出数据（JSON）
- ✅ 导入数据（JSON）
- ✅ 语言切换（中文/日文/英文）
- ✅ 关于应用

#### 5.2 数据导出格式
```json
{
  "version": "1.0",
  "exportDate": "2026-02-05T10:00:00Z",
  "data": {
    "inventory": [...],
    "employees": [...],
    "attendance": [...]
  }
}
```

#### 5.3 示例数据
初始化时提供 8 个示例商品和 4 名示例员工，以及最近 7 天的考勤记录。

#### 5.4 UI 要求
- 分组列表展示
- 危险操作（清除数据）使用红色文本
- 所有操作需要确认对话框

---

## 🎨 UI/UX 设计规范

### 设计风格
**日系咖啡店风格** - 温暖、舒适、简约

### 配色方案

#### 主色调
```swift
// Cream 米白色系（背景、卡片）
cream50:  #fdfcfb
cream100: #f8f3ed
cream200: #f2e6d8
cream300: #e8d5c4
cream400: #d4b8a1

// Coffee 咖啡色系（文本、强调）
coffee50:  #f5f1ed
coffee100: #e8ddd4
coffee200: #d4c2b0
coffee300: #b89d85
coffee400: #9d7f63
coffee500: #7d5e45
coffee600: #5e4433
coffee700: #42301f
```

#### 功能色
```swift
// 警告色（低库存）
warning:  #ef4444  // 红色

// 成功色
success:  #10b981  // 绿色

// 信息色
info:     #3b82f6  // 蓝色
```

### 组件规范

#### 1. 卡片 (Card)
- 圆角: 16px
- 阴影: 0 2px 8px rgba(0,0,0,0.08)
- 内边距: 16px
- 背景: 白色或 cream50
- 边框: 1px solid cream200 (可选)

#### 2. 按钮 (Button)
**主按钮 (Primary)**
- 背景: coffee600
- 文字: 白色
- 圆角: 12px
- 高度: 48px
- 阴影: 0 2px 4px rgba(0,0,0,0.1)

**次要按钮 (Secondary)**
- 背景: cream200
- 文字: coffee700
- 圆角: 12px
- 高度: 44px

**危险按钮 (Danger)**
- 背景: #ef4444
- 文字: 白色
- 圆角: 12px

#### 3. 输入框 (Input)
- 圆角: 8px
- 边框: 1px solid cream300
- 高度: 44px
- 内边距: 12px
- 聚焦边框: coffee500

#### 4. 图标
使用 SF Symbols 系统图标：
- `bag` - 库存
- `person.3` - 员工
- `clock` - 考勤
- `chart.bar` - 报告
- `gearshape` - 设置
- `plus.circle` - 添加
- `pencil` - 编辑
- `trash` - 删除
- `arrow.down.doc` - 下载
- `exclamationmark.triangle` - 警告

### 字体规范
```swift
// 标题
.largeTitle:  34pt, Bold
.title:       28pt, Bold
.title2:      22pt, Bold
.title3:      20pt, Semibold

// 正文
.body:        17pt, Regular
.callout:     16pt, Regular
.subheadline: 15pt, Regular
.footnote:    13pt, Regular
.caption:     12pt, Regular
```

### 间距规范
```swift
// 标准间距
.spacing4:   4pt
.spacing8:   8pt
.spacing12:  12pt
.spacing16:  16pt
.spacing24:  24pt
.spacing32:  32pt
```

### 动画
- 过渡动画: 0.3s easeInOut
- 下拉刷新: 系统标准动画
- 按钮点击: 缩放 0.95

---

## 📱 页面结构

### 导航结构
采用 **TabBar** 底部导航栏，5 个主要标签页：

```
TabBar
├── 库存管理 (Inventory)
│   └── 商品详情/编辑
├── 员工管理 (Employees)
│   └── 员工详情/编辑
├── 考勤管理 (Attendance)
│   ├── 打卡记录详情/编辑
│   └── 月度工资报告
├── 每周报告 (Reports)
│   └── 采购清单详情
└── 设置 (Settings)
    ├── 语言设置
    ├── 数据管理
    └── 关于应用
```

### 各页面布局

#### 1. 库存管理页面
```
┌─────────────────────────────┐
│  ☕️ 库存管理                 │
│                              │
│  ┌────────────────────────┐ │
│  │ 📊 统计卡片            │ │
│  │ 商品总数: 8            │ │
│  │ 低库存: 2              │ │
│  └────────────────────────┘ │
│                              │
│  [➕ 添加商品] [🧾 生成采购单] │
│                              │
│  🔍 [搜索框]                 │
│  🎯 [筛选: 全部 ▼]           │
│                              │
│  ┌────────────────────────┐ │
│  │ 🌱 咖啡豆 - 哥伦比亚    │ │
│  │ 2 kg / 安全库存: 5 kg   │ │
│  │ 🔴 库存不足             │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │ 🥛 牛奶 - 全脂          │ │
│  │ 15 升 / 安全库存: 10 升 │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
```

#### 2. 员工管理页面
```
┌─────────────────────────────┐
│  👥 员工管理                 │
│                              │
│  ┌────────────────────────┐ │
│  │ 📊 本月统计            │ │
│  │ 员工: 4人  工时: 520h  │ │
│  │ 总工资: ¥15,200        │ │
│  └────────────────────────┘ │
│                              │
│  [➕ 添加员工]              │
│                              │
│  ┌────────────────────────┐ │
│  │ 👔 张经理               │ │
│  │ 店长 · ¥30/小时         │ │
│  │ 本月: 160h · ¥5,200    │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │ ☕️ 李师傅               │ │
│  │ 咖啡师 · ¥25/小时       │ │
│  │ 本月: 140h · ¥4,100    │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
```

#### 3. 考勤管理页面
```
┌─────────────────────────────┐
│  ⏰ 考勤管理                 │
│                              │
│  ┌────────────────────────┐ │
│  │ 📅 今日考勤            │ │
│  │ 已打卡: 3人  总工时: 24h│ │
│  └────────────────────────┘ │
│                              │
│  [➕ 添加考勤] [📊 生成工资报告]│
│                              │
│  [筛选] [员工 ▼] [日期范围]  │
│                              │
│  ┌────────────────────────┐ │
│  │ 👤 张经理               │ │
│  │ 2月5日 周四             │ │
│  │ 09:00 - 18:00  共 9h   │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │ 👤 李师傅               │ │
│  │ 2月5日 周四             │ │
│  │ 08:00 - 16:00  共 8h   │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
```

---

## 💾 数据存储方案

### 推荐技术栈
**Core Data** 或 **SwiftData** (iOS 17+)

### 数据关系
```
Employee (1) ────→ (N) AttendanceRecord
    ↓
    └─ 计算月度工时和工资
```

### 数据持久化
- 所有数据存储在本地设备
- 使用 Core Data / SwiftData
- 支持 iCloud 同步（可选）

### 数据备份
- 支持导出为 JSON
- 支持从 JSON 导入
- 通过 iCloud Drive 或 Files 分享

---

## 🌐 国际化 (i18n)

### 支持语言
1. **简体中文** (zh-Hans) - 默认
2. **日文** (ja)
3. **英文** (en)

### 翻译要求
所有用户可见的文本都需要提供三语翻译：
- 按钮文字
- 标签文字
- 提示信息
- 错误消息
- 占位符文本
- 导出文件内容

### 数据存储
- 内部字段使用英文键（如 `position: "manager"`）
- 显示时动态翻译为对应语言

### 日期和数字格式
- 使用系统 `Locale` 自动格式化
- 中文: 2026年2月5日 星期四
- 日文: 2026年2月5日 木曜日
- 英文: Thursday, February 5, 2026

### 货币符号
- 中文/日文: ¥
- 英文: $

---

## 📊 报告生成

### 1. 采购清单报告
**格式**: Markdown (.md)
**文件名**: `weekly-purchase-YYYY-MM-DD.md`
**内容**: 见"每周报告"章节

### 2. 工资报告
**格式**: Markdown (.md)
**文件名**: `payroll-YYYY-MM.md`

**内容结构**:
```markdown
# 💰 月度工资报告

📅 报告月份: 2026年2月
📝 生成日期: 2026年2月5日 星期四

---

## 📊 汇总信息

| 项目 | 数值 |
|------|------|
| 👥 员工人数 | 4 人 |
| ⏰ 总工时 | 520.00 小时 |
| 💵 总工资 | ¥15,200.00 |
| 📈 平均工资 | ¥3,800.00 |

---

## 📋 详细工资表

| 姓名 | 职位 | 时薪 | 工作时数 | 工作天数 | 时薪工资 | 交通费 | 应发工资 | 备注 |
|------|------|------|----------|----------|----------|--------|----------|------|
| 👔 张经理 | 店长 | ¥30 | 160h | 20天 | ¥4,800 | ¥400 | ¥5,200 | |
| ☕️ 李师傅 | 咖啡师 | ¥25 | 140h | 18天 | ¥3,500 | ¥270 | ¥3,770 | |

---

## 📈 职位分组统计

### 👔 店长
- 人数: 1 人
- 总工时: 160 小时
- 总工资: ¥5,200
- 平均工资: ¥5,200

---

## 📝 备注说明

### 工资计算方式
```
应发工资 = (工作时数 × 时薪) + (工作天数 × 每日交通费)
```

### 注意事项
- 本报告为初步统计，实际发放时请核对考勤记录
- 未包含扣款、奖金、补贴等项目
- 工资发放前请员工确认签字

---

*由咖啡店管理系统自动生成*
```

### 导出方式
- 使用 `UIActivityViewController` 分享
- 保存到 Files App
- 通过邮件发送
- 打印（可选）

---

## 🔧 技术实现建议

### 架构模式
**MVVM (Model-View-ViewModel)** + **SwiftUI**

```
View (SwiftUI)
    ↓
ViewModel (ObservableObject)
    ↓
Model (Core Data / SwiftData)
```

### 推荐框架
- **UI**: SwiftUI
- **数据库**: Core Data 或 SwiftData
- **网络**: URLSession (如需同步功能)
- **图表**: Swift Charts (可选)
- **Markdown 渲染**: MarkdownUI (可选)

### 项目结构
```
CoffeeShopManager/
├── App/
│   ├── CoffeeShopManagerApp.swift
│   └── ContentView.swift
├── Models/
│   ├── InventoryItem.swift
│   ├── Employee.swift
│   └── AttendanceRecord.swift
├── ViewModels/
│   ├── InventoryViewModel.swift
│   ├── EmployeeViewModel.swift
│   ├── AttendanceViewModel.swift
│   └── ReportViewModel.swift
├── Views/
│   ├── Inventory/
│   │   ├── InventoryListView.swift
│   │   └── InventoryDetailView.swift
│   ├── Employee/
│   │   ├── EmployeeListView.swift
│   │   └── EmployeeDetailView.swift
│   ├── Attendance/
│   │   ├── AttendanceListView.swift
│   │   └── AttendanceDetailView.swift
│   ├── Report/
│   │   └── WeeklyReportView.swift
│   └── Settings/
│       └── SettingsView.swift
├── Components/
│   ├── CardView.swift
│   ├── StatsCard.swift
│   └── CustomButton.swift
├── Utilities/
│   ├── DataManager.swift
│   ├── MarkdownGenerator.swift
│   └── LocalizationManager.swift
├── Resources/
│   ├── Localizable.strings (zh-Hans)
│   ├── Localizable.strings (ja)
│   └── Localizable.strings (en)
└── Assets.xcassets
```

---

## ✅ 功能优先级

### P0 (MVP - 必须有)
- [x] 库存管理（增删改查）
- [x] 员工管理（增删改查）
- [x] 考勤管理（增删改查）
- [x] 低库存预警
- [x] 工资自动计算
- [x] 数据本地存储

### P1 (重要功能)
- [x] 采购清单生成和导出
- [x] 工资报告生成和导出
- [x] 筛选和搜索功能
- [x] 统计信息展示
- [x] 多语言支持

### P2 (增强功能)
- [ ] 数据导入/导出 (JSON)
- [ ] iCloud 同步
- [ ] 图表可视化
- [ ] 暗色模式
- [ ] iPad 适配

### P3 (未来规划)
- [ ] Apple Watch 考勤打卡
- [ ] Widget 小组件
- [ ] Siri Shortcuts
- [ ] 销售记录
- [ ] 多店铺管理
- [ ] 云端同步

---

## 🎯 用户故事 (User Stories)

### 库存管理
1. 作为店长，我想查看所有库存商品，以便了解当前库存状况
2. 作为店长，我想添加新商品到库存，以便跟踪新进货的商品
3. 作为店长，我想看到低库存警告，以便及时补货
4. 作为店长，我想生成采购清单，以便快速知道需要采购什么

### 员工管理
1. 作为店长，我想添加新员工信息，以便管理团队
2. 作为店长，我想查看员工的工时统计，以便核算工资
3. 作为店长，我想自动计算员工工资，以便节省时间

### 考勤管理
1. 作为店长，我想记录员工打卡时间，以便统计工时
2. 作为店长，我想筛选某个员工的考勤记录，以便查看个人出勤情况
3. 作为店长，我想生成月度工资报告，以便发放工资

---

## 🔒 数据安全

### 本地存储安全
- 使用 Keychain 存储敏感数据（如果有）
- 数据加密存储（可选）
- Face ID / Touch ID 应用锁（可选）

### 数据备份
- 支持 iCloud 自动备份
- 手动导出 JSON 备份
- 防止数据丢失

---

## 📝 测试要求

### 单元测试
- ViewModel 逻辑测试
- 数据模型测试
- 工资计算逻辑测试
- 工时计算逻辑测试

### UI 测试
- 主要功能流程测试
- 表单验证测试
- 导航测试

### 测试覆盖率目标
- 核心业务逻辑: 80%+
- UI 测试: 主要流程全覆盖

---

## 📦 发布清单

### App Store 信息
**应用名称**: Coffee Shop Manager / 咖啡店管理

**副标题**: 库存·员工·考勤·工资 一站式管理

**描述**:
```
专为咖啡店打造的综合管理应用

核心功能：
• 📦 库存管理 - 实时跟踪商品库存，低库存自动提醒
• 👥 员工管理 - 管理员工信息，自动计算工资
• ⏰ 考勤打卡 - 记录工作时间，自动统计工时
• 📊 智能报表 - 一键生成采购清单和工资报告
• 🌐 多语言 - 支持中文、日文、英文

特色：
✨ 优雅的日系设计风格
✨ 简单易用，无需培训
✨ 数据本地存储，保护隐私
✨ 支持数据导入导出

适合：
• 咖啡店老板和店长
• 小型餐饮店管理者
• 需要简单高效管理工具的经营者
```

**关键词**: 
咖啡店, 库存管理, 员工管理, 考勤, 工资, POS, 餐饮, 小店管理

**类别**: 
商务, 效率

**截图要求**:
- 6.7" (iPhone 15 Pro Max): 5-10 张
- 5.5" (iPhone 8 Plus): 5-10 张
- iPad Pro: 5-10 张

### 审核注意事项
- 提供测试账号（如不需要）
- 说明数据全部本地存储
- 隐私政策页面
- 使用条款页面

---

## 🎨 示例数据

### 库存示例
```json
[
  {
    "name": "咖啡豆 - 哥伦比亚",
    "quantity": 2,
    "unit": "kg",
    "threshold": 5,
    "category": "ingredients"
  },
  {
    "name": "牛奶 - 全脂",
    "quantity": 15,
    "unit": "liter",
    "threshold": 10,
    "category": "ingredients"
  },
  {
    "name": "糖浆 - 香草",
    "quantity": 3,
    "unit": "bottle",
    "threshold": 5,
    "category": "ingredients"
  },
  {
    "name": "纸杯 - 中杯",
    "quantity": 200,
    "unit": "piece",
    "threshold": 100,
    "category": "supplies"
  }
]
```

### 员工示例
```json
[
  {
    "name": "张经理",
    "position": "manager",
    "hourlyRate": 30,
    "dailyTransportAllowance": 20,
    "phone": "138-0000-0001"
  },
  {
    "name": "李师傅",
    "position": "barista",
    "hourlyRate": 25,
    "dailyTransportAllowance": 15,
    "phone": "138-0000-0002"
  },
  {
    "name": "王小明",
    "position": "partTime",
    "hourlyRate": 20,
    "dailyTransportAllowance": 10,
    "phone": "138-0000-0003"
  }
]
```

---

## 📚 参考资料

### 设计灵感
- 日系咖啡店 UI
- Apple Human Interface Guidelines
- Material Design (参考)

### 类似应用
- Square POS
- Toast POS
- Lightspeed Restaurant

### 技术文档
- SwiftUI Documentation
- Core Data Programming Guide
- Swift Charts Documentation

---

## 📞 联系与反馈

如有任何疑问或需要澄清的需求，请联系：
- 产品经理: [联系方式]
- 技术负责人: [联系方式]

---

## 📋 版本历史

### Version 1.0 (MVP)
- 库存管理
- 员工管理
- 考勤管理
- 报告生成
- 多语言支持

### Version 1.1 (计划中)
- 数据导入导出
- iCloud 同步
- iPad 适配

---

**文档版本**: 1.0  
**最后更新**: 2026年2月5日  
**状态**: ✅ 完成

---

> 💡 **提示**: 本文档基于现有 Web 版本的功能需求整理，iOS 实现时可根据平台特性进行适当调整和优化。

