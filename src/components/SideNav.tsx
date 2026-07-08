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
    <aside className="hidden md:flex md:flex-col md:w-64 md:flex-shrink-0 md:sticky md:top-0 md:h-screen bg-white border-r border-cream-200 shadow-sm z-40">
      <div className="px-6 py-5 border-b border-cream-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">☕️</span>
          <div>
            <p className="font-bold text-coffee-700 leading-tight text-sm">{appTitles[language]}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
              activeTab === item.id
                ? 'bg-coffee-500 text-white shadow-md'
                : 'text-coffee-600 hover:bg-cream-100'
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
    </aside>
  );
};
