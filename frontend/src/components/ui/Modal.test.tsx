import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

function renderModal(props: Partial<React.ComponentProps<typeof Modal>> = {}) {
  const onClose = vi.fn();
  const utils = render(
    <Modal open onClose={onClose} title="Test dialog" description="A description" {...props}>
      <button type="button">Inside</button>
    </Modal>,
  );
  return { onClose, ...utils };
}

describe('Modal', () => {
  it('exposes an accessible name via aria-labelledby and is marked as a dialog', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Test dialog');
    expect(dialog).toHaveAccessibleDescription('A description');
  });

  it('renders nothing when closed', () => {
    render(<Modal open={false} onClose={vi.fn()} title="Hidden">child</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('moves focus into the dialog on open', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    // Focus lands on the first focusable control (the close button) and never
    // escapes behind the backdrop.
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape while a request is in flight', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal({ busy: true });
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    // The close affordance is disabled too, so the dialog cannot be dismissed
    // mid-submit and lose the user's input.
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeDisabled();
  });

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    const backdrop = document.querySelector('.modal-backdrop')!;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when the click starts inside the dialog', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    await user.click(screen.getByRole('button', { name: 'Inside' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('has a labelled close button', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });
});
