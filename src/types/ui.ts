export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => number;
  dismissToast: (id: number) => void;
  clearToasts: () => void;
}

export type VariantType =
  | "primary"
  | "error"
  | "warning"
  | "success"
  | "neutral"
  | "dark";

export type SizeType = "sm" | "md" | "lg";
