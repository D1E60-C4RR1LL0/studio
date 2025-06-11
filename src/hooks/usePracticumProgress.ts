
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname }  from 'next/navigation';

const PRACTICUM_PROGRESS_KEY = 'practicumMaxAccessLevel';

export const STAGES = {
  STUDENT_SELECTION: 0,
  INSTITUTION_NOTIFICATION: 1,
  STUDENT_NOTIFICATION: 2,
} as const;

export type StageKeys = keyof typeof STAGES;
export type StageValues = typeof STAGES[StageKeys];

export const STAGE_PATHS: Record<StageValues, string> = {
  [STAGES.STUDENT_SELECTION]: '/students',
  [STAGES.INSTITUTION_NOTIFICATION]: '/institution-notifications',
  [STAGES.STUDENT_NOTIFICATION]: '/student-notifications',
};

export function usePracticumProgress() {
  const [maxAccessLevel, setMaxAccessLevel] = useState<StageValues>(STAGES.STUDENT_SELECTION);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedLevelString = localStorage.getItem(PRACTICUM_PROGRESS_KEY);
    let initialLevel: StageValues = STAGES.STUDENT_SELECTION;
    if (storedLevelString) {
        const storedLevelNumber = parseInt(storedLevelString, 10);
        if (Object.values(STAGES).includes(storedLevelNumber as StageValues)) {
            initialLevel = storedLevelNumber as StageValues;
        }
    }
    setMaxAccessLevel(initialLevel);
    setIsLoadingProgress(false);
  }, []);

  useEffect(() => {
    if (isLoadingProgress) return;

    const currentStageIndex = (Object.keys(STAGE_PATHS) as unknown as StageValues[]).find(
        (key: StageValues) => pathname.startsWith(STAGE_PATHS[key])
    );
    
    if (currentStageIndex !== undefined && currentStageIndex > maxAccessLevel) {
      router.replace(STAGE_PATHS[maxAccessLevel]);
    }
  }, [pathname, maxAccessLevel, isLoadingProgress, router]);

  const advanceStage = useCallback((newLevel: StageValues) => {
    if (newLevel > maxAccessLevel) {
      setMaxAccessLevel(newLevel);
      localStorage.setItem(PRACTICUM_PROGRESS_KEY, newLevel.toString());
    }
  }, [maxAccessLevel]);

  const resetProgress = useCallback(() => {
      setMaxAccessLevel(STAGES.STUDENT_SELECTION);
      localStorage.setItem(PRACTICUM_PROGRESS_KEY, STAGES.STUDENT_SELECTION.toString());
      if (pathname !== STAGE_PATHS[STAGES.STUDENT_SELECTION]) {
        router.push(STAGE_PATHS[STAGES.STUDENT_SELECTION]);
      }
  }, [router, pathname]);


  return { maxAccessLevel, advanceStage, isLoadingProgress, STAGES, STAGE_PATHS, resetProgress };
}
