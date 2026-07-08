import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input, Select } from '../components/Input';
import { Icon } from '../components/Icon';
import {
  AttendanceRecord,
  Employee,
  getAllAttendance,
  getAllEmployees,
  addAttendance,
  updateAttendance,
  deleteAttendance,
  calculateHours,
  getMonthlyPayroll,
} from '../utils/db';
import { generateAndDownloadPayroll } from '../utils/generatePayroll';
import { useLanguage } from '../i18n/LanguageContext';
import { PageLayout } from '../components/PageLayout';
import { StatCard } from '../components/StatCard';

export const AttendancePage: React.FC = () => {
  const { t, language } = useLanguage();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterEmployeeId, setFilterEmployeeId] = useState<number>(0);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [formData, setFormData] = useState({
    employeeId: 0,
    employeeName: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '09:00',
    clockOut: '18:00',
    notes: '',
  });

  // Helper function to get translated position name
  const getPositionLabel = (positionKey: string): string => {
    const positionMap: { [key: string]: string } = {
      'manager': t.employees.positions.manager,
      'barista': t.employees.positions.barista,
      'partTime': t.employees.positions.partTime,
      'intern': t.employees.positions.intern,
      // Legacy Chinese keys for backward compatibility
      '店长': t.employees.positions.manager,
      '咖啡师': t.employees.positions.barista,
      '兼职': t.employees.positions.partTime,
      '实习生': t.employees.positions.intern,
    };
    return positionMap[positionKey] || positionKey;
  };

  const loadData = useCallback(async () => {
    const [attendanceData, employeeData] = await Promise.all([
      getAllAttendance(),
      getAllEmployees(),
    ]);
    setAttendance(attendanceData);
    setEmployees(employeeData);
    
    if (employeeData.length > 0 && !formData.employeeId) {
      setFormData(prev => ({
        ...prev,
        employeeId: employeeData[0].id!,
        employeeName: employeeData[0].name,
      }));
    }
  }, [formData.employeeId]);

  const applyFilters = useCallback(() => {
    let filtered = [...attendance];

    // 按员工筛选
    if (filterEmployeeId > 0) {
      filtered = filtered.filter(record => record.employeeId === filterEmployeeId);
    }

    // 按日期范围筛选
    if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      filtered = filtered.filter(record => new Date(record.date) >= startDate);
    }

    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999); // 包含结束日期的整天
      filtered = filtered.filter(record => new Date(record.date) <= endDate);
    }

    setFilteredAttendance(filtered);
  }, [attendance, filterEmployeeId, filterStartDate, filterEndDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const resetFilters = () => {
    setFilterEmployeeId(0);
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const hasActiveFilters = () => {
    return filterEmployeeId > 0 || filterStartDate !== '' || filterEndDate !== '';
  };

  const handleOpenModal = (record?: AttendanceRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        date: new Date(record.date).toISOString().split('T')[0],
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        notes: record.notes || '',
      });
    } else {
      setEditingRecord(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        employeeId: employees[0]?.id || 0,
        employeeName: employees[0]?.name || '',
        date: today,
        clockIn: '09:00',
        clockOut: '18:00',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleEmployeeChange = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId: employee.id!,
        employeeName: employee.name,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hoursWorked = calculateHours(formData.clockIn, formData.clockOut);
    
    const recordData = {
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      date: new Date(formData.date),
      clockIn: formData.clockIn,
      clockOut: formData.clockOut,
      hoursWorked,
      notes: formData.notes,
    };
    
    if (editingRecord?.id) {
      await updateAttendance(editingRecord.id, recordData);
    } else {
      await addAttendance(recordData);
    }
    
    await loadData();
    handleCloseModal();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t.attendance.deleteConfirm)) {
      await deleteAttendance(id);
      await loadData();
    }
  };

  const handleGeneratePayroll = async () => {
    const payrollData = await getMonthlyPayroll(selectedMonth.year, selectedMonth.month);
    
    if (payrollData.length === 0) {
      alert(t.attendance.noAttendanceData);
      return;
    }
    
    await generateAndDownloadPayroll(payrollData, selectedMonth.year, selectedMonth.month, language);
    alert(`✅ ${t.attendance.reportGenerated}`);
  };

  const getTodayAttendance = () => {
    const today = new Date().toDateString();
    return attendance.filter(record => 
      new Date(record.date).toDateString() === today
    );
  };

  const getRecentAttendance = () => {
    return filteredAttendance.slice(0, 20);
  };

  const formatDate = (date: Date) => {
    const localeMap: { [key: string]: string } = {
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'en': 'en-US',
    };
    const locale = localeMap[language] || 'en-US';
    
    return new Date(date).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <PageLayout>
      {/* Header with Action Button */}
      <div className="max-w-3xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-coffee-700 flex items-center gap-2">
            <Icon name="event_note" size={28} />
            {t.attendance.title}
          </h1>
          <button
            onClick={() => handleOpenModal()}
            className="w-11 h-11 flex items-center justify-center bg-gradient-to-br from-coffee-500 to-coffee-600 text-white rounded-xl shadow-md shadow-coffee-300/40 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            title={t.attendance.addAttendance}
          >
            <Icon name="add" className="text-white" size={24} />
          </button>
        </div>
        <p className="text-sm text-coffee-500">{t.attendance.subtitle}</p>
      </div>

      {/* Today Summary & Payroll */}
      <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 mb-0">
        <h3 className="font-semibold text-coffee-700 mb-3 flex items-center gap-2">
          <Icon name="today" size={20} />
          {t.attendance.todayAttendance}
        </h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-coffee-600">{t.attendance.checkedIn}</p>
            <p className="text-2xl font-bold text-coffee-700">{getTodayAttendance().length} {t.employees.people}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-coffee-600">{t.attendance.totalHours}</p>
            <p className="text-2xl font-bold text-coffee-700">
              {getTodayAttendance().reduce((sum, r) => sum + r.hoursWorked, 0).toFixed(1)}h
            </p>
          </div>
        </div>
      </Card>

      {/* Payroll Generator */}
      <Card className="mb-0" title={`💰 ${t.attendance.generatePayroll}`}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-coffee-700 mb-1">{t.attendance.selectMonth}</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={selectedMonth.year}
                onChange={e => setSelectedMonth({ ...selectedMonth, year: Number(e.target.value) })}
                onFocus={e => e.target.select()}
                className="w-24 px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400"
                min="2020"
                max="2030"
              />
              <select
                value={selectedMonth.month}
                onChange={e => setSelectedMonth({ ...selectedMonth, month: Number(e.target.value) })}
                className="flex-1 px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}{t.attendance.month}</option>
                ))}
              </select>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleGeneratePayroll}
            className="flex items-center gap-2"
          >
            <Icon name="download" size={20} />
            <span>{t.attendance.generateReport}</span>
          </Button>
        </div>
      </Card>
      </div>

      <div className="max-w-3xl space-y-8">
        {/* Recent Attendance */}
        <div className="flex items-center justify-between py-1">
          <h2 className="text-lg font-semibold text-coffee-700 flex items-center gap-2">
            <Icon name="event_note" size={24} />
            <span>{t.attendance.title}</span>
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 bg-white border border-cream-300 rounded-xl text-sm font-medium text-coffee-600 hover:bg-cream-50 transition-all flex items-center gap-1.5 shadow-sm"
            title={t.inventory.advancedFilter}
          >
            <Icon name="filter_list" size={20} />
            {hasActiveFilters() && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {(filterEmployeeId > 0 ? 1 : 0) + (filterStartDate ? 1 : 0) + (filterEndDate ? 1 : 0)}
              </span>
            )}
            <Icon name={showFilters ? 'expand_less' : 'expand_more'} size={16} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-0">
            <div className="space-y-3">
            {/* Employee Filter */}
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                {t.attendance.employeeName}
              </label>
              <select
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 bg-white text-coffee-700"
              >
                <option value={0}>{t.inventory.categories.all}</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {getPositionLabel(emp.position)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">
                {t.attendance.date}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-coffee-500 mb-1">{t.common.search}:</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-coffee-500 mb-1">~</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div className="flex items-center gap-2 pt-2 border-t border-cream-200">
                <span className="text-xs text-coffee-500">{t.inventory.filterOptions.activeFilters}</span>
                {filterEmployeeId > 0 && (
                  <span className="text-xs bg-coffee-100 text-coffee-700 px-2 py-1 rounded">
                    {employees.find(e => e.id === filterEmployeeId)?.name}
                  </span>
                )}
                {filterStartDate && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {filterStartDate}
                  </span>
                )}
                {filterEndDate && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    ~ {filterEndDate}
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="ml-auto text-xs text-coffee-500 hover:text-coffee-700 underline"
                >
                  {t.inventory.filterOptions.clearAll}
                </button>
              </div>
            )}
          </div>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <StatCard label={t.common.total} value={attendance.length} tone="default" />
          <StatCard label={t.inventory.filterResult} value={filteredAttendance.length} tone="info" />
          <StatCard
            label={t.attendance.totalHours}
            value={`${filteredAttendance.reduce((sum, r) => sum + r.hoursWorked, 0).toFixed(1)}h`}
            tone="success"
          />
        </div>

        <div className="space-y-3">
        {attendance.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-coffee-400">
              <Icon name="event_note" size={48} className="mx-auto mb-2" />
              <p>{t.attendance.noAttendance}</p>
              <p className="text-sm mt-1">{t.attendance.noAttendanceHint}</p>
            </div>
          </Card>
        ) : filteredAttendance.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-coffee-400">
              <p className="text-4xl mb-2">🔍</p>
              <p>{t.inventory.noFilterResults}</p>
              <p className="text-sm mt-1">{t.inventory.noFilterResultsHint}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mt-3"
              >
                {t.inventory.clearFilters}
              </Button>
            </div>
          </Card>
        ) : (
          getRecentAttendance().map(record => (
            <Card key={record.id} className="hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-coffee-700 flex items-center gap-2">
                    <Icon name="person" size={18} />
                    <span>{record.employeeName}</span>
                  </h3>
                  <p className="text-xs text-coffee-400">{formatDate(record.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-coffee-400">{t.attendance.workHours}</p>
                  <p className="text-lg font-bold text-coffee-600">{record.hoursWorked.toFixed(1)}h</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3 bg-cream-50 p-2 rounded-lg">
                <div>
                  <span className="text-coffee-400">{t.attendance.clockIn}：</span>
                  <span className="text-coffee-700 font-medium">⏰ {record.clockIn}</span>
                </div>
                <div>
                  <span className="text-coffee-400">{t.attendance.clockOut}：</span>
                  <span className="text-coffee-700 font-medium">⏰ {record.clockOut}</span>
                </div>
              </div>

              {record.notes && (
                <div className="text-xs text-coffee-500 mb-3 bg-yellow-50 p-2 rounded">
                  💬 {record.notes}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenModal(record)}
                  className="flex-1"
                >
                  <Icon name="edit" size={16} className="inline mr-1" />
                  {t.common.edit}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => record.id && handleDelete(record.id)}
                  className="flex-1"
                >
                  <Icon name="delete" size={16} className="inline mr-1" />
                  {t.common.delete}
                </Button>
              </div>
            </Card>
          ))
        )}
        </div>
      </div>

      {attendance.length > 10 && (
        <p className="text-center text-sm text-coffee-400 mt-4">
          {t.attendance.recentRecords} 10 {t.common.records || 'records'}, {t.common.total || 'Total'} {attendance.length} {t.common.records || 'records'}
        </p>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRecord ? t.attendance.editAttendance : t.attendance.addAttendance}
      >
        <form onSubmit={handleSubmit}>
          <Select
            label={t.attendance.employeeName}
            value={formData.employeeId}
            onChange={e => handleEmployeeChange(Number(e.target.value))}
            options={employees.map(emp => ({
              value: String(emp.id),
              label: `${emp.name} - ${getPositionLabel(emp.position)}`,
            }))}
          />

          <Input
            label={t.attendance.date}
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t.attendance.clockIn}
              type="time"
              value={formData.clockIn}
              onChange={e => setFormData({ ...formData, clockIn: e.target.value })}
              required
            />

            <Input
              label={t.attendance.clockOut}
              type="time"
              value={formData.clockOut}
              onChange={e => setFormData({ ...formData, clockOut: e.target.value })}
              required
            />
          </div>

          <Input
            label={t.attendance.notes}
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder={t.attendance.notesPlaceholder}
          />

          <div className="bg-cream-100 p-3 rounded-lg mb-4">
            <p className="text-sm text-coffee-600">
              ⏰ {t.attendance.workHours}：
              <span className="font-bold text-coffee-700 ml-2">
                {calculateHours(formData.clockIn, formData.clockOut).toFixed(2)} {t.employees.hours}
              </span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              {editingRecord ? t.common.save : t.common.add}
            </Button>
            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
              {t.common.cancel}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
};

