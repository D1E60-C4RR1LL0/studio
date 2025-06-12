
"use client";

import type { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';
import { CoordinationHeader } from '@/components/coordination-header';
import { usePathname } from 'next/navigation';
import { STAGES, STAGE_PATHS } from '@/hooks/usePracticumProgress';

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  let activeIndex: typeof STAGES[keyof typeof STAGES] = STAGES.STUDENT_SELECTION; // Default
  let showCoordinationHeader = false;

  const coordinationPaths = [
    STAGE_PATHS[STAGES.STUDENT_SELECTION],
    STAGE_PATHS[STAGES.INSTITUTION_NOTIFICATION],
    STAGE_PATHS[STAGES.STUDENT_NOTIFICATION],
  ];

  // Determine if the current path is one of the student workflow stages
  if (pathname.startsWith(STAGE_PATHS[STAGES.STUDENT_SELECTION])) {
    activeIndex = STAGES.STUDENT_SELECTION;
    showCoordinationHeader = true;
  } else if (pathname.startsWith(STAGE_PATHS[STAGES.INSTITUTION_NOTIFICATION])) {
    activeIndex = STAGES.INSTITUTION_NOTIFICATION;
    showCoordinationHeader = true;
  } else if (pathname.startsWith(STAGE_PATHS[STAGES.STUDENT_NOTIFICATION])) {
    activeIndex = STAGES.STUDENT_NOTIFICATION;
    showCoordinationHeader = true;
  }
  
  // Ensure /students exactly matches, not /students-management
  if (pathname === STAGE_PATHS[STAGES.STUDENT_SELECTION]) {
    activeIndex = STAGES.STUDENT_SELECTION;
    showCoordinationHeader = true;
  } else if (!coordinationPaths.some(p => pathname.startsWith(p) && p !== STAGE_PATHS[STAGES.STUDENT_SELECTION])) {
    // If it's not starting with other coordination paths (excluding /students itself if it's a more specific path like /students-management)
    // and it's not exactly /students, then don't show the header
    if (pathname !== STAGE_PATHS[STAGES.STUDENT_SELECTION]) {
        showCoordinationHeader = false;
    }
  }


  return (
    <AppShell>
      <div className="p-4 md:p-6">
        {showCoordinationHeader && <CoordinationHeader activeIndex={activeIndex} />}
        {children}
      </div>
    </AppShell>
  );
}
