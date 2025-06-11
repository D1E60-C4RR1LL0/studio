
"use client";

import type { ReactNode } from 'react';
import { AppShellProvider } from '@/components/app-shell';
import { CoordinationHeader } from '@/components/coordination-header';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  let activeIndex = 0;
  if (pathname.startsWith('/students')) {
    activeIndex = 0;
  } else if (pathname.startsWith('/institution-notifications')) {
    activeIndex = 1;
  } else if (pathname.startsWith('/student-notifications')) {
    activeIndex = 2;
  }
  // Add more conditions if other pages should influence activeIndex

  return (
    <AppShellProvider>
      <div className="p-4 md:p-6"> {/* Added padding here for CoordinationHeader */}
        <CoordinationHeader activeIndex={activeIndex} />
      </div>
      {children}
    </AppShellProvider>
  );
}
