'use client';

import { useStore } from '@/lib/store';
import { USERS } from '@/lib/users';
import Sheet from './Sheet';

function Check() {
  return (
    <svg className="member-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.5 8 14l8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SwitchUserSheet({ open, onClose }) {
  const { currentUser, login, avatarFor, notify, enableNotifications } = useStore();

  const pick = (id) => {
    if (id !== currentUser) login(id);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Switch User">
      {USERS.map((u) => (
        <button key={u.id} className="member" onClick={() => pick(u.id)}>
          <img src={avatarFor(u.id)} alt="" />
          <span className="member-name">{u.name}</span>
          {u.id === currentUser && <Check />}
        </button>
      ))}

      <button
        className="member"
        onClick={enableNotifications}
        aria-label={notify ? 'Notifications enabled' : 'Enable notifications'}
        style={{ borderTop: '0.5px solid var(--separator)', marginTop: 6 }}
      >
        <span aria-hidden="true" style={{ fontSize: 22, width: 44, textAlign: 'center' }}>
          {notify ? '🔔' : '🔕'}
        </span>
        <span className="member-name">
          {notify ? 'Notifications on' : 'Enable notifications'}
        </span>
      </button>
    </Sheet>
  );
}
