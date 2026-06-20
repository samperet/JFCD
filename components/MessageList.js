'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import MessageRow from './MessageRow';
import TypingRow from './TypingRow';

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function stampParts(ts) {
  const d = new Date(ts);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);

  let day;
  if (diffDays === 0) day = 'Today';
  else if (diffDays === 1) day = 'Yesterday';
  else if (diffDays > 1 && diffDays < 7) day = d.toLocaleDateString([], { weekday: 'long' });
  else
    day = d.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      ...(d.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
    });

  return { day, time, dayKey: d.toDateString() };
}

export default function MessageList() {
  const { messages, currentUser, typing, avatarFor } = useStore();
  const endRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, typing]);

  let lastStampAt = 0;
  let lastStampDay = null;

  return (
    <div className="thread" ref={scrollRef}>
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const next = messages[i + 1];
        const groupStart = !prev || prev.sender !== m.sender || m.ts - prev.ts > 5 * 60 * 1000;
        const groupEnd = !next || next.sender !== m.sender || next.ts - m.ts > 5 * 60 * 1000;
        const isLast = i === messages.length - 1;

        // Like iMessage: a stamp at the start and after a gap of an hour+.
        // The bold day word is only repeated when the calendar day changes.
        const showStamp = m.ts - lastStampAt > 60 * 60 * 1000;
        let stamp = null;
        if (showStamp) {
          const p = stampParts(m.ts);
          stamp = { day: p.dayKey !== lastStampDay ? p.day : null, time: p.time };
          lastStampAt = m.ts;
          lastStampDay = p.dayKey;
        }

        return (
          <div key={m.id}>
            {stamp && (
              <div className="day-stamp">
                {stamp.day && <b>{stamp.day} </b>}
                {stamp.time}
              </div>
            )}
            <MessageRow
              message={m}
              mine={m.sender === currentUser}
              groupStart={groupStart}
              groupEnd={groupEnd}
              showReceipt={isLast && m.sender === currentUser}
              avatar={avatarFor(m.sender)}
            />
          </div>
        );
      })}

      {typing && <TypingRow avatar={avatarFor(typing)} name={typing} />}
      <div ref={endRef} />
    </div>
  );
}
