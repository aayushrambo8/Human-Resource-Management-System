'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { motion, AnimatePresence, variants } from '@/lib/motion';
import { Icon } from './Icon';

export interface ToastOptions {
  id?: string;
  title: string;
  description?: string;
  variant?: 'success' | 'info' | 'warning' | 'danger';
  durationMs?: number;
  onUndo?: () => void;
  undoLabel?: string;
}

interface ToastEntry extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const entry: ToastEntry = {
        variant: 'info',
        durationMs: options.onUndo ? 6000 : 4000,
        undoLabel: 'Undo',
        ...options,
        id,
      };
      setToasts((prev) => [...prev.slice(-3), entry]);

      if (entry.durationMs && entry.durationMs > 0) {
        setTimeout(() => dismissToast(id), entry.durationMs);
      }
      return id;
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none safe-area-inset"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              variants={variants.arcIn}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-layered ${
                toast.variant === 'success' ? 'animate-success-pulse' : ''
              }`}
            >
              <span
                className={`mt-0.5 shrink-0 ${
                  toast.variant === 'success'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : toast.variant === 'warning'
                    ? 'text-amber-600 dark:text-amber-400'
                    : toast.variant === 'danger'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-[var(--color-primary)]'
                }`}
              >
                <Icon
                  name={
                    toast.variant === 'success'
                      ? 'check-circle'
                      : toast.variant === 'warning' || toast.variant === 'danger'
                      ? 'alert'
                      : 'info'
                  }
                  size={17}
                />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--color-text)] text-left">{toast.title}</p>
                {toast.description && (
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 text-left leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
              {toast.onUndo && (
                <button
                  type="button"
                  onClick={() => {
                    toast.onUndo?.();
                    dismissToast(toast.id);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--color-primary)] text-white text-[11px] font-bold hover:opacity-90 active:scale-[0.97] transition-all cursor-pointer shrink-0"
                >
                  {toast.undoLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="icon-button !size-7 text-[var(--color-text-muted)] shrink-0"
              >
                <Icon name="close" size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: () => '',
      dismissToast: () => {},
    };
  }
  return ctx;
}
