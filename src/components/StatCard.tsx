import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'danger' | 'info' | 'success';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  hint,
  tone = 'default',
}) => {
  const toneStyles = {
    default: {
      wrapper: 'bg-cream-100/90 border border-cream-200',
      label: 'text-coffee-500',
      value: 'text-coffee-700',
      hint: 'text-coffee-400',
    },
    danger: {
      wrapper: 'bg-red-50 border border-red-100',
      label: 'text-red-600',
      value: 'text-red-600',
      hint: 'text-red-400',
    },
    info: {
      wrapper: 'bg-blue-50 border border-blue-100',
      label: 'text-blue-600',
      value: 'text-blue-700',
      hint: 'text-blue-400',
    },
    success: {
      wrapper: 'bg-green-50 border border-green-100',
      label: 'text-green-600',
      value: 'text-green-700',
      hint: 'text-green-400',
    },
  };

  const style = toneStyles[tone];

  return (
    <div className={`rounded-xl p-2.5 sm:p-3 text-center ${style.wrapper}`}>
      <p className={`text-xs leading-tight ${style.label}`}>{label}</p>
      <p className={`text-lg sm:text-xl font-bold mt-1 ${style.value}`}>{value}</p>
      {hint && <p className={`text-xs mt-1 ${style.hint}`}>{hint}</p>}
    </div>
  );
};

