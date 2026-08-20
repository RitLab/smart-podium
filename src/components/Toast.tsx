import React from "react";
import { X } from "lucide-react";
import type { Toast } from "@/types/ui";

type ToastProps = {
  toasts: Toast[];
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>;
};

const ToastComponent = ({ toasts, setToasts }: ToastProps) => {
  return (
    // Toast harus di atas semua modal. Sebelumnya z-50, sementara setiap
    // modal di app ini z-[100] ke atas (PINModal, AdminPanel, SummaryModal,
    // boot splash, webview fullscreen), jadi toast selalu tertimbun dan
    // aksinya terlihat seperti tidak terjadi apa-apa.
    <div className="fixed top-5 right-5 space-y-3 z-[10000]">
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
