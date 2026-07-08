import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IndexedDB for tests
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  databases: vi.fn(),
};

Object.defineProperty(globalThis, 'indexedDB', {
  value: indexedDB,
  writable: true,
});

window.alert = vi.fn();
window.confirm = vi.fn(() => true);
