import type { AuthRole } from '../../shared/types';

const BOSS_KEY = 'inventory:boss-auth';
const STAFF_KEY = 'inventory:staff-auth';

function keyFor(role: AuthRole): string {
  return role === 'boss' ? BOSS_KEY : STAFF_KEY;
}

export function isAuthenticated(role: AuthRole): boolean {
  try {
    return sessionStorage.getItem(keyFor(role)) === '1';
  } catch {
    return false;
  }
}

export function setAuthenticated(role: AuthRole, value: boolean): void {
  try {
    if (value) sessionStorage.setItem(keyFor(role), '1');
    else sessionStorage.removeItem(keyFor(role));
  } catch {
    // ignore
  }
}
