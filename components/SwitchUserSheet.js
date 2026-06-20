'use client';

import { useStore } from '@/lib/store';
import Sheet from './Sheet';
import AddUserForm from './AddUserForm';

function Check() {
  return (
    <svg className="member-check" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.5 8 14l8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SwitchUserSheet({ open, onClose }) {
  const { currentUser, roster, login, avatarFor, notify, enableNotifications } = useStore();

  const pick = (id) => {
    if (id !== currentUser) login(id);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Accounts">
      {roster.map((u) => (
        <button key={u.name} className="member" onClick={() => pick(u.name)}>
          <img src={avatarFor(u.name)} alt="" />
          <span className="member-name">{u.name}</span>
          {u.name === currentUser && <Check />}
        </button>
      ))}

      <AddUserForm onAdded={onClose} label="Add person" placeholder="Type a name…" />


      <button
        className="member"
        onClick={enableNotifications}
        aria-label={notify ? 'Notifications enabled' : 'Enable notifications'}
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
