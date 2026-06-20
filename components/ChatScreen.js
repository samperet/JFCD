'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import NavBar from './NavBar';
import MessageList from './MessageList';
import Composer from './Composer';
import SwitchUserSheet from './SwitchUserSheet';
import AvatarSheet from './AvatarSheet';

export default function ChatScreen() {
  const { logout, roster } = useStore();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <>
      <NavBar
        memberIds={roster.map((u) => u.name)}
        onBack={logout}
        onTitle={() => setSwitchOpen(true)}
        onAvatar={() => setAvatarOpen(true)}
      />
      <MessageList />
      <Composer />

      <SwitchUserSheet open={switchOpen} onClose={() => setSwitchOpen(false)} />
      <AvatarSheet open={avatarOpen} onClose={() => setAvatarOpen(false)} />
    </>
  );
}
