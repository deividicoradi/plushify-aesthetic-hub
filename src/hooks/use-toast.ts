// Compatibility shim: forwards the legacy useToast/toast API to Sonner.
// Existing callers can keep using { title, description, variant } unchanged.
import { toast as sonnerToast } from "sonner";

type Variant = "default" | "destructive" | "success";

interface ToastArgs {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: Variant;
  duration?: number;
  action?: React.ReactNode;
}

const stringify = (node: React.ReactNode): string => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  // Best-effort fallback for ReactNode inputs
  try {
    return String(node);
  } catch {
    return "";
  }
};

export const toast = (args: ToastArgs | string) => {
  if (typeof args === "string") {
    return sonnerToast(args);
  }
  const { title, description, variant, duration } = args;
  const message = stringify(title) || stringify(description) || "";
  const opts = {
    description: title ? stringify(description) || undefined : undefined,
    duration,
  };
  if (variant === "destructive") return sonnerToast.error(message, opts);
  if (variant === "success") return sonnerToast.success(message, opts);
  return sonnerToast(message, opts);
};

export const useToast = () => ({
  toast,
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  toasts: [] as Array<unknown>,
});

export type { ToastArgs as Toast };