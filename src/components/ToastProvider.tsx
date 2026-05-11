import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Toast, ToastContextType, ToastType } from "@/types/ui";
import ToastComponent from "@/components/Toast";

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const currentToastIdRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const dismissToast = useCallback(
    (id: number) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      if (currentToastIdRef.current === id) {
        currentToastIdRef.current = null;
        clearTimer();
      }
    },
    [clearTimer]
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
    currentToastIdRef.current = null;
    clearTimer();
  }, [clearTimer]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      clearTimer();
      currentToastIdRef.current = id;
      setToasts([{ id, message, type }]);

      const timeoutId = window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        if (currentToastIdRef.current === id) {
          currentToastIdRef.current = null;
        }
        if (timeoutRef.current === timeoutId) {
          timeoutRef.current = null;
        }
      }, 4000);

      timeoutRef.current = timeoutId;
      return id;
    },
    [clearTimer]
  );

  const value = useMemo(
    () => ({ showToast, dismissToast, clearToasts }),
    [showToast, dismissToast, clearToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastComponent toasts={toasts} setToasts={setToasts} />
    </ToastContext.Provider>
  );
};
