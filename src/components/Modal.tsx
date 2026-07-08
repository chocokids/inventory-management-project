import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-cream-200/80 shadow-[0_24px_56px_-28px_rgba(0,0,0,0.6)] max-w-md sm:max-w-lg md:max-w-xl w-full max-h-[90vh] overflow-y-auto my-6 sm:my-0">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 border-b border-cream-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-semibold text-coffee-700">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-coffee-400 hover:text-coffee-600 hover:bg-cream-100 text-2xl leading-none flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};




