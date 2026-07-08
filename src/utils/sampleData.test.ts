import { describe, it, expect } from 'vitest';
import { getSampleData } from './sampleData';

describe('示例数据测试', () => {
  it('应该返回中文示例数据', () => {
    const data = getSampleData('zh');
    
    expect(data).toBeDefined();
    expect(data.inventory).toBeInstanceOf(Array);
    expect(data.employees).toBeInstanceOf(Array);
    expect(data.inventory.length).toBeGreaterThan(0);
    expect(data.employees.length).toBe(4);
  });

  it('应该返回日语示例数据', () => {
    const data = getSampleData('ja');
    
    expect(data).toBeDefined();
    expect(data.inventory[0].name).toContain('コーヒー豆');
    expect(data.employees[0].name).toBe('田中太郎');
  });

  it('应该返回英语示例数据', () => {
    const data = getSampleData('en');
    
    expect(data).toBeDefined();
    expect(data.inventory[0].name).toContain('Coffee Beans');
    expect(data.employees[0].name).toBe('John Smith');
  });

  it('库存数据应该有正确的结构', () => {
    const data = getSampleData('zh');
    const item = data.inventory[0];
    
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('qty');
    expect(item).toHaveProperty('unit');
    expect(item).toHaveProperty('threshold');
    expect(item).toHaveProperty('category');
    expect(typeof item.qty).toBe('number');
    expect(typeof item.threshold).toBe('number');
  });

  it('员工数据应该有正确的结构', () => {
    const data = getSampleData('zh');
    const employee = data.employees[0];
    
    expect(employee).toHaveProperty('name');
    expect(employee).toHaveProperty('position');
    expect(employee).toHaveProperty('rate');
    expect(typeof employee.rate).toBe('number');
    expect(employee.rate).toBeGreaterThan(0);
  });

  it('所有员工职位应该使用英文键', () => {
    const data = getSampleData('zh');
    const validPositions = ['manager', 'barista', 'partTime', 'intern'];
    
    data.employees.forEach(emp => {
      expect(validPositions).toContain(emp.position);
    });
  });

  it('所有库存类别应该使用英文键', () => {
    const data = getSampleData('zh');
    const validCategories = ['ingredients', 'supplies', 'cleaning', 'equipment', 'other'];
    
    data.inventory.forEach(item => {
      expect(validCategories).toContain(item.category);
    });
  });

  it('默认应返回中文数据', () => {
    const data = getSampleData('invalid' as unknown as 'zh');
    expect(data.employees[0].name).toBe('李晓明');
  });
});
