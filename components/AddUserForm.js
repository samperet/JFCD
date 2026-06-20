'use client';

import { useRef, useState } from 'react';
import { useStore } from '@/lib/store';

/**
 * A row that expands into a name field. Typing a brand-new name registers
 * an account (random avatar) and signs in; an existing name just signs in.
 * onAdded(name) fires after a successful submit (e.g. to close a sheet).
 */
export default function AddUserForm({ onAdded, label = 'New person', placeholder = 'Type a name…' }) {
  const { addUser } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  const start = () => {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const cancel = () => {
    setOpen(false);
    setName('');
  };

  const submit = (e) => {
    e.preventDefault();
    const resolved = addUser(name);
    if (resolved) {
      setName('');
      setOpen(false);
      onAdded?.(resolved);
    }
  };

  if (!open) {
    return (
      <button type="button" className="add-user-row" onClick={start}>
        <span className="add-user-plus" aria-hidden="true">+</span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <form className="add-user-form" onSubmit={submit}>
      <span className="add-user-plus" aria-hidden="true">+</span>
      <input
        ref={inputRef}
        className="add-user-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholder}
        maxLength={24}
        autoComplete="off"
        aria-label="Your name"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            cancel();
          }
        }}
      />
      <button type="submit" className="add-user-join" disabled={!name.trim()}>
        Join
      </button>
    </form>
  );
}
