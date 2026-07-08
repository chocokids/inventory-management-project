import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { initializeSampleData } from '../utils/db';
import { useLanguage } from '../i18n/LanguageContext';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleInitSampleData = async () => {
    if (window.confirm(t.settings.clearWarning)) {
      // 先清除所有数据
      const { db } = await import('../utils/db');
      await db.inventory.clear();
      await db.employees.clear();
      await db.attendance.clear();
      
      // 清除用户清空数据的标志，允许重新初始化
      localStorage.removeItem('userClearedData');
      
      // 然后根据当前语言初始化示例数据
      await initializeSampleData(language);
      alert(t.settings.initSuccess);
      window.location.reload();
    }
  };

  const handleClearData = async () => {
    if (window.confirm(t.settings.clearWarning)) {
      if (window.confirm(t.settings.clearConfirm)) {
        const { db } = await import('../utils/db');
        await db.inventory.clear();
        await db.employees.clear();
        await db.attendance.clear();
        // 设置标志，表示用户主动清除了数据
        localStorage.setItem('userClearedData', 'true');
        alert(t.settings.clearSuccess);
        window.location.reload();
      }
    }
  };

  const handleExportData = async () => {
    try {
      const { db } = await import('../utils/db');
      const [inventory, employees, attendance] = await Promise.all([
        db.inventory.toArray(),
        db.employees.toArray(),
        db.attendance.toArray(),
      ]);

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          inventory,
          employees,
          attendance,
        },
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `coffee-shop-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert(t.settings.exportSuccess);
    } catch (error) {
      console.error('Export error:', error);
      alert(t.settings.exportError);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        if (!importData.data || !importData.version) {
          alert(t.settings.importInvalidFormat);
          return;
        }

        if (window.confirm(t.settings.importWarning)) {
          const { db } = await import('../utils/db');
          
          // 导入库存数据
          if (importData.data.inventory && Array.isArray(importData.data.inventory)) {
            await db.inventory.clear();
            const inventoryData = importData.data.inventory.map((item: any) => ({
              ...item,
              lastUpdated: new Date(item.lastUpdated),
            }));
            await db.inventory.bulkAdd(inventoryData);
          }

          // 导入员工数据
          if (importData.data.employees && Array.isArray(importData.data.employees)) {
            await db.employees.clear();
            const employeeData = importData.data.employees.map((item: any) => ({
              ...item,
              hireDate: new Date(item.hireDate),
            }));
            await db.employees.bulkAdd(employeeData);
          }

          // 导入考勤数据
          if (importData.data.attendance && Array.isArray(importData.data.attendance)) {
            await db.attendance.clear();
            const attendanceData = importData.data.attendance.map((item: any) => ({
              ...item,
              date: new Date(item.date),
            }));
            await db.attendance.bulkAdd(attendanceData);
          }

          localStorage.removeItem('userClearedData');
          alert(t.settings.importSuccess);
          window.location.reload();
        }
      } catch (error) {
        console.error('Import error:', error);
        alert(t.settings.importError);
      }
    };
    input.click();
  };

  const handleInstallPWA = () => {
    alert(t.settings.installPWAHint);
  };

  const handleLanguageChange = (lang: 'zh' | 'ja' | 'en') => {
    setLanguage(lang);
    alert(t.settings.languageChanged);
  };

  const appVersion = '2.0.0';
  const buildDate = '2024-11-10';

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-coffee-700 flex items-center gap-2">
          <Icon name="settings" size={28} />
          {t.settings.title}
        </h1>
        <p className="text-sm text-coffee-400 mt-1">{t.settings.subtitle}</p>
      </div>

      {/* Language Settings */}
      <Card className="mb-4" title={t.settings.language}>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-coffee-700 mb-2">
            {t.settings.languageLabel}
          </label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as 'zh' | 'ja' | 'en')}
            className="w-full px-4 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent bg-white text-coffee-700 font-medium cursor-pointer"
          >
            <option value="zh">🇨🇳 {t.settings.languages.zh}</option>
            <option value="ja">🇯🇵 {t.settings.languages.ja}</option>
            <option value="en">🇺🇸 {t.settings.languages.en}</option>
          </select>
        </div>
      </Card>

      {/* App Info */}
      <Card className="mb-4 bg-gradient-to-br from-cream-100 to-coffee-100">
        <div className="text-center">
          <p className="text-4xl mb-3">☕️</p>
          <h2 className="text-xl font-bold text-coffee-700 mb-1">{t.settings.appInfo}</h2>
          <p className="text-sm text-coffee-500">{t.settings.appNameEn}</p>
          <div className="mt-4 text-xs text-coffee-400 space-y-1">
            <p>{t.settings.version}：v{appVersion}</p>
            <p>{t.settings.buildDate}：{buildDate}</p>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="mb-4" title={t.settings.dataManagement}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="primary"
              className="flex items-center justify-center gap-2"
              onClick={handleExportData}
            >
              <Icon name="upload" size={20} />
              <span>{t.settings.exportData}</span>
            </Button>

            <Button
              variant="primary"
              className="flex items-center justify-center gap-2"
              onClick={handleImportData}
            >
              <Icon name="download" size={20} />
              <span>{t.settings.importData}</span>
            </Button>
          </div>

          <Button
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleInitSampleData}
          >
            <Icon name="inventory_2" size={20} />
            <span>{t.settings.initSampleData}</span>
          </Button>

          <Button
            variant="danger"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleClearData}
          >
            <Icon name="delete_forever" size={20} />
            <span>{t.settings.clearAllData}</span>
          </Button>
        </div>
        <p className="text-xs text-coffee-400 mt-3 flex items-center gap-1">
          <Icon name="warning" size={14} />
          {t.settings.dataWarning}
        </p>
      </Card>

      {/* PWA Settings */}
      <Card className="mb-4" title={t.settings.appSettings}>
        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleInstallPWA}
          >
            <Icon name="phone_iphone" size={20} />
            <span>{t.settings.installPWA}</span>
          </Button>
        </div>
        <p className="text-xs text-coffee-400 mt-3 flex items-start gap-1">
          <Icon name="lightbulb" size={14} className="mt-0.5 flex-shrink-0" />
          <span>{t.settings.installHint}</span>
        </p>
      </Card>

      {/* Features */}
      <Card className="mb-4" title={t.settings.features}>
        <div className="space-y-2 text-sm text-coffee-600">
          <div className="flex items-start gap-2">
            <Icon name="check_circle" size={18} className="text-green-600 flex-shrink-0" />
            <span>{t.settings.featuresList.inventory}</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="check_circle" size={18} className="text-green-600 flex-shrink-0" />
            <span>{t.settings.featuresList.employees}</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="check_circle" size={18} className="text-green-600 flex-shrink-0" />
            <span>{t.settings.featuresList.attendance}</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="check_circle" size={18} className="text-green-600 flex-shrink-0" />
            <span>{t.settings.featuresList.payroll}</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="check_circle" size={18} className="text-green-600 flex-shrink-0" />
            <span>{t.settings.featuresList.purchaseList}</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="check_circle" size={18} className="text-green-600 flex-shrink-0" />
            <span>{t.settings.featuresList.offlineStorage}</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="check_circle" size={18} className="text-green-600 flex-shrink-0" />
            <span>{t.settings.featuresList.pwaSupport}</span>
          </div>
        </div>
      </Card>

      {/* Tech Stack */}
      <Card className="mb-4" title={t.settings.techStack}>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-cream-100 p-2 rounded-lg">
            <p className="text-coffee-400">{t.settings.tech.frontend}</p>
            <p className="font-semibold text-coffee-700">React + TypeScript</p>
          </div>
          <div className="bg-cream-100 p-2 rounded-lg">
            <p className="text-coffee-400">{t.settings.tech.buildTool}</p>
            <p className="font-semibold text-coffee-700">Vite</p>
          </div>
          <div className="bg-cream-100 p-2 rounded-lg">
            <p className="text-coffee-400">{t.settings.tech.uiFramework}</p>
            <p className="font-semibold text-coffee-700">TailwindCSS</p>
          </div>
          <div className="bg-cream-100 p-2 rounded-lg">
            <p className="text-coffee-400">{t.settings.tech.database}</p>
            <p className="font-semibold text-coffee-700">Dexie.js</p>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="bg-cream-50">
        <div className="text-center text-sm text-coffee-500">
          <p className="mb-2">☕️</p>
          <p>{t.settings.about}</p>
          <p className="text-xs mt-2">{t.settings.aboutDesc}</p>
          <p className="text-xs text-coffee-400 mt-4">© 2024 {t.settings.copyright}</p>
        </div>
      </Card>
    </div>
  );
};

