import Dexie, { Table } from 'dexie';

// 库存商品接口
export interface InventoryItem {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  category: string;
  imageUrl?: string;
  lastUpdated: Date;
}

// 员工接口
export interface Employee {
  id?: number;
  name: string;
  position: string;
  hourlyRate: number;
  hoursWorked: number;
  dailyTransportAllowance?: number; // 每日交通费
  phone?: string;
  email?: string;
  hireDate: Date;
}

// 考勤记录接口
export interface AttendanceRecord {
  id?: number;
  employeeId: number;
  employeeName: string;
  date: Date;
  clockIn: string;  // 格式: "HH:mm" 如 "09:00"
  clockOut: string; // 格式: "HH:mm" 如 "18:00"
  hoursWorked: number;
  notes?: string;
}

// 数据库类
export class CoffeeShopDB extends Dexie {
  inventory!: Table<InventoryItem>;
  employees!: Table<Employee>;
  attendance!: Table<AttendanceRecord>;

  constructor() {
    super('CoffeeShopDB');
    this.version(2).stores({
      inventory: '++id, name, category, quantity, threshold',
      employees: '++id, name, position',
      attendance: '++id, employeeId, date',
    });
    // Version 3: Added dailyTransportAllowance to employees
    this.version(3).stores({
      inventory: '++id, name, category, quantity, threshold',
      employees: '++id, name, position',
      attendance: '++id, employeeId, date',
    });
  }
}

// 创建数据库实例
export const db = new CoffeeShopDB();

// ========== 库存管理函数 ==========

// 获取所有库存
export const getAllInventory = async (): Promise<InventoryItem[]> => {
  return await db.inventory.toArray();
};

// 添加库存商品
export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<number> => {
  return (await db.inventory.add(item)) as number;
};

// 更新库存商品
export const updateInventoryItem = async (id: number, updates: Partial<InventoryItem>): Promise<number> => {
  return await db.inventory.update(id, { ...updates, lastUpdated: new Date() });
};

// 删除库存商品
export const deleteInventoryItem = async (id: number): Promise<void> => {
  await db.inventory.delete(id);
};

// 获取低库存商品
export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  const allItems = await db.inventory.toArray();
  return allItems.filter(item => item.quantity <= item.threshold);
};

// ========== 员工管理函数 ==========

// 获取所有员工
export const getAllEmployees = async (): Promise<Employee[]> => {
  return await db.employees.toArray();
};

// 添加员工
export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<number> => {
  return (await db.employees.add(employee)) as number;
};

// 更新员工信息
export const updateEmployee = async (id: number, updates: Partial<Employee>): Promise<number> => {
  return await db.employees.update(id, updates);
};

// 删除员工
export const deleteEmployee = async (id: number): Promise<void> => {
  await db.employees.delete(id);
};

// 计算员工工资
export const calculateSalary = (employee: Employee): number => {
  return employee.hourlyRate * employee.hoursWorked;
};

// ========== 考勤管理函数 ==========

// 获取所有考勤记录
export const getAllAttendance = async (): Promise<AttendanceRecord[]> => {
  return await db.attendance.orderBy('date').reverse().toArray();
};

// 获取指定员工的考勤记录
export const getEmployeeAttendance = async (employeeId: number): Promise<AttendanceRecord[]> => {
  return await db.attendance.where('employeeId').equals(employeeId).toArray();
};

// 获取指定日期范围的考勤记录
export const getAttendanceByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<AttendanceRecord[]> => {
  const allRecords = await db.attendance.toArray();
  return allRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= startDate && recordDate <= endDate;
  });
};

// 添加考勤记录
export const addAttendance = async (attendance: Omit<AttendanceRecord, 'id'>): Promise<number> => {
  return (await db.attendance.add(attendance)) as number;
};

// 更新考勤记录
export const updateAttendance = async (id: number, updates: Partial<AttendanceRecord>): Promise<number> => {
  return await db.attendance.update(id, updates);
};

// 删除考勤记录
export const deleteAttendance = async (id: number): Promise<void> => {
  await db.attendance.delete(id);
};

// 计算两个时间之间的工时
export const calculateHours = (clockIn: string, clockOut: string): number => {
  const [inHour, inMin] = clockIn.split(':').map(Number);
  const [outHour, outMin] = clockOut.split(':').map(Number);
  
  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;
  
  let diff = outMinutes - inMinutes;
  if (diff < 0) diff += 24 * 60; // 跨天处理
  
  return Math.round((diff / 60) * 100) / 100; // 保留两位小数
};

// 获取员工月度工时统计
export const getMonthlyHours = async (employeeId: number, year: number, month: number): Promise<number> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const records = await getAttendanceByDateRange(startDate, endDate);
  const employeeRecords = records.filter(r => r.employeeId === employeeId);
  
  return employeeRecords.reduce((sum, record) => sum + record.hoursWorked, 0);
};

// 获取员工月度工作天数
export const getMonthlyWorkDays = async (employeeId: number, year: number, month: number): Promise<number> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const records = await getAttendanceByDateRange(startDate, endDate);
  const employeeRecords = records.filter(r => r.employeeId === employeeId);
  
  return employeeRecords.length; // 考勤记录数 = 工作天数
};

// 获取所有员工的月度工资统计
export const getMonthlyPayroll = async (year: number, month: number) => {
  const employees = await getAllEmployees();
  const payroll = [];
  
  for (const employee of employees) {
    const hours = await getMonthlyHours(employee.id!, year, month);
    const workDays = await getMonthlyWorkDays(employee.id!, year, month);
    const hourlyWage = hours * employee.hourlyRate;
    const transportAllowance = workDays * (employee.dailyTransportAllowance || 0);
    const salary = hourlyWage + transportAllowance;
    
    payroll.push({
      employee,
      hours,
      workDays,
      hourlyWage,
      transportAllowance,
      salary,
    });
  }
  
  return payroll;
};

// ========== 初始化示例数据 ==========

import { getSampleData } from './sampleData';

export const initializeSampleData = async (language: 'zh' | 'ja' | 'en' = 'zh') => {
  // 检查用户是否主动清除过数据
  const userClearedData = localStorage.getItem('userClearedData');
  if (userClearedData === 'true') {
    // 如果用户主动清除过数据，不再自动初始化
    return;
  }
  
  // 检查是否已有数据
  const inventoryCount = await db.inventory.count();
  const employeeCount = await db.employees.count();
  
  // 获取对应语言的示例数据
  const sampleData = getSampleData(language);

  if (inventoryCount === 0) {
    // 添加示例库存数据（使用对应语言）
    const inventoryData = sampleData.inventory.map((item, index) => ({
      name: item.name,
      quantity: item.qty,
      unit: item.unit,
      threshold: item.threshold,
      category: item.category,
      imageUrl: `https://images.unsplash.com/photo-${['1559056199-641a0ac8b55e', '1447933601403-0c6688de566e', '1550583724-b2692b85b150', '1571091718767-18b5b1457add', '1514228742587-6b1558fcca3d', '1509042239860-f550ce710b93', '1625772452859-1c03d5bf1137', '1563453392212-326f5e854473'][index]}?w=400`,
      lastUpdated: new Date(),
    }));
    await db.inventory.bulkAdd(inventoryData);
  }

  if (employeeCount === 0) {
    // 添加示例员工数据（使用对应语言）
    const employeeData = sampleData.employees.map((item, index) => ({
      name: item.name,
      position: item.position,
      hourlyRate: item.rate,
      hoursWorked: [160, 140, 120, 60][index],
      dailyTransportAllowance: [20, 15, 15, 10][index], // 店长20，咖啡师15，兼职10
      phone: `${language === 'en' ? '+1-555-000' : '138-0000'}-${String(index + 1).padStart(4, '0')}`,
      email: `${item.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      hireDate: new Date(['2023-01-15', '2023-03-20', '2023-06-10', '2024-01-05'][index]),
    }));
    const employeeIds = await db.employees.bulkAdd(employeeData, { allKeys: true });
    
    // 添加示例考勤数据（最近7天）
    const attendanceCount = await db.attendance.count();
    if (attendanceCount === 0 && employeeIds.length > 0) {
      const attendanceRecords: Omit<AttendanceRecord, 'id'>[] = [];
      const today = new Date();
      
      // 为每个员工添加最近7天的考勤
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // 第一位员工 - 店长/经理（全勤）
        attendanceRecords.push({
          employeeId: employeeIds[0] as number,
          employeeName: sampleData.employees[0].name,
          date: new Date(date),
          clockIn: '09:00',
          clockOut: '18:00',
          hoursWorked: 9,
          notes: language === 'zh' ? '正常出勤' : language === 'ja' ? '通常勤務' : 'Regular shift',
        });
        
        // 第二位员工 - 咖啡师（早班）
        attendanceRecords.push({
          employeeId: employeeIds[1] as number,
          employeeName: sampleData.employees[1].name,
          date: new Date(date),
          clockIn: '08:00',
          clockOut: '16:00',
          hoursWorked: 8,
        });
        
        // 第三位员工 - 咖啡师（晚班）
        if (i % 2 === 0) { // 隔天上班
          attendanceRecords.push({
            employeeId: employeeIds[2] as number,
            employeeName: sampleData.employees[2].name,
            date: new Date(date),
            clockIn: '14:00',
            clockOut: '22:00',
            hoursWorked: 8,
          });
        }
        
        // 第四位员工 - 兼职（周末）
        if (date.getDay() === 0 || date.getDay() === 6) {
          attendanceRecords.push({
            employeeId: employeeIds[3] as number,
            employeeName: sampleData.employees[3].name,
            date: new Date(date),
            clockIn: '10:00',
            clockOut: '18:00',
            hoursWorked: 8,
            notes: language === 'zh' ? '周末兼职' : language === 'ja' ? '週末パート' : 'Weekend shift',
          });
        }
      }
      
      await db.attendance.bulkAdd(attendanceRecords);
    }
  }
};

