import React, { useRef, useEffect, useCallback, memo } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/contexts';
import type { ModalProps } from '@/types';

interface Props extends ModalProps {
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<Props> = memo(({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  const { isDarkMode } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-xl p-4 sm:p-6 w-full ${
          sizeClasses[size]
        } max-h-[90vh] overflow-y-auto`}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <h3 
            id="modal-title" 
            className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate pr-2"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`p-3 rounded-lg transition-colors touch-manipulation flex-shrink-0 ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
});