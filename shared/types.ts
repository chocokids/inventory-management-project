export type ErrorCode =
  | 'INVALID_PIN'
  | 'UNAUTHORIZED'
  | 'INVALID_REQUEST'
  | 'NOT_FOUND'
  | 'SERVER_ERROR';

export class AppError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type AuthRole = 'boss' | 'staff';

/** ISO date strings for JSON / KV storage */
export interface InventoryItemData {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  category: string;
  imageUrl?: string;
  lastUpdated: string;
}

export interface EmployeeData {
  id: number;
  name: string;
  position: string;
  hourlyRate: number;
  hoursWorked: number;
  dailyTransportAllowance?: number;
  phone?: string;
  email?: string;
  hireDate: string;
}

export interface AttendanceRecordData {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: number;
  notes?: string;
}

export interface AppSettings {
  bossPin: string;
  staffPin: string;
}

export interface AppData {
  settings: AppSettings;
  inventory: InventoryItemData[];
  employees: EmployeeData[];
  attendance: AttendanceRecordData[];
  updatedAt: string;
}
