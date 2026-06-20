'use client';

import { useStore } from '@/lib/store';

function BackChevron() {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
      <path d="M10 2 2 10l8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NavBar({ memberIds, onBack, onTitle, onAvatar }) {
  const { avatarFor } = useStore();
  const shown = memberIds.slice(0, 3);

  return (
    <header className="navbar">
      <div className="navbar-row">
        <div className="navbar-leading">
          <button className="nav-btn" onClick={onBack} aria-label="Switch user / leave">
            <BackChevron />
          </button>
        </div>

        <button className="navbar-center" onClick={onTitle} aria-label="Group members">
          <span className="nav-avatars">
            {shown.map((id) => (
              <img key={id} src={avatarFor(id)} alt="" />
            ))}
          </span>
          <span className="navbar-title">JFCD</span>
          <span className="navbar-subtitle">{memberIds.length} people ›</span>
        </button>

        <div className="navbar-trailing">
          <button className="nav-btn" onClick={onAvatar} aria-label="Edit your avatar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="9" r="3.4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M5.5 19a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
