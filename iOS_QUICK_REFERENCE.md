# ☕️ 咖啡店管理 iOS 开发 - 快速参考

## 📋 核心数据模型速查

### InventoryItem (库存商品)
```swift
id: UUID
name: String                // 商品名称
quantity: Double            // 当前数量
unit: String                // 单位 (kg/liter/bottle/piece/pack/strip)
threshold: Double           // 安全阈值
category: String            // 类别 (ingredients/supplies/cleaning/equipment/other)
imageUrl: String?           // 图片URL（可选）
lastUpdated: Date          // 更新时间
```

### Employee (员工)
```swift
id: UUID
name: String                       // 姓名
position: String                   // 职位 (manager/barista/partTime/intern)
hourlyRate: Double                 // 时薪 (元/小时)
dailyTransportAllowance: Double    // 每日交通费
phone: String?                     // 电话
email: String?                     // 邮箱
hireDate: Date                     // 入职日期
```

### AttendanceRecord (考勤记录)
```swift
id: UUID
employeeId: UUID           // 员工ID
employeeName: String       // 员工姓名
date: Date                 // 日期
clockIn: String            // 上班时间 "HH:mm"
clockOut: String           // 下班时间 "HH:mm"
hoursWorked: Double        // 工作时长
notes: String?             // 备注
```

---

## 🎨 UI 设计速查

### 颜色
```swift
// 背景色
cream50:   #fdfcfb
cream100:  #f8f3ed

// 主色调
coffee600: #5e4433
coffee700: #42301f

// 功能色
warning:   #ef4444 (红色 - 低库存)
success:   #10b981 (绿色 - 成功)
```

### 字体
```swift
.largeTitle:  34pt Bold
.title:       28pt Bold
.body:        17pt Regular
.caption:     12pt Regular
```

### 间距
```swift
.spacing8:   8pt
.spacing12:  12pt
.spacing16:  16pt
.spacing24:  24pt
```

### 圆角
```swift
card:   16px
button: 12px
input:  8px
```

---

## 📱 页面结构速查

```
TabBar (底部导航)
├── 🛍️ 库存管理
│   ├── 商品列表
│   ├── 添加/编辑商品
│   └── 生成采购清单
│
├── 👥 员工管理
│   ├── 员工列表
│   ├── 添加/编辑员工
│   └── 查看工资统计
│
├── ⏰ 考勤管理
│   ├── 考勤记录列表
│   ├── 添加/编辑考勤
│   ├── 筛选功能
│   └── 生成工资报告
│
├── 📊 每周报告
│   ├── 低库存统计
│   ├── 低库存商品列表
│   └── 导出采购清单
│
└── ⚙️ 设置
    ├── 语言切换 (中/日/英)
    ├── 数据导入导出
    ├── 初始化示例数据
    └── 清除所有数据
```

---

## 🔧 核心算法速查

### 工时计算
```swift
static func calculateHours(from clockIn: String, to clockOut: String) -> Double {
    // 将 "HH:mm" 转换为分钟
    // 计算差值（处理跨天）
    // 返回小时数（保留两位小数）
}
```

### 月工资计算
```swift
func calculateMonthlySalary(year: Int, month: Int) -> Double {
    let hours = calculateMonthlyHours(year: year, month: month)
    let days = calculateMonthlyWorkDays(year: year, month: month)
    return (hours × hourlyRate) + (days × dailyTransportAllowance)
}
```

### 建议采购量
```swift
var suggestedPurchaseQuantity: Double {
    max(threshold × 2 - quantity, threshold)
}
```

### 低库存判断
```swift
var isLowStock: Bool {
    quantity <= threshold
}
```

---

## 🌐 枚举类型速查

### 单位 (Unit)
```
kg      - 千克
g       - 克
liter   - 升
bottle  - 瓶
piece   - 个
pack    - 包
strip   - 条
```

### 类别 (Category)
```
ingredients - 🌱 原料
supplies    - 📦 耗材
cleaning    - 🧹 清洁
equipment   - 🔧 设备
other       - 📋 其他
```

### 职位 (Position)
```
manager  - 👔 店长
barista  - ☕️ 咖啡师
partTime - ⏰ 兼职
intern   - 📚 实习生
```

---

## 📊 报告格式速查

### 采购清单文件名
```
weekly-purchase-YYYY-MM-DD.md
例: weekly-purchase-2026-02-05.md
```

### 工资报告文件名
```
payroll-YYYY-MM.md
例: payroll-2026-02.md
```

### 数据导出文件名
```
coffeeshop-data-YYYY-MM-DD.json
例: coffeeshop-data-2026-02-05.json
```

---

## 🔤 SF Symbols 图标速查

```swift
// 导航栏
bag              - 库存
person.3         - 员工
clock            - 考勤
chart.bar        - 报告
gearshape        - 设置

// 操作
plus.circle      - 添加
pencil           - 编辑
trash            - 删除
arrow.down.doc   - 下载
square.and.arrow.up - 分享

// 状态
exclamationmark.triangle - 警告
checkmark.circle - 成功
info.circle      - 信息

// 功能
magnifyingglass  - 搜索
line.3.horizontal.decrease - 筛选
calendar         - 日历
dollarsign.circle - 工资
```

---

## 🌍 本地化代码速查

### 语言标识符
```swift
zh-Hans  // 简体中文
ja       // 日文
en       // 英文
```

### 使用方式
```swift
// 在代码中
Text("inventory.title")

// 在 Localizable.strings 中
"inventory.title" = "库存管理";  // zh-Hans
"inventory.title" = "在庫管理";  // ja
"inventory.title" = "Inventory"; // en
```

### 日期格式化
```swift
let formatter = DateFormatter()
formatter.locale = Locale(identifier: "zh_CN") // 或 ja_JP, en_US
formatter.dateStyle = .full

// 输出示例:
// zh: 2026年2月5日 星期四
// ja: 2026年2月5日 木曜日
// en: Thursday, February 5, 2026
```

---

## 💾 数据导入导出速查

### 导出 JSON 结构
```json
{
  "version": "1.0.0",
  "exportDate": "ISO8601 时间戳",
  "data": {
    "inventory": [...],
    "employees": [...],
    "attendance": [...]
  }
}
```

### 导入步骤
1. 选择 JSON 文件
2. 验证格式
3. 确认导入
4. 清空现有数据（可选）
5. 插入新数据
6. 刷新界面

---

## ⚡️ 常用功能代码片段

### 添加数据
```swift
let item = InventoryItem(name: "咖啡豆", quantity: 5, unit: "kg", ...)
modelContext.insert(item)
try? modelContext.save()
```

### 更新数据
```swift
item.quantity = 10
item.lastUpdated = Date()
try? modelContext.save()
```

### 删除数据
```swift
modelContext.delete(item)
try? modelContext.save()
```

### 查询数据
```swift
let descriptor = FetchDescriptor<InventoryItem>(
    sortBy: [SortDescriptor(\.name)]
)
let items = try modelContext.fetch(descriptor)
```

### 筛选数据
```swift
let descriptor = FetchDescriptor<InventoryItem>(
    predicate: #Predicate { item in
        item.quantity <= item.threshold
    }
)
```

---

## 🎯 开发优先级

### P0 (必须)
- ✅ 库存 CRUD
- ✅ 员工 CRUD
- ✅ 考勤 CRUD
- ✅ 低库存预警
- ✅ 工资计算

### P1 (重要)
- ✅ 采购清单生成
- ✅ 工资报告生成
- ✅ 多语言支持
- ✅ 搜索筛选

### P2 (可选)
- ⏳ 数据导入导出
- ⏳ iCloud 同步
- ⏳ 图表统计
- ⏳ 暗色模式

---

## 📱 测试要点

### 单元测试
- ✅ 工时计算准确性
- ✅ 工资计算准确性
- ✅ 跨天处理
- ✅ 建议采购量计算

### UI 测试
- ✅ 添加/编辑/删除流程
- ✅ 搜索筛选功能
- ✅ 报告生成和分享
- ✅ 语言切换

### 边界测试
- ✅ 空数据处理
- ✅ 大量数据性能
- ✅ 网络离线情况
- ✅ 非法输入验证

---

## 🔗 有用的链接

- [Apple 设计指南](https://developer.apple.com/design/human-interface-guidelines/)
- [SwiftUI 文档](https://developer.apple.com/documentation/swiftui/)
- [Core Data 指南](https://developer.apple.com/documentation/coredata)
- [SF Symbols 浏览器](https://developer.apple.com/sf-symbols/)

---

**快速参考版本**: 1.0  
**对应需求文档**: iOS_APP_REQUIREMENTS.md  
**最后更新**: 2026年2月5日

