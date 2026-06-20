'use client';

import { useStore } from '@/lib/store';
import LoginScreen from './LoginScreen';
import ChatScreen from './ChatScreen';

export default function App() {
  const { hydrated, currentUser } = useStore();

  // Avoid a hydration flash: render nothing until localStorage is read.
  if (!hydrated) return <div style={{ flex: 1 }} />;

  return currentUser ? <ChatScreen /> : <LoginScreen />;
}
