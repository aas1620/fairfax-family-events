'use client';

import { SavedEventsProvider } from '@/lib/savedEvents';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SavedEventsProvider>
      {children}
    </SavedEventsProvider>
  );
}
