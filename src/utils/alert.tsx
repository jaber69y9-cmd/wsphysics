import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const container = document.createElement('div');
  container.className = 'fixed bottom-6 right-6 z-[9999] pointer-events-none';
  document.body.appendChild(container);

  const root = createRoot(container);

  const AlertComponent = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          root.unmount();
          container.remove();
        }, 500);
      }, 4000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="pointer-events-auto"
          >
            <div className={`
              flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border min-w-[320px] max-w-md
              ${type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 
                'bg-slate-800 border-slate-700 text-white'}
            `}>
              <div className={`
                p-2 rounded-xl
                ${type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                  type === 'error' ? 'bg-rose-100 text-rose-600' : 
                  'bg-slate-700 text-slate-300'}
              `}>
                {type === 'success' && <CheckCircle className="h-6 w-6" />}
                {type === 'error' && <XCircle className="h-6 w-6" />}
                {type === 'info' && <AlertCircle className="h-6 w-6" />}
              </div>
              
              <div className="flex-1 font-bold text-sm">
                {message}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  root.render(<AlertComponent />);
};

export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    container.className = 'fixed inset-0 z-[9999] pointer-events-none';
    document.body.appendChild(container);

    const root = createRoot(container);

    const ConfirmComponent = () => {
      const [visible, setVisible] = useState(true);

      const handleClose = (result: boolean) => {
        setVisible(false);
        setTimeout(() => {
          root.unmount();
          container.remove();
          resolve(result);
        }, 300);
      };

      return (
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto px-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white p-8 rounded-[32px] shadow-2xl max-w-sm w-full border border-slate-100"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight">Are you sure?</h3>
                <p className="text-slate-500 mb-8 font-medium">{message}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleClose(false)}
                    className="flex-1 px-6 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleClose(true)}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white hover:bg-orange-700 rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      );
    };

    root.render(<ConfirmComponent />);
  });
};
