import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-10 max-w-[1400px] space-y-0">
      {children}
    </div>
  );
};
