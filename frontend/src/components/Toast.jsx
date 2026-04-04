import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: "border-green-200 bg-green-50 text-green-700",
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-[#d9d7d4] bg-[#f0efed] text-[#2d6a4f]",
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [
      ...prev,
      { id, message, type, entering: true, exiting: false },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, entering: false } : t)),
      );
    }, 30);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          const enteredClass = toast.entering
            ? "translate-x-full"
            : "translate-x-0";
          const exitingClass = toast.exiting ? "opacity-0" : "opacity-100";
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl bg-white border border-[#e8e6e3] shadow-sm px-4 py-3 transition-all duration-300 ${COLORS[toast.type]} ${enteredClass} ${exitingClass}`}
            >
              <Icon size={18} className="shrink-0" />
              <p className="flex-1 text-sm">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-0.5 opacity-80 transition-opacity hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
