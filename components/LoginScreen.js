'use client';

import { useStore } from '@/lib/store';
import AddUserForm from './AddUserForm';

function Chevron() {
  return (
    <svg className="login-item-chev" width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true">
      <path d="M1.5 1.5 7 7.5 1.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LoginScreen() {
  const { roster, login, avatarFor } = useStore();

  return (
    <div className="login">
      <div className="login-hero">
        <div className="login-badge">J</div>
        <h1 className="login-title">JFCD</h1>
        <p className="login-sub">Tap your name — or add a new one</p>
      </div>

      <div className="login-list">
        {roster.map((u) => (
          <button key={u.name} className="login-item" onClick={() => login(u.name)}>
            <img src={avatarFor(u.name)} alt="" />
            <span className="login-item-name">{u.name}</span>
            <Chevron />
          </button>
        ))}
      </div>

      <div className="login-list">
        <AddUserForm label="New person" placeholder="Type a name to join…" />
      </div>

      <p className="login-foot">🔒 Messages stay on this device · no account needed</p>
    </div>
  );
}
