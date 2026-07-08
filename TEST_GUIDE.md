# 📋 测试指南

## 测试框架

本项目使用以下测试工具：
- **Vitest** - 快速的单元测试框架（与 Vite 完美集成）
- **React Testing Library** - React 组件测试
- **jsdom** - 浏览器环境模拟

## 安装依赖

```bash
npm install
```

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行测试（UI 模式）
```bash
npm run test:ui
```
这将打开一个可视化界面，可以查看测试结果和覆盖率

### 生成测试覆盖率报告
```bash
npm run test:coverage
```
覆盖率报告将生成在 `coverage` 文件夹中

### 监视模式（开发时使用）
```bash
npm test -- --watch
```

### 运行特定测试文件
```bash
npm test -- db.test.ts
```

## 测试文件结构

```
src/
├── test/
│   └── setup.ts              # 测试环境配置
├── utils/
│   ├── db.test.ts            # 数据库工具函数测试
│   └── sampleData.test.ts    # 示例数据测试
└── components/
    ├── Button.test.tsx       # Button 组件测试
    └── Input.test.tsx        # Input/Select 组件测试
```

## 测试覆盖内容

### ✅ 工具函数测试 (`db.test.ts`)
- `calculateHours()` - 计算工时函数
  - 正常工时计算
  - 跨午夜工时计算
  - 分钟处理
  - 边界情况

### ✅ 示例数据测试 (`sampleData.test.ts`)
- 多语言数据生成（中/日/英）
- 数据结构验证
- 字段类型检查
- 键值规范验证

### ✅ 组件测试 (`Button.test.tsx`)
- 渲染测试
- 点击事件
- 样式变体（primary/secondary/danger）
- 禁用状态
- 尺寸选项

### ✅ 表单组件测试 (`Input.test.tsx`)
- Input 组件
  - 基本渲染
  - 标签显示
  - 输入事件
  - 错误提示
  - 类型支持
- Select 组件
  - 选项渲染
  - 选择事件
  - 默认值

## 测试统计

当前测试数量：**30+ 测试用例**

测试文件：
- `db.test.ts` - 7 个测试
- `sampleData.test.ts` - 9 个测试
- `Button.test.tsx` - 8 个测试
- `Input.test.tsx` - 9 个测试

## 添加新测试

### 1. 创建测试文件
在要测试的文件同目录下创建 `.test.ts` 或 `.test.tsx` 文件

### 2. 编写测试
```typescript
import { describe, it, expect } from 'vitest';

describe('功能描述', () => {
  it('应该做某事', () => {
    // 测试代码
    expect(result).toBe(expected);
  });
});
```

### 3. 组件测试示例
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

describe('MyComponent', () => {
  it('应该渲染', () => {
    render(<MyComponent />);
    expect(screen.getByText('内容')).toBeInTheDocument();
  });
});
```

## Mock 配置

测试环境已配置以下 Mock：
- `indexedDB` - IndexedDB API
- `window.alert` - 警告框
- `window.confirm` - 确认框

## 持续集成

建议在 CI/CD 流程中添加测试步骤：

```yaml
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```

## 最佳实践

1. ✅ 每个函数/组件都应该有测试
2. ✅ 测试应该独立且可重复
3. ✅ 使用描述性的测试名称
4. ✅ 测试边界情况和错误处理
5. ✅ 保持测试简单明了
6. ✅ 定期运行测试确保代码质量

## 测试报告

运行测试后，您将看到类似输出：

```
✓ src/utils/db.test.ts (7 tests)
✓ src/utils/sampleData.test.ts (9 tests)
✓ src/components/Button.test.tsx (8 tests)
✓ src/components/Input.test.tsx (9 tests)

Test Files  4 passed (4)
     Tests  33 passed (33)
  Start at  14:30:00
  Duration  1.23s
```

## 故障排查

### 测试失败
1. 检查错误消息
2. 运行 `npm run test:ui` 查看详细信息
3. 确保所有依赖已安装

### 覆盖率低
1. 运行 `npm run test:coverage` 查看详细覆盖率
2. 为未覆盖的代码添加测试

## 相关资源

- [Vitest 文档](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)
