import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input, Select } from '../components/Input';
import { Icon } from '../components/Icon';
import {
  Employee,
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getMonthlyHours,
  getMonthlyWorkDays,
} from '../utils/db';
import { useLanguage } from '../i18n/LanguageContext';

export const EmployeePage: React.FC = () => {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeHours, setEmployeeHours] = useState<{ [key: number]: number }>({});
  const [employeeWorkDays, setEmployeeWorkDays] = useState<{ [key: number]: number }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [currentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [formData, setFormData] = useState({
    name: '',
    position: 'barista',
    hourlyRate: 18,
    dailyTransportAllowance: 0,
    phone: '',
    email: '',
  });

  const positions = [
    { value: 'manager', label: `👔 ${t.employees.positions.manager}` },
    { value: 'barista', label: `☕️ ${t.employees.positions.barista}` },
    { value: 'partTime', label: `⏰ ${t.employees.positions.partTime}` },
    { value: 'intern', label: `📚 ${t.employees.positions.intern}` },
  ];

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

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const items = await getAllEmployees();
    setEmployees(items);
    
    // 加载每个员工本月的考勤工时和工作天数
    const hoursMap: { [key: number]: number } = {};
    const workDaysMap: { [key: number]: number } = {};
    for (const employee of items) {
      if (employee.id) {
        const hours = await getMonthlyHours(employee.id, currentMonth.year, currentMonth.month);
        const workDays = await getMonthlyWorkDays(employee.id, currentMonth.year, currentMonth.month);
        hoursMap[employee.id] = hours;
        workDaysMap[employee.id] = workDays;
      }
    }
    setEmployeeHours(hoursMap);
    setEmployeeWorkDays(workDaysMap);
  };

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        position: employee.position,
        hourlyRate: employee.hourlyRate,
        dailyTransportAllowance: employee.dailyTransportAllowance || 0,
        phone: employee.phone || '',
        email: employee.email || '',
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        position: 'barista',
        hourlyRate: 18,
        dailyTransportAllowance: 0,
        phone: '',
        email: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmployee?.id) {
      await updateEmployee(editingEmployee.id, {
        ...formData,
        hoursWorked: 0, // 保留字段但不使用
      });
    } else {
      await addEmployee({
        ...formData,
        hoursWorked: 0, // 新员工工时为0
        hireDate: new Date(),
      });
    }
    
    await loadEmployees();
    handleCloseModal();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t.employees.deleteConfirm)) {
      await deleteEmployee(id);
      await loadEmployees();
    }
  };

  const getTotalHours = () => {
    return Object.values(employeeHours).reduce((sum, hours) => sum + hours, 0);
  };

  const getTotalSalary = () => {
    return employees.reduce((sum, emp) => {
      const hours = employeeHours[emp.id!] || 0;
      const workDays = employeeWorkDays[emp.id!] || 0;
      const hourlyWage = hours * emp.hourlyRate;
      const transportAllowance = workDays * (emp.dailyTransportAllowance || 0);
      return sum + hourlyWage + transportAllowance;
    }, 0);
  };

  const getEmployeeSalary = (employee: Employee) => {
    const hours = employeeHours[employee.id!] || 0;
    const workDays = employeeWorkDays[employee.id!] || 0;
    const hourlyWage = hours * employee.hourlyRate;
    const transportAllowance = workDays * (employee.dailyTransportAllowance || 0);
    return hourlyWage + transportAllowance;
  };

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-coffee-700 flex items-center gap-2">
          <Icon name="group" size={28} />
          {t.employees.title}
        </h1>
        <p className="text-sm text-coffee-400 mt-1">{t.employees.subtitle}</p>
      </div>

      {/* Summary Card */}
      <Card className="mb-4 bg-gradient-to-br from-coffee-100 to-cream-100">
        <div className="mb-3">
          <p className="text-xs text-coffee-500 mb-1">
            📅 {currentMonth.year}{t.attendance.year}{currentMonth.month}{t.attendance.month} {t.employees.monthStats}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-coffee-600">{t.employees.totalEmployees}</p>
            <p className="text-xl font-bold text-coffee-700">{employees.length}</p>
            <p className="text-xs text-coffee-400">{t.employees.people}</p>
          </div>
          <div>
            <p className="text-xs text-coffee-600">{t.employees.monthlyHours}</p>
            <p className="text-xl font-bold text-coffee-700">{getTotalHours().toFixed(1)}</p>
            <p className="text-xs text-coffee-400">{t.employees.hours}</p>
          </div>
          <div>
            <p className="text-xs text-coffee-600">{t.employees.monthlySalary}</p>
            <p className="text-xl font-bold text-coffee-700">{t.employees.currency}{getTotalSalary().toFixed(0)}</p>
            <p className="text-xs text-coffee-400">{t.employees.yuan}</p>
          </div>
        </div>
      </Card>

      {/* Add Button */}
      <Button
        variant="primary"
        className="w-full mb-4 flex items-center justify-center gap-2"
        onClick={() => handleOpenModal()}
      >
        <Icon name="add" size={20} />
        <span>{t.employees.addEmployee}</span>
      </Button>

      {/* Employee List */}
      <div className="space-y-3">
        {employees.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-coffee-400">
              <Icon name="group" size={48} className="mx-auto mb-2" />
              <p>{t.employees.noEmployees}</p>
              <p className="text-sm mt-1">{t.employees.noEmployeesHint}</p>
            </div>
          </Card>
        ) : (
          employees.map(employee => {
            const monthlyHours = employeeHours[employee.id!] || 0;
            const workDays = employeeWorkDays[employee.id!] || 0;
            const monthlySalary = getEmployeeSalary(employee);
            const hourlyWage = monthlyHours * employee.hourlyRate;
            const transportAllowance = workDays * (employee.dailyTransportAllowance || 0);
            
            return (
              <Card key={employee.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-coffee-700 text-lg">{employee.name}</h3>
                    <p className="text-sm text-coffee-400">{getPositionLabel(employee.position)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-coffee-400">{t.employees.monthlySalaryLabel}</p>
                    <p className="text-lg font-bold text-coffee-600">
                      {t.employees.currency}{monthlySalary.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3 bg-cream-50 p-2 rounded-lg">
                  <div>
                    <span className="text-coffee-400">{t.employees.hourlyRate}：</span>
                    <span className="text-coffee-700 font-medium">{t.employees.currency}{employee.hourlyRate}/h</span>
                  </div>
                  <div>
                    <span className="text-coffee-400">{t.employees.hoursWorked}：</span>
                    <span className="text-coffee-700 font-medium">{monthlyHours.toFixed(1)}h</span>
                  </div>
                  {(employee.dailyTransportAllowance && employee.dailyTransportAllowance > 0) && (
                    <div className="col-span-2">
                      <span className="text-coffee-400">{t.employees.dailyTransportAllowance}：</span>
                      <span className="text-coffee-700 font-medium">{t.employees.currency}{employee.dailyTransportAllowance}{t.employees.perDay}</span>
                    </div>
                  )}
                </div>

                {monthlyHours > 0 && (
                  <div className="text-xs text-coffee-500 mb-3 bg-blue-50 p-2 rounded space-y-1">
                    <div>💰 {t.employees.salaryCalculation}：</div>
                    <div>• {t.employees.hourlyWage}: {monthlyHours.toFixed(1)}h × {t.employees.currency}{employee.hourlyRate} = {t.employees.currency}{hourlyWage.toFixed(2)}</div>
                    {transportAllowance > 0 && (
                      <div>• {t.employees.transportFee}: {workDays}{t.employees.days} × {t.employees.currency}{employee.dailyTransportAllowance} = {t.employees.currency}{transportAllowance.toFixed(2)}</div>
                    )}
                    <div className="font-bold">{t.employees.totalSalary}: {t.employees.currency}{monthlySalary.toFixed(2)}</div>
                  </div>
                )}

                {monthlyHours === 0 && (
                  <div className="text-xs text-orange-600 mb-3 bg-orange-50 p-2 rounded">
                    <Icon name="info" size={14} className="inline mr-1" />
                    {t.employees.noAttendance}
                  </div>
                )}

                {(employee.phone || employee.email) && (
                  <div className="text-xs text-coffee-400 mb-3 space-y-1">
                    {employee.phone && <p>📱 {employee.phone}</p>}
                    {employee.email && <p>📧 {employee.email}</p>}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenModal(employee)}
                    className="flex-1"
                  >
                    <Icon name="edit" size={16} className="inline mr-1" />
                  {t.common.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => employee.id && handleDelete(employee.id)}
                    className="flex-1"
                  >
                    <Icon name="delete" size={16} className="inline mr-1" />
                  {t.common.delete}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEmployee ? t.employees.editEmployee : t.employees.addEmployee}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label={t.employees.name}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder={t.employees.placeholders.name}
          />

          <Select
            label={t.employees.position}
            value={formData.position}
            onChange={e => setFormData({ ...formData, position: e.target.value })}
            options={positions}
          />

          <Input
            label={`${t.employees.hourlyRate} (${t.employees.currency}/${t.employees.hours})`}
            type="number"
            value={formData.hourlyRate}
            onChange={e => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
            onFocus={e => e.target.select()}
            required
            min="0"
            step="0.5"
            placeholder={t.employees.placeholders.hourlyRate}
          />

          <Input
            label={`${t.employees.dailyTransportAllowance} (${t.employees.currency})`}
            type="number"
            value={formData.dailyTransportAllowance}
            onChange={e => setFormData({ ...formData, dailyTransportAllowance: Number(e.target.value) })}
            onFocus={e => e.target.select()}
            min="0"
            step="1"
            placeholder="0"
          />

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm text-blue-700 font-medium mb-1">💡 {t.employees.hoursNote}</p>
            <p className="text-xs text-blue-600">
              {t.employees.hoursNoteText}
            </p>
          </div>

          <Input
            label={t.employees.phone}
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder={t.employees.placeholders.phone}
          />

          <Input
            label={t.employees.email}
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder={t.employees.placeholders.email}
          />

          {editingEmployee && (
            <div className="bg-cream-100 p-3 rounded-lg mb-4">
              <p className="text-sm text-coffee-600 mb-1">
                📊 {t.employees.monthlyStats}（{currentMonth.year}{t.attendance.year}{currentMonth.month}{t.attendance.month}）
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-coffee-500">{t.employees.attendanceHours}：</span>
                  <span className="font-bold text-coffee-700">
                    {(employeeHours[editingEmployee.id!] || 0).toFixed(1)}h
                  </span>
                </div>
                <div>
                  <span className="text-coffee-500">{t.employees.salaryCalculation}：</span>
                  <span className="font-bold text-coffee-700">
                    {t.employees.currency}{((employeeHours[editingEmployee.id!] || 0) * formData.hourlyRate).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1">
              {editingEmployee ? t.common.save : t.common.add}
            </Button>
            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
              {t.common.cancel}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

