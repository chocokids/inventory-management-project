import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PinGate } from '../components/PinGate';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { isAuthenticated, setAuthenticated } from '../lib/auth';
import {
  ClientApiError,
  deleteAttendanceRecord,
  fetchCloudData,
  patchInventoryQuantities,
  postAttendance,
} from '../lib/api';
import type { AppData } from '../../shared/types';
import { calculateHours } from '../utils/db';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';

function todayLocalISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}T12:00:00.000Z`;
}

function todayKey(): string {
  return todayLocalISODate().slice(0, 10);
}

export const StaffApp: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'inventory' | 'attendance'>('inventory');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [clockIn, setClockIn] = useState('09:00');
  const [clockOut, setClockOut] = useState('18:00');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setAuthed(isAuthenticated('staff'));
  }, []);

  const load = useCallback(async () => {
    try {
      const next = await fetchCloudData();
      setData(next);
      const q: Record<number, number> = {};
      for (const item of next.inventory) {
        q[item.id] = item.quantity;
      }
      setQuantities(q);
      setEmployeeId((prev) => {
        if (prev !== '' && next.employees.some((e) => e.id === prev)) return prev;
        return next.employees[0]?.id ?? '';
      });
      setError(null);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : t.staff.loadFailed);
    }
  }, [t.staff.loadFailed]);

  useEffect(() => {
    if (!authed) return;
    void load();
    const id = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(id);
  }, [authed, load]);

  const todayRecords = useMemo(() => {
    if (!data) return [];
    const day = todayKey();
    return data.attendance
      .filter((r) => r.date.slice(0, 10) === day)
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }, [data]);

  /** Prefill form from today's record when employee changes (save still upserts). */
  const fillFromToday = (empId: number, source: AppData) => {
    const existing = source.attendance.find(
      (r) => r.employeeId === empId && r.date.slice(0, 10) === todayKey(),
    );
    if (existing) {
      setClockIn(existing.clockIn);
      setClockOut(existing.clockOut);
      setNotes(existing.notes || '');
    } else {
      setClockIn('09:00');
      setClockOut('18:00');
      setNotes('');
    }
  };

  useEffect(() => {
    if (!data || employeeId === '') return;
    fillFromToday(employeeId, data);
    // Only when employee selection or data identity changes meaningfully
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, data?.updatedAt]);

  const saveInventory = async () => {
    if (!data) return;
    setBusy(true);
    setMessage(null);
    try {
      const updates = data.inventory.map((item) => ({
        id: item.id,
        quantity: quantities[item.id] ?? item.quantity,
      }));
      const next = await patchInventoryQuantities(updates);
      setData(next);
      setMessage(t.staff.inventorySaved);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : t.staff.saveFailed);
    } finally {
      setBusy(false);
    }
  };

  const saveAttendance = async () => {
    if (!data || employeeId === '') return;
    const emp = data.employees.find((e) => e.id === employeeId);
    if (!emp) return;
    setBusy(true);
    setMessage(null);
    try {
      const next = await postAttendance({
        employeeId: emp.id,
        employeeName: emp.name,
        date: todayLocalISODate(),
        clockIn,
        clockOut,
        hoursWorked: calculateHours(clockIn, clockOut),
        notes: notes || undefined,
      });
      setData(next);
      setMessage(t.staff.attendanceSaved);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : t.staff.saveFailed);
    } finally {
      setBusy(false);
    }
  };

  const removeRecord = async (id: number) => {
    if (!window.confirm(t.staff.deleteConfirm)) return;
    setBusy(true);
    setMessage(null);
    try {
      const next = await deleteAttendanceRecord(id);
      setData(next);
      setMessage(t.staff.attendanceDeleted);
      if (employeeId !== '') fillFromToday(employeeId, next);
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : t.staff.saveFailed);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    setAuthenticated('staff', false);
    setAuthed(false);
  };

  if (!authed) {
    return (
      <PinGate
        role="staff"
        title={t.staff.loginTitle}
        subtitle={t.staff.loginSubtitle}
        onSuccess={() => setAuthed(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 gap-3">
        <div className="min-w-0">
          <h1 className="font-semibold text-gray-900 truncate">{t.staff.title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            aria-label={t.staff.language}
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="text-sm px-2 py-1.5 border border-gray-200 rounded-xl bg-white text-coffee-700"
          >
            <option value="zh">{t.settings.languages.zh}</option>
            <option value="ja">{t.settings.languages.ja}</option>
            <option value="en">{t.settings.languages.en}</option>
          </select>
          <Button variant="outline" size="sm" onClick={logout}>
            {t.staff.logout}
          </Button>
        </div>
      </header>

      <div className="flex gap-2 p-4">
        <Button
          variant={tab === 'inventory' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTab('inventory')}
        >
          {t.staff.tabInventory}
        </Button>
        <Button
          variant={tab === 'attendance' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTab('attendance')}
        >
          {t.staff.tabAttendance}
        </Button>
      </div>

      <main className="px-4 pb-8 max-w-lg mx-auto space-y-4 min-w-0 w-full">
        {error ? (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>
        ) : null}
        {message ? (
          <p className="text-sm text-green-700 bg-green-50 rounded-xl p-3">
            {message}
          </p>
        ) : null}

        {!data ? (
          <p className="text-center text-gray-500 py-8">{t.common.loading}</p>
        ) : tab === 'inventory' ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
            <p className="text-sm text-gray-500">{t.staff.inventoryHint}</p>
            {data.inventory.length === 0 ? (
              <p className="text-sm text-gray-400">{t.staff.noInventory}</p>
            ) : (
              data.inventory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.unit}</p>
                  </div>
                  <input
                    type="number"
                    className="w-24 px-3 py-2 border border-gray-200 rounded-xl"
                    value={quantities[item.id] ?? item.quantity}
                    onChange={(e) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [item.id]: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              ))
            )}
            <Button
              className="w-full"
              disabled={busy || data.inventory.length === 0}
              onClick={() => void saveInventory()}
            >
              {busy ? t.staff.saving : t.staff.saveInventory}
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 min-w-0 overflow-hidden">
              <Select
                label={t.staff.employee}
                value={employeeId === '' ? '' : String(employeeId)}
                onChange={(e) =>
                  setEmployeeId(e.target.value ? Number(e.target.value) : '')
                }
                options={data.employees.map((e) => ({
                  value: String(e.id),
                  label: e.name,
                }))}
              />
              <Input
                label={t.staff.clockIn}
                type="time"
                value={clockIn}
                onChange={(e) => setClockIn(e.target.value)}
                className="w-full max-w-full"
              />
              <Input
                label={t.staff.clockOut}
                type="time"
                value={clockOut}
                onChange={(e) => setClockOut(e.target.value)}
                className="w-full max-w-full"
              />
              <Input
                label={t.staff.notes}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.staff.notesPlaceholder}
              />
              <Button
                className="w-full"
                disabled={busy || employeeId === ''}
                onClick={() => void saveAttendance()}
              >
                {busy ? t.staff.saving : t.staff.saveAttendance}
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <h2 className="font-medium text-gray-900">{t.staff.todayRecords}</h2>
              {todayRecords.length === 0 ? (
                <p className="text-sm text-gray-400">{t.staff.noTodayRecords}</p>
              ) : (
                todayRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {rec.employeeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rec.clockIn} – {rec.clockOut} · {rec.hoursWorked}h
                        {rec.notes ? ` · ${rec.notes}` : ''}
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busy}
                      onClick={() => void removeRecord(rec.id)}
                    >
                      {t.staff.deleteRecord}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
