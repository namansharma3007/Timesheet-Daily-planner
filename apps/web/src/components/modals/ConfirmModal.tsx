import { Modal } from '@timesheet/ui';
import type { TimesheetEntry } from '@timesheet/types';

interface ConfirmModalProps {
  entry: TimesheetEntry;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ entry, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel}>
      <div className="modal__header">
        <span className="modal__title">Delete Entry</span>
        <button className="modal__close" onClick={onCancel} aria-label="Close">
          ×
        </button>
      </div>
      <div className="confirm-body">
        <div className="confirm-body__icon" aria-hidden="true">
          🗑️
        </div>
        <div className="confirm-body__title">Delete "{entry.title}"?</div>
        <div className="confirm-body__text">This action cannot be undone.</div>
      </div>
      <div className="modal__actions">
        <button className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn--danger" onClick={onConfirm} autoFocus>
          Delete
        </button>
      </div>
    </Modal>
  );
}
