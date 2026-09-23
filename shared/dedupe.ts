import type {
  AppData,
  AttendanceRecordData,
  EmployeeData,
  InventoryItemData,
} from './types';

function dedupeByName<T extends { id: number; name: string }>(
  rows: T[],
): { rows: T[]; idMap: Map<number, number> } {
  const idMap = new Map<number, number>();
  const byName = new Map<string, T>();
  const sorted = [...rows].sort((a, b) => a.id - b.id);
  for (const row of sorted) {
    const existing = byName.get(row.name);
    if (existing) {
      idMap.set(row.id, existing.id);
    } else {
      byName.set(row.name, row);
      idMap.set(row.id, row.id);
    }
  }
  return { rows: Array.from(byName.values()), idMap };
}

function dedupeAttendance(
  attendance: AttendanceRecordData[],
  employeeIdMap: Map<number, number>,
): AttendanceRecordData[] {
  const seen = new Set<string>();
  const out: AttendanceRecordData[] = [];
  const sorted = [...attendance].sort((a, b) => a.id - b.id);
  for (const rec of sorted) {
    const employeeId = employeeIdMap.get(rec.employeeId) ?? rec.employeeId;
    const day = rec.date.slice(0, 10);
    const key = `${employeeId}|${day}|${rec.clockIn}|${rec.clockOut}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...rec, employeeId });
  }
  return out;
}

/** Collapse duplicate sample/sync rows (same name → keep lowest id). */
export function dedupeAppData(data: AppData): AppData {
  const inventory = dedupeByName<InventoryItemData>(data.inventory).rows;
  const { rows: employees, idMap } = dedupeByName<EmployeeData>(data.employees);
  const attendance = dedupeAttendance(data.attendance, idMap);
  return {
    ...data,
    inventory,
    employees,
    attendance,
  };
}
