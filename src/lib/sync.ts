import type { AppData } from '../../shared/types';
import { dedupeAppData } from '../../shared/dedupe';
import {
  fetchCloudData,
  isCloudEnabled,
  pushCloudData,
} from './api';
import { db, type AttendanceRecord, type Employee, type InventoryItem } from '../utils/db';

function toIso(value: Date | string | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

export { dedupeAppData };

export async function exportLocalAsAppData(
  pins?: { bossPin?: string; staffPin?: string },
): Promise<AppData> {
  const [inventory, employees, attendance] = await Promise.all([
    db.inventory.toArray(),
    db.employees.toArray(),
    db.attendance.toArray(),
  ]);

  const raw: AppData = {
    settings: {
      bossPin: pins?.bossPin || '',
      staffPin: pins?.staffPin || '',
    },
    inventory: inventory.map((item) => ({
      id: item.id!,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      threshold: item.threshold,
      category: item.category,
      imageUrl: item.imageUrl,
      lastUpdated: toIso(item.lastUpdated),
    })),
    employees: employees.map((emp) => ({
      id: emp.id!,
      name: emp.name,
      position: emp.position,
      hourlyRate: emp.hourlyRate,
      hoursWorked: emp.hoursWorked,
      dailyTransportAllowance: emp.dailyTransportAllowance,
      phone: emp.phone,
      email: emp.email,
      hireDate: toIso(emp.hireDate),
    })),
    attendance: attendance.map((rec) => ({
      id: rec.id!,
      employeeId: rec.employeeId,
      employeeName: rec.employeeName,
      date: toIso(rec.date),
      clockIn: rec.clockIn,
      clockOut: rec.clockOut,
      hoursWorked: rec.hoursWorked,
      notes: rec.notes,
    })),
    updatedAt: new Date().toISOString(),
  };

  return dedupeAppData(raw);
}

export async function importAppDataToLocal(data: AppData): Promise<void> {
  const cleaned = dedupeAppData(data);

  const inventory: InventoryItem[] = cleaned.inventory.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    threshold: item.threshold,
    category: item.category,
    imageUrl: item.imageUrl,
    lastUpdated: new Date(item.lastUpdated),
  }));

  const employees: Employee[] = cleaned.employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    position: emp.position,
    hourlyRate: emp.hourlyRate,
    hoursWorked: emp.hoursWorked,
    dailyTransportAllowance: emp.dailyTransportAllowance,
    phone: emp.phone,
    email: emp.email,
    hireDate: new Date(emp.hireDate),
  }));

  const attendance: AttendanceRecord[] = cleaned.attendance.map((rec) => ({
    id: rec.id,
    employeeId: rec.employeeId,
    employeeName: rec.employeeName,
    date: new Date(rec.date),
    clockIn: rec.clockIn,
    clockOut: rec.clockOut,
    hoursWorked: rec.hoursWorked,
    notes: rec.notes,
  }));

  await db.transaction('rw', db.inventory, db.employees, db.attendance, async () => {
    await db.inventory.clear();
    await db.employees.clear();
    await db.attendance.clear();
    if (inventory.length) await db.inventory.bulkAdd(inventory);
    if (employees.length) await db.employees.bulkAdd(employees);
    if (attendance.length) await db.attendance.bulkAdd(attendance);
  });
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced push of local Dexie → Worker */
export function schedulePushToCloud(): void {
  if (!isCloudEnabled()) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void pushLocalToCloud().catch((err) =>
      console.warn('Cloud push failed', err),
    );
  }, 800);
}

export async function pushLocalToCloud(): Promise<AppData | null> {
  if (!isCloudEnabled()) return null;
  const data = await exportLocalAsAppData();
  return pushCloudData(data);
}

export async function pullCloudToLocal(): Promise<AppData | null> {
  if (!isCloudEnabled()) return null;
  const data = await fetchCloudData();
  const localCount =
    (await db.inventory.count()) +
    (await db.employees.count()) +
    (await db.attendance.count());
  const cloudCount =
    data.inventory.length + data.employees.length + data.attendance.length;

  if (cloudCount === 0 && localCount > 0) {
    return pushLocalToCloud();
  }

  await importAppDataToLocal(data);
  return dedupeAppData(data);
}
