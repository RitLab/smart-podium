import { createContext, useCallback, useContext, useState } from "react";
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

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts([{ id, message, type }]); // Only show one toast at a time

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastComponent toasts={toasts} setToasts={setToasts} />
    </ToastContext.Provider>
  );
};
