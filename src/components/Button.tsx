import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles =
    'font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-300/80 focus-visible:ring-offset-2 tracking-[0.01em]';
  
  const variantStyles = {
    primary:
      'bg-coffee-600 text-white hover:bg-coffee-700',
    secondary:
      'bg-gray-100 border border-gray-200 text-coffee-700 hover:bg-gray-200',
    danger:
      'bg-red-600 text-white hover:bg-red-700',
    outline:
      'border border-gray-300 text-coffee-700 bg-white hover:bg-gray-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};




