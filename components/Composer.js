'use client';

import { useRef, useState } from 'react';
import { useStore } from '@/lib/store';

function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

export default function Composer() {
  const { send } = useStore();
  const [text, setText] = useState('');
  const ref = useRef(null);

  const submit = (e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;
    send(t);
    setText('');
    if (ref.current) {
      ref.current.style.height = 'auto';
      autoGrow(ref.current);
      ref.current.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form className="composer" onSubmit={submit}>
      <button type="button" className="composer-plus" aria-label="Add attachment">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="composer-field">
        <textarea
          ref={ref}
          className="composer-input"
          rows={1}
          placeholder="iMessage"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoGrow(e.target);
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      <button type="submit" className="composer-send" disabled={!text.trim()} aria-label="Send">
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 16V5M5 9l5-5 5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  );
}
