
"use client";

import type { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';
import { CoordinationHeader } from '@/components/coordination-header';
import { usePathname } from 'next/navigation';
import { STAGES, STAGE_PATHS } from '@/hooks/usePracticumProgress'; // Import STAGES

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  let activeIndex: typeof STAGES[keyof typeof STAGES] = STAGES.STUDENT_SELECTION; // Default to first stage

  if (pathname.startsWith(STAGE_PATHS[STAGES.STUDENT_SELECTION])) {
    activeIndex = STAGES.STUDENT_SELECTION;
  } else if (pathname.startsWith(STAGE_PATHS[STAGES.INSTITUTION_NOTIFICATION])) {
    activeIndex = STAGES.INSTITUTION_NOTIFICATION;
  } else if (pathname.startsWith(STAGE_PATHS[STAGES.STUDENT_NOTIFICATION])) {
    activeIndex = STAGES.STUDENT_NOTIFICATION;
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6">
        <CoordinationHeader activeIndex={activeIndex} />
        {children}
      </div>
    </AppShell>
  );
}
