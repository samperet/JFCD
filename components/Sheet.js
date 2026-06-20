'use client';

import { useEffect, useState } from 'react';

/**
 * iOS-style bottom sheet. Stays mounted while animating out so the
 * slide-down transition can play, then unmounts.
 */
export default function Sheet({ open, onClose, title, done = 'Done', children }) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 400);
    return () => clearTimeout(t);
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <div className={`scrim ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`sheet ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grabber" />
        <div className="sheet-head">
          <span className="sheet-title">{title}</span>
          <button className="sheet-done" onClick={onClose}>
            {done}
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </>
  );
}
