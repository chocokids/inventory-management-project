import { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { SideNav } from './components/SideNav';
import { InventoryPage } from './pages/InventoryPage';
import { EmployeePage } from './pages/EmployeePage';
import { AttendancePage } from './pages/AttendancePage';
import { WeeklyReportPage } from './pages/WeeklyReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { initializeSampleData } from './utils/db';
import { useLanguage } from './i18n/LanguageContext';

function App() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('inventory');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize sample data on first load only
    const initialize = async () => {
      // 从 localStorage 获取当前语言
      const savedLanguage = (localStorage.getItem('appLanguage') as 'zh' | 'ja' | 'en') || 'zh';
      await initializeSampleData(savedLanguage);
      setIsInitialized(true);
    };
    initialize();
  }, []); // 只在首次加载时执行

  // Update document title when language changes
  useEffect(() => {
    const titles = {
      zh: '☕️ 咖啡店管理系统',
      ja: '☕️ カフェ管理システム',
      en: '☕️ Coffee Shop Management',
    };
    document.title = titles[language] || titles.zh;
  }, [language]);

  const navItems = [
    { id: 'inventory', label: t.nav.inventory, icon: 'inventory_2' },
    { id: 'employees', label: t.nav.employees, icon: 'group' },
    { id: 'attendance', label: t.nav.attendance, icon: 'event_note' },
    { id: 'reports', label: t.nav.reports, icon: 'assessment' },
    { id: 'settings', label: t.nav.settings, icon: 'settings' },
  ];

  const renderPage = () => {
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-coffee-400">
            <p className="text-4xl mb-2">☕️</p>
            <p>{t.common.loading}</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'inventory':
        return <InventoryPage />;
      case 'employees':
        return <EmployeePage />;
      case 'attendance':
        return <AttendancePage />;
      case 'reports':
        return <WeeklyReportPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <InventoryPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <div className="flex min-h-screen overflow-x-hidden">
        <SideNav items={navItems} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 min-w-0 bg-white min-h-screen lg:m-4 lg:rounded-2xl lg:border lg:border-gray-200 lg:shadow-sm lg:overflow-hidden lg:min-h-[calc(100vh-2rem)]">
            {renderPage()}
          </main>
          <BottomNav items={navItems} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
}

export default App;

