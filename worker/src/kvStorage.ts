import type { AppData } from '../../shared/types';
import { AppError } from '../../shared/types';
import type { DataStore } from '../../shared/storage';
import { createEmptyAppData } from '../../shared/storage';

const KEY = 'app-data';

export function createKvStore(kv: KVNamespace): DataStore {
  return {
    async readAppData(): Promise<AppData> {
      const raw = await kv.get(KEY);
      if (!raw) {
        const initial = createEmptyAppData();
        await kv.put(KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw) as AppData;
    },

    async updateAppData(updater): Promise<AppData> {
      const maxAttempts = 5;
      let lastError: unknown;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const current = await this.readAppData();
          const before = JSON.stringify(current);
          const next = await updater(structuredClone(current));
          const after = JSON.stringify(next);
          if (before === after) {
            return next;
          }
          await kv.put(KEY, after);
          return next;
        } catch (error) {
          if (error instanceof AppError) throw error;
          lastError = error;
          await new Promise((r) => setTimeout(r, 20 * (attempt + 1)));
        }
      }

      throw lastError instanceof Error
        ? lastError
        : new Error('KV update failed');
    },
  };
}
