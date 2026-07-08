import React from 'react';

interface PhoneMockupProps {
  children: React.ReactNode;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cream-100 via-cream-50 to-coffee-100 p-4">
      {/* iPhone 16 mockup */}
      <div className="relative">
        {/* Phone frame */}
        <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl" style={{ width: '393px', height: '852px' }}>
          {/* Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded-b-3xl z-10" style={{ width: '120px', height: '30px' }}>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-5 bg-black rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-800 rounded-full mr-2"></div>
            </div>
          </div>
          
          {/* Screen */}
          <div className="relative bg-cream-50 rounded-[2.5rem] overflow-hidden h-full">
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 text-xs text-coffee-700 z-10 bg-gradient-to-b from-cream-100 to-transparent">
              <span className="font-medium">9:41</span>
              <div className="flex items-center gap-1">
                <span>📶</span>
                <span>📡</span>
                <span>🔋</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="h-full overflow-y-auto pt-12 pb-8">
              {children}
            </div>
          </div>
        </div>
        
        {/* Power button */}
        <div className="absolute right-0 top-40 w-1 h-16 bg-gray-800 rounded-l"></div>
        
        {/* Volume buttons */}
        <div className="absolute left-0 top-36 w-1 h-12 bg-gray-800 rounded-r"></div>
        <div className="absolute left-0 top-52 w-1 h-12 bg-gray-800 rounded-r"></div>
      </div>
    </div>
  );
};




