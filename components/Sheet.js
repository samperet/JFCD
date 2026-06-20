'use client';

import { useEffect, useRef, useState } from 'react';

const FOCUSABLE =
  'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * iOS-style bottom sheet. Stays mounted while animating out so the
 * slide-down transition can play, then unmounts. Implements modal
 * keyboard semantics: focus is moved in on open, trapped while open,
 * Escape closes, and focus is restored to the opener on close.
 */
export default function Sheet({ open, onClose, title, done = 'Done', children }) {
  const [mounted, setMounted] = useState(open);
  const sheetRef = useRef(null);
  const lastFocused = useRef(null);
  const onCloseRef = useRef(onClose);

  // Keep the latest onClose without making it an effect dependency
  // (the parent passes a fresh closure every render).
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Mount immediately on open; delay unmount until the close animation ends.
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 400);
    return () => clearTimeout(t);
  }, [open]);

  // Capture/restore focus around the open lifecycle.
  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement;
    } else if (lastFocused.current) {
      lastFocused.current.focus?.();
      lastFocused.current = null;
    }
  }, [open]);

  // Move focus in, trap Tab, and handle Escape while open.
  useEffect(() => {
    if (!open) return;
    const node = sheetRef.current;
    const focusables = () =>
      node ? Array.from(node.querySelectorAll(FOCUSABLE)).filter((el) => !el.disabled) : [];

    focusables()[0]?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <div className={`scrim ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        className={`sheet ${open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
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
