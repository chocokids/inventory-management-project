import React from 'react';
import { Icon } from './Icon';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-cream-200 shadow-lg z-50 md:hidden">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              activeTab === item.id
                ? 'text-coffee-600'
                : 'text-coffee-300 hover:text-coffee-500'
            }`}
          >
            <Icon 
              name={item.icon} 
              size={24} 
              style={activeTab === item.id ? 'filled' : 'outlined'}
              className="mb-1" 
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

