import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  style?: 'outlined' | 'filled';
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className = '', 
  style = 'outlined',
  size
}) => {
  const sizeClass = size ? `text-[${size}px]` : '';
  
  if (style === 'filled') {
    return (
      <span 
        className={`material-icons ${sizeClass} ${className}`}
        style={size ? { fontSize: `${size}px` } : undefined}
      >
        {name}
      </span>
    );
  }
  
  return (
    <span 
      className={`material-symbols-outlined ${sizeClass} ${className}`}
      style={size ? { fontSize: `${size}px` } : undefined}
    >
      {name}
    </span>
  );
};




