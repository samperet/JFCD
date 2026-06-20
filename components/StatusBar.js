'use client';

import { useEffect, useState } from 'react';

function clock() {
  const d = new Date();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  h = h % 12 || 12;
  return `${h}:${m}`;
}

export default function StatusBar() {
  const [time, setTime] = useState('9:41');

  useEffect(() => {
    setTime(clock());
    const id = setInterval(() => setTime(clock()), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="status-bar">
      <span className="status-time">{time}</span>
      <span className="status-icons" aria-hidden="true">
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.35" />
        </svg>
        {/* wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 2.2c2.6 0 5 1 6.8 2.7l1.2-1.3A11.4 11.4 0 0 0 8.5.2 11.4 11.4 0 0 0 .5 3.6l1.2 1.3A9.4 9.4 0 0 1 8.5 2.2z" />
          <path d="M8.5 5.6c1.7 0 3.3.7 4.5 1.8l1.2-1.3A8 8 0 0 0 8.5 3.8a8 8 0 0 0-5.7 2.3L4 7.4a6.4 6.4 0 0 1 4.5-1.8z" />
          <path d="M8.5 9c.8 0 1.6.3 2.2.9l-2.2 2.3-2.2-2.3A3.1 3.1 0 0 1 8.5 9z" />
        </svg>
        {/* battery */}
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
          <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
          <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
    </div>
  );
}
