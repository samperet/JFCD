'use client';

import { StoreProvider } from '@/lib/store';
import PhoneFrame from '@/components/PhoneFrame';
import App from '@/components/App';

export default function Page() {
  return (
    <main className="stage">
      <StoreProvider>
        <PhoneFrame>
          <App />
        </PhoneFrame>
      </StoreProvider>
    </main>
  );
}
