import { AppError, type AppData, type AttendanceRecordData, type AuthRole, type EmployeeData, type InventoryItemData } from './types';
import { createEmptyAppData, readAppData, updateAppData } from './storage';
import { dedupeAppData } from './dedupe';

function nextId(items: { id: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.id)) + 1;
}

function touch(data: AppData): AppData {
  return { ...data, updatedAt: new Date().toISOString() };
}

export async function verifyPin(role: AuthRole, pin: string): Promise<boolean> {
  const data = await readAppData();
  if (role === 'boss') return data.settings.bossPin === pin;
  return data.settings.staffPin === pin;
}

export async function getData(): Promise<AppData> {
  const data = await readAppData();
  const cleaned = dedupeAppData(data);
  if (
    cleaned.employees.length !== data.employees.length ||
    cleaned.inventory.length !== data.inventory.length ||
    cleaned.attendance.length !== data.attendance.length
  ) {
    return updateAppData(() => touch(cleaned));
  }
  return cleaned;
}

export async function replaceData(incoming: AppData): Promise<AppData> {
  if (
    !incoming ||
    !incoming.settings ||
    !Array.isArray(incoming.inventory) ||
    !Array.isArray(incoming.employees) ||
    !Array.isArray(incoming.attendance)
  ) {
    throw new AppError('INVALID_REQUEST', 'Invalid backup format');
  }
  const cleaned = dedupeAppData(incoming);
  return updateAppData(() =>
    touch({
      settings: {
        bossPin: String(cleaned.settings.bossPin || '2468'),
        staffPin: String(cleaned.settings.staffPin || '1234'),
      },
      inventory: cleaned.inventory,
      employees: cleaned.employees,
      attendance: cleaned.attendance,
      updatedAt: cleaned.updatedAt || new Date().toISOString(),
    }),
  );
}

export async function patchSettings(
  partial: Partial<AppData['settings']>,
): Promise<AppData> {
  return updateAppData((data) =>
    touch({
      ...data,
      settings: {
        ...data.settings,
        ...partial,
      },
    }),
  );
}

export async function upsertInventory(
  items: InventoryItemData[],
): Promise<AppData> {
  return updateAppData((data) => {
    const byId = new Map(data.inventory.map((i) => [i.id, i]));
    for (const item of items) {
      byId.set(item.id, {
        ...item,
        lastUpdated: item.lastUpdated || new Date().toISOString(),
      });
    }
    return touch({
      ...data,
      inventory: Array.from(byId.values()),
    });
  });
}

export async function patchInventoryQuantities(
  updates: { id: number; quantity: number }[],
): Promise<AppData> {
  return updateAppData((data) => {
    const now = new Date().toISOString();
    const inventory = data.inventory.map((item) => {
      const u = updates.find((x) => x.id === item.id);
      if (!u) return item;
      return { ...item, quantity: u.quantity, lastUpdated: now };
    });
    return touch({ ...data, inventory });
  });
}

export async function addInventoryItem(
  item: Omit<InventoryItemData, 'id' | 'lastUpdated'> & { lastUpdated?: string },
): Promise<AppData> {
  return updateAppData((data) => {
    const id = nextId(data.inventory);
    const row: InventoryItemData = {
      ...item,
      id,
      lastUpdated: item.lastUpdated || new Date().toISOString(),
    };
    return touch({ ...data, inventory: [...data.inventory, row] });
  });
}

export async function deleteInventoryItem(id: number): Promise<AppData> {
  return updateAppData((data) =>
    touch({
      ...data,
      inventory: data.inventory.filter((i) => i.id !== id),
    }),
  );
}

export async function upsertEmployees(employees: EmployeeData[]): Promise<AppData> {
  return updateAppData((data) => {
    const byId = new Map(data.employees.map((e) => [e.id, e]));
    for (const emp of employees) {
      byId.set(emp.id, emp);
    }
    return touch({ ...data, employees: Array.from(byId.values()) });
  });
}

export async function addEmployee(
  employee: Omit<EmployeeData, 'id'>,
): Promise<AppData> {
  return updateAppData((data) => {
    const id = nextId(data.employees);
    return touch({
      ...data,
      employees: [...data.employees, { ...employee, id }],
    });
  });
}

export async function deleteEmployee(id: number): Promise<AppData> {
  return updateAppData((data) =>
    touch({
      ...data,
      employees: data.employees.filter((e) => e.id !== id),
      attendance: data.attendance.filter((a) => a.employeeId !== id),
    }),
  );
}

export function calculateHours(clockIn: string, clockOut: string): number {
  const [inHour, inMin] = clockIn.split(':').map(Number);
  const [outHour, outMin] = clockOut.split(':').map(Number);
  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;
  let diff = outMinutes - inMinutes;
  if (diff < 0) diff += 24 * 60;
  return Math.round((diff / 60) * 100) / 100;
}

export async function upsertAttendance(
  record: Omit<AttendanceRecordData, 'id'> & { id?: number },
): Promise<AppData> {
  return updateAppData((data) => {
    const hoursWorked =
      record.hoursWorked ||
      calculateHours(record.clockIn, record.clockOut);
    const day = record.date.slice(0, 10);

    if (record.id != null) {
      const attendance = data.attendance.map((a) =>
        a.id === record.id
          ? {
              ...a,
              employeeId: record.employeeId,
              employeeName: record.employeeName,
              date: record.date,
              clockIn: record.clockIn,
              clockOut: record.clockOut,
              hoursWorked,
              notes: record.notes,
            }
          : a,
      );
      return touch({ ...data, attendance });
    }

    // Same employee + same calendar day → update instead of creating a duplicate
    const existing = data.attendance.find(
      (a) => a.employeeId === record.employeeId && a.date.slice(0, 10) === day,
    );
    if (existing) {
      const attendance = data.attendance.map((a) =>
        a.id === existing.id
          ? {
              ...a,
              employeeName: record.employeeName,
              date: record.date,
              clockIn: record.clockIn,
              clockOut: record.clockOut,
              hoursWorked,
              notes: record.notes,
            }
          : a,
      );
      return touch({ ...data, attendance });
    }

    const id = nextId(data.attendance);
    const row: AttendanceRecordData = {
      id,
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      date: record.date,
      clockIn: record.clockIn,
      clockOut: record.clockOut,
      hoursWorked,
      notes: record.notes,
    };
    return touch({ ...data, attendance: [...data.attendance, row] });
  });
}

export async function deleteAttendance(id: number): Promise<AppData> {
  return updateAppData((data) =>
    touch({
      ...data,
      attendance: data.attendance.filter((a) => a.id !== id),
    }),
  );
}

export async function ensureSeeded(): Promise<AppData> {
  const data = await readAppData();
  if (!data.settings?.bossPin) {
    return replaceData(createEmptyAppData());
  }
  return data;
}
