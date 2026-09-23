import { describe, expect, it } from 'vitest';
import { calculateHours } from './domainService';
import { createEmptyAppData } from './storage';
import { dedupeAppData } from './dedupe';

describe('shared domain', () => {
  it('calculates hours across midnight', () => {
    expect(calculateHours('22:00', '02:00')).toBe(4);
  });

  it('creates empty app data with default pins', () => {
    const data = createEmptyAppData();
    expect(data.settings.bossPin).toBe('2468');
    expect(data.settings.staffPin).toBe('1234');
    expect(data.inventory).toEqual([]);
  });

  it('dedupes employees with the same name', () => {
    const data = createEmptyAppData();
    data.employees = [
      {
        id: 1,
        name: 'Alice',
        position: 'manager',
        hourlyRate: 20,
        hoursWorked: 0,
        hireDate: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 5,
        name: 'Alice',
        position: 'manager',
        hourlyRate: 20,
        hoursWorked: 0,
        hireDate: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        name: 'Bob',
        position: 'barista',
        hourlyRate: 15,
        hoursWorked: 0,
        hireDate: '2023-01-01T00:00:00.000Z',
      },
    ];
    data.attendance = [
      {
        id: 1,
        employeeId: 5,
        employeeName: 'Alice',
        date: '2026-01-01T12:00:00.000Z',
        clockIn: '09:00',
        clockOut: '18:00',
        hoursWorked: 9,
      },
      {
        id: 2,
        employeeId: 1,
        employeeName: 'Alice',
        date: '2026-01-01T12:00:00.000Z',
        clockIn: '09:00',
        clockOut: '18:00',
        hoursWorked: 9,
      },
    ];
    const cleaned = dedupeAppData(data);
    expect(cleaned.employees.map((e) => e.name)).toEqual(['Alice', 'Bob']);
    expect(cleaned.attendance).toHaveLength(1);
    expect(cleaned.attendance[0].employeeId).toBe(1);
  });
});
