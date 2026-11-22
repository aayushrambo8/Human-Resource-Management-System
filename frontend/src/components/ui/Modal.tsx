'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional supporting line rendered under the title. */
  description?: string;
  children: ReactNode;
  /** Blocks Escape/backdrop dismissal while a submit is in flight. */
  busy?: boolean;
}

/**
 * Hand-rolled accessible dialog (no new dependency): role="dialog",
 * aria-modal, aria-labelledby on the title, Escape and backdrop dismissal,
 * initial focus on the first focusable control, focus restored to the element
 * that opened it, and body scroll locked while open.
 */
export function Modal({ open, onClose, title, description, children, busy = false }: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Capture the trigger on open so focus can be returned on close.
  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const dialog = dialogRef.current;
    const focusable = dialog?.querySelector<HTMLElement>(
      'input:not([type="hidden"]), select, textarea, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? dialog)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [open]);

  // Escape to dismiss (suppressed while a request is in flight).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        // mousedown (not click) so a drag out of the dialog doesn't dismiss it.
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <header className="modal-header">
          <div>
            <h2 id={titleId} className="text-balance">{title}</h2>
            {description && (
              <p id={descriptionId} className="text-balance">{description}</p>
            )}
          </div>
          <button
            type="button"
            className="icon-button hit-slop"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={busy}
          >
            <Icon name="close" size={16} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
