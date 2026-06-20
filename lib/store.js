'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SEED_USERS, avatarUrl, randomStyle, cleanName } from './users';

const KEY_MSGS = 'jfcd.messages.v3';
const KEY_USERS = 'jfcd.users.v3';
const KEY_CURRENT = 'jfcd.current.v3';

const StoreContext = createContext(null);

const REPLIES = [
  'Haha love that 😄',
  'Totally agree 👍',
  'omw!',
  "Let's gooo 🚀",
  'Wait what 😂',
  'Sounds perfect 💯',
  'I’m in 🎉',
  'No way 🤯',
  'Can’t wait ⏰',
  'You always know 💖',
];

const baseTs = 1718800000000; // fixed base so seeded order is deterministic
const SEED = [
  { id: 's1', sender: 'Fiona', text: 'Who’s around this weekend? 🎭', ts: baseTs },
  { id: 's2', sender: 'Lucy', text: 'meee — thinking beach day ☀️', ts: baseTs + 60000 },
  { id: 's3', sender: 'Cece', text: 'I’ll bring the speaker 🚀🔊', ts: baseTs + 120000 },
  { id: 's4', sender: 'Jaya', text: 'painting supplies packed 🎨 let’s do it', ts: baseTs + 180000 },
];

function defaultUsers() {
  const out = {};
  for (const u of SEED_USERS) out[u.name] = { style: u.style, seed: u.seed };
  return out;
}

function safeParse(raw, fallback) {
  try {
    const v = JSON.parse(raw);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function lsGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode or quota exceeded — degrade to in-memory only */
  }
}

function lsRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'm' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function StoreProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [users, setUsers] = useState(defaultUsers);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [typing, setTyping] = useState(null);
  const [notify, setNotify] = useState(false);
  const timers = useRef([]);

  // Hydrate from localStorage on mount (client only).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = safeParse(lsGet(KEY_USERS), null);
    const merged = { ...defaultUsers(), ...(stored || {}) };
    setUsers(merged);

    const m = safeParse(lsGet(KEY_MSGS), null);
    setMessages(Array.isArray(m) && m.length ? m : SEED);

    const c = lsGet(KEY_CURRENT);
    if (c && merged[c]) setCurrentUser(c);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      setNotify(true);
    }
    setHydrated(true);
  }, []);

  // Persist.
  useEffect(() => {
    if (hydrated) lsSet(KEY_MSGS, JSON.stringify(messages));
  }, [messages, hydrated]);
  useEffect(() => {
    if (hydrated) lsSet(KEY_USERS, JSON.stringify(users));
  }, [users, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    if (currentUser) lsSet(KEY_CURRENT, currentUser);
    else lsRemove(KEY_CURRENT);
  }, [currentUser, hydrated]);

  // Clear any pending reply timers on unmount.
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const avatarFor = useCallback(
    (id) => {
      const u = users[id] || {};
      return avatarUrl(u.style, u.seed);
    },
    [users]
  );

  const pushNotification = useCallback(
    (fromId, text) => {
      if (!notify || typeof document === 'undefined') return;
      if (!document.hidden) return;
      try {
        new Notification(`${fromId}`, {
          body: text,
          icon: avatarFor(fromId),
          tag: 'jfcd',
        });
      } catch {
        /* notifications best-effort */
      }
    },
    [notify, avatarFor]
  );

  const simulateReply = useCallback(
    (fromUser) => {
      if (Math.random() > 0.6) return;
      const others = Object.keys(users).filter((id) => id !== fromUser);
      if (others.length === 0) return;
      const who = others[Math.floor(Math.random() * others.length)];
      setTyping(who);

      const t1 = setTimeout(() => {
        setTyping((cur) => (cur === who ? null : cur));
        const text = REPLIES[Math.floor(Math.random() * REPLIES.length)];
        setMessages((m) => [...m, { id: newId(), sender: who, text, ts: Date.now() }]);
        pushNotification(who, text);
      }, 1300 + Math.random() * 1500);

      timers.current.push(t1);
    },
    [pushNotification, users]
  );

  const send = useCallback(
    (raw) => {
      const text = (raw || '').trim();
      if (!text || !currentUser) return;
      setMessages((m) => [...m, { id: newId(), sender: currentUser, text, ts: Date.now() }]);
      simulateReply(currentUser);
    },
    [currentUser, simulateReply]
  );

  const login = useCallback((id) => setCurrentUser(id), []);
  const logout = useCallback(() => {
    setTyping(null);
    setCurrentUser(null);
  }, []);

  const setAvatar = useCallback((id, style, seed) => {
    setUsers((prev) => ({ ...prev, [id]: { style, seed } }));
  }, []);

  // Register-or-resolve by name: typing an existing name (case-insensitive)
  // signs into that account; a new name creates one with a random avatar.
  // Either way the resolved name is set as the current user.
  const addUser = useCallback(
    (rawName) => {
      const name = cleanName(rawName);
      if (!name) return null;

      const existing = Object.keys(users).find(
        (k) => k.toLowerCase() === name.toLowerCase()
      );
      if (existing) {
        setCurrentUser(existing);
        return existing;
      }

      setUsers((prev) => ({ ...prev, [name]: { style: randomStyle(), seed: name } }));
      setCurrentUser(name);
      return name;
    },
    [users]
  );

  const roster = useMemo(
    () => Object.keys(users).map((name) => ({ name, ...users[name] })),
    [users]
  );

  const enableNotifications = useCallback(async () => {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') {
      setNotify(true);
      return true;
    }
    if (Notification.permission === 'denied') return false;
    const res = await Notification.requestPermission();
    const ok = res === 'granted';
    setNotify(ok);
    return ok;
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      users,
      roster,
      messages,
      currentUser,
      typing,
      notify,
      avatarFor,
      send,
      login,
      logout,
      addUser,
      setAvatar,
      enableNotifications,
    }),
    [
      hydrated,
      users,
      roster,
      messages,
      currentUser,
      typing,
      notify,
      avatarFor,
      send,
      login,
      logout,
      addUser,
      setAvatar,
      enableNotifications,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
