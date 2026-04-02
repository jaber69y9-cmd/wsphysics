import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border min-w-[300px] max-w-md
                ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                  toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 
                  toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 
                  'bg-sky-50 border-sky-200 text-sky-800'}
              `}>
                <div className={`
                  p-2 rounded-xl
                  ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                    toast.type === 'error' ? 'bg-rose-100 text-rose-600' : 
                    toast.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                    'bg-sky-100 text-sky-600'}
                `}>
                  {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
                  {toast.type === 'error' && <XCircle className="h-5 w-5" />}
                  {toast.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
                  {toast.type === 'info' && <Info className="h-5 w-5" />}
                </div>
                
                <div className="flex-1 font-medium text-sm">
                  {toast.message}
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 opacity-50" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
