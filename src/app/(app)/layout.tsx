import type { ReactNode } from 'react';
import { AppShellProvider } from '@/components/app-shell';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShellProvider>{children}</AppShellProvider>;
}
