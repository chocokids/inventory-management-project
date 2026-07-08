import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-4 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-coffee-700">{title}</h3>}
          {subtitle && <p className="text-sm text-coffee-400 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};




