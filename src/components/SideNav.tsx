import React from 'react';
import { Icon } from './Icon';
import { useLanguage } from '../i18n/LanguageContext';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface SideNavProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const SideNav: React.FC<SideNavProps> = ({ items, activeTab, onTabChange }) => {
  const { language } = useLanguage();

  const appTitles = {
    zh: '咖啡店管理系统',
    ja: 'カフェ管理システム',
    en: 'Coffee Shop Management',
  };

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:flex-shrink-0 md:min-h-screen bg-white border-r border-gray-200 z-40">
      <div className="p-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☕️</span>
            <div>
              <p className="font-bold text-coffee-700 leading-tight text-sm">{appTitles[language]}</p>
              <p className="text-xs text-coffee-400">Inventory Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-3 space-y-1 overflow-y-auto">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              activeTab === item.id
                ? 'bg-coffee-600 text-white'
                : 'text-coffee-600 hover:bg-gray-100'
            }`}
          >
            <Icon
              name={item.icon}
              size={22}
              style={activeTab === item.id ? 'filled' : 'outlined'}
              className={activeTab === item.id ? 'text-white' : 'text-coffee-400'}
            />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs text-coffee-500">
          Designed for modern cafe operations
        </div>
      </div>
    </aside>
  );
};
