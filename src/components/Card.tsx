import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-5 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-coffee-700 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-coffee-500 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};




