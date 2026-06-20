'use client';

import { useStore } from '@/lib/store';
import { USERS } from '@/lib/users';

function Chevron() {
  return (
    <svg className="login-item-chev" width="9" height="15" viewBox="0 0 9 15" fill="none">
      <path d="M1.5 1.5 7 7.5 1.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LoginScreen() {
  const { login, avatarFor } = useStore();

  return (
    <div className="login">
      <div className="login-hero">
        <div className="login-badge">J</div>
        <h1 className="login-title">JFCD</h1>
        <p className="login-sub">Tap your name to join the chat</p>
      </div>

      <div className="login-list">
        {USERS.map((u) => (
          <button key={u.id} className="login-item" onClick={() => login(u.id)}>
            <img src={avatarFor(u.id)} alt="" />
            <span className="login-item-name">{u.name}</span>
            <Chevron />
          </button>
        ))}
      </div>

      <p className="login-foot">🔒 Messages stay on this device · no account needed</p>
    </div>
  );
}
