import type { AppData } from './types';

export interface DataStore {
  readAppData(): Promise<AppData>;
  updateAppData(
    updater: (data: AppData) => AppData | Promise<AppData>,
  ): Promise<AppData>;
}

let bound: DataStore | null = null;

export function bindStore(store: DataStore): void {
  bound = store;
}

function requireStore(): DataStore {
  if (!bound) {
    throw new Error('DataStore is not bound');
  }
  return bound;
}

export async function readAppData(): Promise<AppData> {
  return requireStore().readAppData();
}

export async function updateAppData(
  updater: (data: AppData) => AppData | Promise<AppData>,
): Promise<AppData> {
  return requireStore().updateAppData(updater);
}

export function createEmptyAppData(): AppData {
  return {
    settings: {
      bossPin: '2468',
      staffPin: '1234',
    },
    inventory: [],
    employees: [],
    attendance: [],
    updatedAt: new Date().toISOString(),
  };
}
