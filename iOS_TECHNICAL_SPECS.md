# ☕️ 咖啡店管理系统 - iOS 技术规范补充文档

## 📋 文档说明

本文档是 `iOS_APP_REQUIREMENTS.md` 的技术补充，提供详细的 API 规范、数据库 Schema、算法逻辑等技术实现细节。

---

## 🗄️ 数据库 Schema

### Core Data / SwiftData Entity 定义

#### 1. InventoryItem Entity
```swift
@Model
class InventoryItem {
    @Attribute(.unique) var id: UUID
    var name: String
    var quantity: Double
    var unit: String
    var threshold: Double
    var category: String
    var imageUrl: String?
    var lastUpdated: Date
    
    init(name: String, quantity: Double, unit: String, 
         threshold: Double, category: String, imageUrl: String? = nil) {
        self.id = UUID()
        self.name = name
        self.quantity = quantity
        self.unit = unit
        self.threshold = threshold
        self.category = category
        self.imageUrl = imageUrl
        self.lastUpdated = Date()
    }
    
    // 计算属性
    var isLowStock: Bool {
        quantity <= threshold
    }
    
    var suggestedPurchaseQuantity: Double {
        max(threshold * 2 - quantity, threshold)
    }
}
```

#### 2. Employee Entity
```swift
@Model
class Employee {
    @Attribute(.unique) var id: UUID
    var name: String
    var position: String
    var hourlyRate: Double
    var dailyTransportAllowance: Double
    var phone: String?
    var email: String?
    var hireDate: Date
    
    // 关联
    @Relationship(deleteRule: .cascade, inverse: \AttendanceRecord.employee)
    var attendanceRecords: [AttendanceRecord] = []
    
    init(name: String, position: String, hourlyRate: Double,
         dailyTransportAllowance: Double = 0, phone: String? = nil,
         email: String? = nil, hireDate: Date = Date()) {
        self.id = UUID()
        self.name = name
        self.position = position
        self.hourlyRate = hourlyRate
        self.dailyTransportAllowance = dailyTransportAllowance
        self.phone = phone
        self.email = email
        self.hireDate = hireDate
    }
    
    // 计算方法
    func calculateMonthlyHours(year: Int, month: Int) -> Double {
        let calendar = Calendar.current
        let startDate = calendar.date(from: DateComponents(year: year, month: month, day: 1))!
        let endDate = calendar.date(byAdding: DateComponents(month: 1, day: -1), to: startDate)!
        
        return attendanceRecords
            .filter { $0.date >= startDate && $0.date <= endDate }
            .reduce(0) { $0 + $1.hoursWorked }
    }
    
    func calculateMonthlyWorkDays(year: Int, month: Int) -> Int {
        let calendar = Calendar.current
        let startDate = calendar.date(from: DateComponents(year: year, month: month, day: 1))!
        let endDate = calendar.date(byAdding: DateComponents(month: 1, day: -1), to: startDate)!
        
        return attendanceRecords
            .filter { $0.date >= startDate && $0.date <= endDate }
            .count
    }
    
    func calculateMonthlySalary(year: Int, month: Int) -> Double {
        let hours = calculateMonthlyHours(year: year, month: month)
        let days = calculateMonthlyWorkDays(year: year, month: month)
        return (hours * hourlyRate) + (Double(days) * dailyTransportAllowance)
    }
}
```

#### 3. AttendanceRecord Entity
```swift
@Model
class AttendanceRecord {
    @Attribute(.unique) var id: UUID
    var date: Date
    var clockIn: String  // "HH:mm"
    var clockOut: String // "HH:mm"
    var hoursWorked: Double
    var notes: String?
    
    // 关联
    var employee: Employee?
    
    init(employee: Employee, date: Date, clockIn: String,
         clockOut: String, notes: String? = nil) {
        self.id = UUID()
        self.employee = employee
        self.date = date
        self.clockIn = clockIn
        self.clockOut = clockOut
        self.hoursWorked = Self.calculateHours(from: clockIn, to: clockOut)
        self.notes = notes
    }
    
    // 工时计算算法
    static func calculateHours(from clockIn: String, to clockOut: String) -> Double {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        
        guard let inTime = formatter.date(from: clockIn),
              let outTime = formatter.date(from: clockOut) else {
            return 0
        }
        
        let calendar = Calendar.current
        let inMinutes = calendar.component(.hour, from: inTime) * 60 + 
                       calendar.component(.minute, from: inTime)
        var outMinutes = calendar.component(.hour, from: outTime) * 60 + 
                        calendar.component(.minute, from: outTime)
        
        // 处理跨天情况
        if outMinutes < inMinutes {
            outMinutes += 24 * 60
        }
        
        let diff = outMinutes - inMinutes
        return Double(diff) / 60.0
    }
}
```

---

## 🔧 ViewModel 示例

### InventoryViewModel
```swift
@MainActor
class InventoryViewModel: ObservableObject {
    @Published var items: [InventoryItem] = []
    @Published var lowStockItems: [InventoryItem] = []
    @Published var searchText: String = ""
    @Published var selectedCategory: String = "all"
    @Published var showLowStockOnly: Bool = false
    
    private let modelContext: ModelContext
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        fetchItems()
    }
    
    func fetchItems() {
        let descriptor = FetchDescriptor<InventoryItem>(
            sortBy: [SortDescriptor(\.name)]
        )
        
        do {
            items = try modelContext.fetch(descriptor)
            updateLowStockItems()
        } catch {
            print("Failed to fetch items: \(error)")
        }
    }
    
    func updateLowStockItems() {
        lowStockItems = items.filter { $0.isLowStock }
    }
    
    func addItem(_ item: InventoryItem) {
        modelContext.insert(item)
        try? modelContext.save()
        fetchItems()
    }
    
    func updateItem(_ item: InventoryItem) {
        item.lastUpdated = Date()
        try? modelContext.save()
        fetchItems()
    }
    
    func deleteItem(_ item: InventoryItem) {
        modelContext.delete(item)
        try? modelContext.save()
        fetchItems()
    }
    
    var filteredItems: [InventoryItem] {
        var result = items
        
        // 搜索过滤
        if !searchText.isEmpty {
            result = result.filter { 
                $0.name.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        // 类别过滤
        if selectedCategory != "all" {
            result = result.filter { $0.category == selectedCategory }
        }
        
        // 低库存过滤
        if showLowStockOnly {
            result = result.filter { $0.isLowStock }
        }
        
        // 排序：低库存优先
        return result.sorted { item1, item2 in
            if item1.isLowStock && !item2.isLowStock {
                return true
            } else if !item1.isLowStock && item2.isLowStock {
                return false
            } else if item1.isLowStock && item2.isLowStock {
                return item1.quantity < item2.quantity
            } else {
                return item1.name < item2.name
            }
        }
    }
    
    var statistics: (total: Int, lowStock: Int) {
        (items.count, lowStockItems.count)
    }
}
```

---

## 📊 报告生成算法

### 采购清单生成器
```swift
class PurchaseListGenerator {
    static func generateMarkdown(
        items: [InventoryItem],
        language: String = "zh"
    ) -> String {
        let locale = Locale(identifier: localeIdentifier(for: language))
        let dateFormatter = DateFormatter()
        dateFormatter.locale = locale
        dateFormatter.dateStyle = .full
        
        let today = Date()
        let dateString = dateFormatter.string(from: today)
        
        let texts = getTexts(for: language)
        
        var markdown = """
        # ☕️ \(texts.title)
        
        📅 **\(texts.generatedDate)**: \(dateString)
        
        ---
        
        """
        
        if items.isEmpty {
            markdown += """
            ✅ **\(texts.noNeed)**
            
            """
            return markdown
        }
        
        markdown += """
        ## 📦 \(texts.needRestock)
        
        \(texts.belowThreshold)
        
        | \(texts.productName) | \(texts.currentStock) | \(texts.unit) | \(texts.safetyStock) | \(texts.suggestedQty) | \(texts.category) |
        |---------|---------|------|---------|-----------|------|
        
        """
        
        for item in items {
            let categoryLabel = getCategoryLabel(item.category, language: language)
            let unitLabel = getUnitLabel(item.unit, language: language)
            let suggested = item.suggestedPurchaseQuantity
            
            markdown += """
            | \(getCategoryEmoji(item.category)) \(item.name) | \(formatNumber(item.quantity)) | \(unitLabel) | \(formatNumber(item.threshold)) | **\(formatNumber(suggested))** | \(categoryLabel) |
            
            """
        }
        
        // 汇总
        let categories = Dictionary(grouping: items, by: { $0.category })
        
        markdown += """
        
        ---
        
        ## 📊 \(texts.summary)
        
        - 📌 \(texts.itemsNeed): **\(items.count)** \(texts.items)
        - 🔴 \(texts.lowStock): **\(items.count)** \(texts.items)
        
        """
        
        // 分类汇总
        if categories.count > 1 {
            markdown += """
            
            ## 📦 \(texts.categorySummary)
            
            """
            
            for (category, categoryItems) in categories.sorted(by: { $0.key < $1.key }) {
                let categoryLabel = getCategoryLabel(category, language: language)
                markdown += """
                
                ### \(getCategoryEmoji(category)) \(categoryLabel)
                - \(texts.current): \(categoryItems.count) \(texts.items)
                
                """
            }
        }
        
        // 备注
        markdown += """
        
        ---
        
        ## 📝 \(texts.notes)
        
        - ⚠️ \(texts.completeThisWeek)
        - 📞 \(texts.contactSupplier)
        - ✅ \(texts.updateSystem)
        
        ---
        
        *\(texts.autoGenerated)*
        
        """
        
        return markdown
    }
    
    private static func localeIdentifier(for language: String) -> String {
        switch language {
        case "zh": return "zh_CN"
        case "ja": return "ja_JP"
        case "en": return "en_US"
        default: return "zh_CN"
        }
    }
    
    private static func formatNumber(_ number: Double) -> String {
        let formatter = NumberFormatter()
        formatter.minimumFractionDigits = 0
        formatter.maximumFractionDigits = 2
        return formatter.string(from: NSNumber(value: number)) ?? "\(number)"
    }
    
    private static func getCategoryEmoji(_ category: String) -> String {
        switch category {
        case "ingredients": return "🌱"
        case "supplies": return "📦"
        case "cleaning": return "🧹"
        case "equipment": return "🔧"
        default: return "📋"
        }
    }
    
    // 获取翻译文本
    private static func getTexts(for language: String) -> (
        title: String,
        generatedDate: String,
        noNeed: String,
        needRestock: String,
        belowThreshold: String,
        productName: String,
        currentStock: String,
        unit: String,
        safetyStock: String,
        suggestedQty: String,
        category: String,
        summary: String,
        itemsNeed: String,
        items: String,
        lowStock: String,
        categorySummary: String,
        current: String,
        notes: String,
        completeThisWeek: String,
        contactSupplier: String,
        updateSystem: String,
        autoGenerated: String
    ) {
        switch language {
        case "zh":
            return (
                "每周采购清单", "生成日期", "库存充足，本周无需采购！",
                "需要补充的商品", "以下商品库存已低于阈值，请及时采购",
                "商品名称", "当前库存", "单位", "安全库存", "建议采购量", "类别",
                "采购汇总", "需采购商品数量", "项", "低库存警告", "分类汇总", "当前",
                "备注", "请在本周内完成采购", "如有问题，请联系供应商",
                "采购完成后，请及时更新库存系统", "由咖啡店管理系统自动生成"
            )
        case "ja":
            return (
                "週次購入リスト", "生成日", "在庫十分、今週の購入不要！",
                "補充が必要な商品", "以下の商品は在庫が閾値を下回っています。速やかに購入してください",
                "商品名", "現在在庫", "単位", "安全在庫", "推奨購入量", "カテゴリー",
                "購入サマリー", "購入必要商品数", "件", "在庫不足警告", "カテゴリー別サマリー", "現在",
                "備考", "今週中に購入を完了してください", "問題がある場合はサプライヤーに連絡してください",
                "購入完了後、速やかに在庫システムを更新してください", "カフェ管理システムにより自動生成"
            )
        case "en":
            return (
                "Weekly Purchase List", "Generated Date", "Stock is sufficient, no purchase needed!",
                "Items Needing Restock", "The following items are below threshold. Please purchase promptly",
                "Product Name", "Current Stock", "Unit", "Safety Stock", "Suggested Quantity", "Category",
                "Purchase Summary", "Items Needing Purchase", "items", "Low Stock Warning", "Category Summary", "Current",
                "Notes", "Please complete purchase within this week", "Contact supplier if there are any issues",
                "Update inventory system after purchase completion", "Auto-generated by Coffee Shop Management System"
            )
        default:
            return getTexts(for: "zh")
        }
    }
    
    private static func getCategoryLabel(_ category: String, language: String) -> String {
        // 实现类别翻译
        // ...
        return category
    }
    
    private static func getUnitLabel(_ unit: String, language: String) -> String {
        // 实现单位翻译
        // ...
        return unit
    }
}
```

---

## 🎨 SwiftUI 组件示例

### 统计卡片组件
```swift
struct StatsCardView: View {
    let title: String
    let value: String
    let subtitle: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Text(value)
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(color)
            
            Text(subtitle)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
    }
}
```

### 商品卡片组件
```swift
struct InventoryItemCard: View {
    let item: InventoryItem
    let onEdit: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(getCategoryEmoji(item.category) + " " + item.name)
                        .font(.headline)
                    
                    Text(getCategoryLabel(item.category))
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(8)
                }
                
                Spacer()
                
                Menu {
                    Button {
                        onEdit()
                    } label: {
                        Label("编辑", systemImage: "pencil")
                    }
                    
                    Button(role: .destructive) {
                        onDelete()
                    } label: {
                        Label("删除", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .foregroundColor(.secondary)
                }
            }
            
            Divider()
            
            HStack {
                VStack(alignment: .leading) {
                    Text("当前库存")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(formatNumber(item.quantity)) \(getUnitLabel(item.unit))")
                        .font(.body)
                        .fontWeight(.semibold)
                        .foregroundColor(item.isLowStock ? .red : .primary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text("安全库存")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(formatNumber(item.threshold)) \(getUnitLabel(item.unit))")
                        .font(.body)
                        .foregroundColor(.secondary)
                }
            }
            
            if item.isLowStock {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.red)
                    Text("库存不足")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.red)
                    Spacer()
                    Text("建议采购: \(formatNumber(item.suggestedPurchaseQuantity)) \(getUnitLabel(item.unit))")
                        .font(.caption)
                        .foregroundColor(.green)
                        .fontWeight(.medium)
                }
                .padding(8)
                .background(Color.red.opacity(0.1))
                .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(item.isLowStock ? Color.red : Color.clear, lineWidth: 2)
        )
        .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
    }
}
```

---

## 🌐 本地化字符串示例

### zh-Hans.strings (简体中文)
```
/* Tab Bar */
"tab.inventory" = "库存";
"tab.employees" = "员工";
"tab.attendance" = "考勤";
"tab.reports" = "报告";
"tab.settings" = "设置";

/* Inventory */
"inventory.title" = "库存管理";
"inventory.addProduct" = "添加商品";
"inventory.totalItems" = "商品总数";
"inventory.lowStock" = "低库存";
"inventory.search" = "搜索商品...";

/* Employee */
"employee.title" = "员工管理";
"employee.addEmployee" = "添加员工";
"employee.totalEmployees" = "员工总数";
"employee.totalSalary" = "总工资";

/* Units */
"unit.kg" = "千克";
"unit.liter" = "升";
"unit.bottle" = "瓶";
"unit.piece" = "个";
"unit.pack" = "包";

/* Positions */
"position.manager" = "店长";
"position.barista" = "咖啡师";
"position.partTime" = "兼职";
"position.intern" = "实习生";

/* Categories */
"category.ingredients" = "原料";
"category.supplies" = "耗材";
"category.cleaning" = "清洁";
"category.equipment" = "设备";
"category.other" = "其他";

/* Common */
"common.save" = "保存";
"common.cancel" = "取消";
"common.delete" = "删除";
"common.edit" = "编辑";
"common.confirm" = "确认";
```

---

## 📱 数据导入导出格式

### JSON 导出格式
```json
{
  "version": "1.0.0",
  "exportDate": "2026-02-05T10:30:00Z",
  "appVersion": "1.0.0",
  "data": {
    "inventory": [
      {
        "id": "uuid-string",
        "name": "咖啡豆 - 哥伦比亚",
        "quantity": 2.0,
        "unit": "kg",
        "threshold": 5.0,
        "category": "ingredients",
        "imageUrl": null,
        "lastUpdated": "2026-02-05T10:00:00Z"
      }
    ],
    "employees": [
      {
        "id": "uuid-string",
        "name": "张经理",
        "position": "manager",
        "hourlyRate": 30.0,
        "dailyTransportAllowance": 20.0,
        "phone": "138-0000-0001",
        "email": "zhang@example.com",
        "hireDate": "2025-01-01T00:00:00Z"
      }
    ],
    "attendance": [
      {
        "id": "uuid-string",
        "employeeId": "uuid-string",
        "employeeName": "张经理",
        "date": "2026-02-05T00:00:00Z",
        "clockIn": "09:00",
        "clockOut": "18:00",
        "hoursWorked": 9.0,
        "notes": "正常出勤"
      }
    ]
  }
}
```

---

## 🔐 安全建议

### 数据加密
```swift
import CryptoKit

class DataEncryption {
    static func encryptData(_ data: Data, key: SymmetricKey) throws -> Data {
        let sealedBox = try AES.GCM.seal(data, using: key)
        return sealedBox.combined!
    }
    
    static func decryptData(_ data: Data, key: SymmetricKey) throws -> Data {
        let sealedBox = try AES.GCM.SealedBox(combined: data)
        return try AES.GCM.open(sealedBox, using: key)
    }
}
```

---

## ⚡️ 性能优化建议

### 1. 数据库查询优化
- 使用索引 (@Attribute(.unique))
- 批量操作使用事务
- 分页加载大量数据

### 2. UI 性能
- 使用 LazyVStack/LazyHStack
- 图片缓存
- 避免复杂计算在主线程

### 3. 内存管理
- 及时释放大对象
- 使用 @StateObject/@ObservedObject 正确管理生命周期
- 避免循环引用

---

## 🧪 单元测试示例

```swift
import XCTest
@testable import CoffeeShopManager

class AttendanceTests: XCTestCase {
    func testCalculateHours() {
        // 正常工作时间
        let hours1 = AttendanceRecord.calculateHours(from: "09:00", to: "18:00")
        XCTAssertEqual(hours1, 9.0)
        
        // 半天
        let hours2 = AttendanceRecord.calculateHours(from: "09:00", to: "13:30")
        XCTAssertEqual(hours2, 4.5)
        
        // 跨天
        let hours3 = AttendanceRecord.calculateHours(from: "23:00", to: "02:00")
        XCTAssertEqual(hours3, 3.0)
    }
    
    func testMonthlySalary() {
        let employee = Employee(
            name: "Test",
            position: "barista",
            hourlyRate: 25.0,
            dailyTransportAllowance: 15.0
        )
        
        // 假设本月工作 20 天，共 160 小时
        // 工资 = 160 * 25 + 20 * 15 = 4000 + 300 = 4300
        // 实际测试需要创建考勤记录
    }
}
```

---

## 📚 第三方库推荐

### 1. 网络请求（如需云同步）
```swift
// Alamofire
dependencies: [
    .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0")
]
```

### 2. JSON 解析增强
```swift
// SwiftyJSON (可选)
dependencies: [
    .package(url: "https://github.com/SwiftyJSON/SwiftyJSON.git", from: "5.0.0")
]
```

### 3. Markdown 渲染
```swift
// MarkdownUI
dependencies: [
    .package(url: "https://github.com/gonzalezreal/MarkdownUI", from: "2.0.0")
]
```

---

## 🎯 持续集成/部署

### Fastlane 配置示例
```ruby
# Fastfile
default_platform(:ios)

platform :ios do
  desc "Run tests"
  lane :test do
    scan(scheme: "CoffeeShopManager")
  end
  
  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number
    build_app(scheme: "CoffeeShopManager")
    upload_to_testflight
  end
end
```

---

**文档版本**: 1.0  
**最后更新**: 2026年2月5日  

