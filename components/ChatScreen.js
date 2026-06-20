'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { USER_IDS } from '@/lib/users';
import NavBar from './NavBar';
import MessageList from './MessageList';
import Composer from './Composer';
import SwitchUserSheet from './SwitchUserSheet';
import AvatarSheet from './AvatarSheet';

export default function ChatScreen() {
  const { logout } = useStore();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <>
      <NavBar
        memberIds={USER_IDS}
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
