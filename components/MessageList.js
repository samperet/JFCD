'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import MessageRow from './MessageRow';
import TypingRow from './TypingRow';

function dayLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return { day: 'Today', time };
  return {
    day: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
    time,
  };
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

  return (
    <div className="thread" ref={scrollRef}>
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const next = messages[i + 1];
        const groupStart = !prev || prev.sender !== m.sender || m.ts - prev.ts > 5 * 60 * 1000;
        const groupEnd = !next || next.sender !== m.sender || next.ts - m.ts > 5 * 60 * 1000;
        const isLast = i === messages.length - 1;

        // Show a centered day/time stamp at the top of a new time block.
        const showStamp = m.ts - lastStampAt > 30 * 60 * 1000;
        if (showStamp) lastStampAt = m.ts;
        const { day, time } = dayLabel(m.ts);

        return (
          <div key={m.id}>
            {showStamp && (
              <div className="day-stamp">
                <b>{day}</b> {time}
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
