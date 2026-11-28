'use client';

import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence, transitions } from '@/lib/motion';
import { Icon } from './Icon';

interface SwipeSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Mobile-friendly bottom sheet with rubber-band overscroll drag physics,
 * swipe-to-dismiss, safe-area padding, and dimmed focus staging.
 */
export function SwipeSheet({ open, onClose, title, children }: SwipeSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: transitions.entrance }}
          exit={{ opacity: 0, transition: transitions.exit }}
          className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1, transition: transitions.entrance }}
            exit={{ y: '100%', opacity: 0, transition: transitions.exit }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.12, bottom: 0.45 }}
            onDragEnd={(_event, info) => {
              if (info.offset.y > 110 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-layered p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-h-[88vh] overflow-y-auto touch-pan-y"
          >
            {/* Drag handle */}
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[var(--color-border)] sm:hidden" aria-hidden="true" />
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
              <h2 className="text-base font-bold text-[var(--color-text)] text-balance">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sheet"
                className="icon-button hit-slop"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
