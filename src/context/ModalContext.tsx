import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

type ModalType = 'alert' | 'confirm' | 'success' | 'error';

interface ModalOptions {
  title?: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
}

interface ModalContextType {
  showAlert: (options: ModalOptions | string) => void;
  showConfirm: (options: ModalOptions | string) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions>({ message: '' });
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>();

  const showAlert = useCallback((opts: ModalOptions | string) => {
    const modalOpts = typeof opts === 'string' ? { message: opts, type: 'alert' as ModalType } : { type: 'alert' as ModalType, ...opts };
    setOptions(modalOpts);
    setIsOpen(true);
  }, []);

  const showConfirm = useCallback((opts: ModalOptions | string) => {
    const modalOpts = typeof opts === 'string' ? { message: opts, type: 'confirm' as ModalType } : { type: 'confirm' as ModalType, ...opts };
    setOptions(modalOpts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleClose = (value: boolean) => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(value);
      setResolvePromise(undefined);
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {options.type === 'error' ? <AlertCircle className="w-6 h-6 text-red-500" /> :
                 options.type === 'success' ? <CheckCircle className="w-6 h-6 text-green-500" /> :
                 <Info className="w-6 h-6 text-indigo-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-zinc-100 mb-1">
                  {options.title || settings.site_name}
                </h3>
                <p className="text-zinc-400 text-sm whitespace-pre-wrap break-words">
                  {options.message}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              {options.type === 'confirm' && (
                <button
                  onClick={() => handleClose(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  {options.cancelText || 'Cancel'}
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors ${
                  options.type === 'error' ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {options.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within ModalProvider');
  return context;
};
