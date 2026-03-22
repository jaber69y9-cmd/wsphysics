import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

export const showAlert = (message: string) => {
  const container = document.createElement('div');
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
        }, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
        {message}
      </div>
    );
  };

  root.render(<AlertComponent />);
};

export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
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

      if (!visible) return null;

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Action</h3>
            <p className="text-slate-600 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => handleClose(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleClose(true)}
                className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      );
    };

    root.render(<ConfirmComponent />);
  });
};
