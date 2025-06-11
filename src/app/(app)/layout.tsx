
"use client";

import type { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';
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

  return (
    <AppShell>
      <div className="p-4 md:p-6"> {/* Padding for CoordinationHeader and subsequent page content */}
        <CoordinationHeader activeIndex={activeIndex} />
        {children}
      </div>
    </AppShell>
  );
}

