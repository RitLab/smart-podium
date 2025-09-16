import React from "react";
import { X } from "lucide-react";
import { Toast } from "../types/ui.types";

type ToastProps = {
  toasts: Toast[];
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>;
};

const ToastComponent = ({ toasts, setToasts }: ToastProps) => {
  return (
    <div className="fixed top-5 right-5 space-y-3 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between px-4 py-2 rounded-lg shadow-md text-white animate-slideIn
              ${
                toast.type === "success"
                  ? "bg-green-500"
                  : toast.type === "error"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            className="ml-3 hover:opacity-80"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastComponent;
