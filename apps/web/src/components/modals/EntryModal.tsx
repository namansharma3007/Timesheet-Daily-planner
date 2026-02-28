import { useState, type FormEvent } from 'react';
import { Modal, Spinner } from '@timesheet/ui';
import { COLORS } from '../../constants';
import { genId } from '@timesheet/utils';
import type { EntryFormValues, TimesheetEntry } from '@timesheet/types';

interface EntryModalProps {
  /** Pass existing entry to edit, or partial {from,to} to pre-fill a new one */
  entry: Partial<TimesheetEntry> | null;
  onSave: (entry: TimesheetEntry) => Promise<void>;
  onClose: () => void;
}

const DEFAULT_FORM: EntryFormValues = {
  title: '',
  from: '09:00',
  to: '10:00',
  color: 0,
  notes: '',
};

function validate(form: EntryFormValues): string | null {
  if (!form.title.trim()) return 'Title is required.';
  const [fh = 0, fm = 0] = form.from.split(':').map(Number);
  const [th = 0, tm = 0] = form.to.split(':').map(Number);
  if (fh * 60 + fm >= th * 60 + tm) return 'End time must be after start time.';
  return null;
}

export function EntryModal({ entry, onSave, onClose }: EntryModalProps) {
  const isNew = !entry?.id;
  const [form, setForm] = useState<EntryFormValues>({ ...DEFAULT_FORM, ...entry });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof EntryFormValues>(k: K, v: EntryFormValues[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validate(form);
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      await onSave({ ...form, id: entry?.id ?? genId() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="modal__header">
        <span className="modal__title">{isNew ? 'Add Entry' : 'Edit Entry'}</span>
        <button className="modal__close" onClick={onClose} aria-label="Close">×</button>
      </div>

      {error && <div className="err-msg" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="entry-title">Title</label>
          <input
            id="entry-title"
            className="field__input"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="What are you working on?"
            autoFocus
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field__label" htmlFor="entry-from">Start Time</label>
            <input
              id="entry-from"
              className="field__input"
              type="time"
              value={form.from}
              onChange={(e) => set('from', e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="entry-to">End Time</label>
            <input
              id="entry-to"
              className="field__input"
              type="time"
              value={form.to}
              onChange={(e) => set('to', e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="entry-notes">Notes (optional)</label>
          <textarea
            id="entry-notes"
            className="field__textarea"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Any details…"
          />
        </div>

        <div className="field">
          <span className="field__label">Color</span>
          <div className="color-picker" role="radiogroup" aria-label="Entry color">
            {COLORS.map((c, i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={form.color === i}
                aria-label={c.label}
                className={`color-swatch${form.color === i ? ' color-swatch--active' : ''}`}
                style={{ background: c.bg }}
                onClick={() => set('color', i)}
              />
            ))}
          </div>
        </div>

        <div className="modal__actions">
          <button className="btn btn--ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? <Spinner /> : isNew ? 'Add Entry' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
