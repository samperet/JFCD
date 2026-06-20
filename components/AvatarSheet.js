'use client';

import { useStore } from '@/lib/store';
import { AVATAR_STYLES, avatarUrl } from '@/lib/users';
import Sheet from './Sheet';

export default function AvatarSheet({ open, onClose }) {
  const { currentUser, users, setAvatar } = useStore();
  const current = users[currentUser] || {};

  // Derive straight from the store so the preview always reflects the
  // saved selection — no local state to drift out of sync.
  const style = current.style || 'thumbs';
  const seed = current.seed || currentUser;

  const apply = (nextStyle, nextSeed) => setAvatar(currentUser, nextStyle, nextSeed);
  const shuffle = () => apply(style, `${currentUser}-${Math.floor(Math.random() * 1e9)}`);

  return (
    <Sheet open={open} onClose={onClose} title="Your Avatar">
      <div className="preview">
        <img src={avatarUrl(style, seed)} alt="Your avatar preview" />
        <button type="button" onClick={shuffle}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 4h4l8 12h2M3 16h4l2-3M13 4h2l-1.5 2.2M15 2l2 2-2 2M15 14l2 2-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Shuffle
        </button>
      </div>

      <div className="style-grid">
        {AVATAR_STYLES.map((s) => (
          <button
            key={s}
            className={`style-tile ${s === style ? 'active' : ''}`}
            onClick={() => apply(s, seed)}
            aria-pressed={s === style}
            aria-label={`Avatar style ${s}`}
          >
            <img src={avatarUrl(s, seed)} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </Sheet>
  );
}
