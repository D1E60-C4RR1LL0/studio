
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

    // Leer el valor más reciente de localStorage, ya que el estado de React puede estar desfasado momentáneamente
    // después de una llamada a advanceStage antes de que router.push complete y este efecto se vuelva a ejecutar.
    const storedLevelString = localStorage.getItem(PRACTICUM_PROGRESS_KEY);
    let authoritativeMaxAccessLevel = maxAccessLevel; // Comenzar con el estado actual del hook

    if (storedLevelString) {
        const storedLevelNumber = parseInt(storedLevelString, 10);
        if (Object.values(STAGES).includes(storedLevelNumber as StageValues)) {
            // Si localStorage tiene un nivel más avanzado que el estado actual del hook,
            // (p.ej. advanceStage acaba de ejecutarse), usar el valor de localStorage para esta verificación.
            if (storedLevelNumber > authoritativeMaxAccessLevel) {
                authoritativeMaxAccessLevel = storedLevelNumber as StageValues;
            }
        }
    }

    const currentStagePath = Object.values(STAGE_PATHS).find(p => pathname.startsWith(p));
    let currentStageValue: StageValues | undefined;

    if (currentStagePath) {
      currentStageValue = (Object.keys(STAGES) as unknown as StageValues[]).find(
        (key: StageValues) => STAGE_PATHS[key] === currentStagePath
      );
    }
    
    // Si la ruta actual corresponde a una etapa y esa etapa es mayor que el nivel de acceso máximo autorizado (considerando localStorage),
    // redirigir al usuario a la última etapa a la que tiene acceso.
    if (currentStageValue !== undefined && currentStageValue > authoritativeMaxAccessLevel) {
      router.replace(STAGE_PATHS[authoritativeMaxAccessLevel]);
    }
  }, [pathname, maxAccessLevel, isLoadingProgress, router]); // maxAccessLevel sigue siendo dependencia para que el efecto se reevalue cuando el estado se actualice.

  const advanceStage = useCallback((newLevel: StageValues) => {
    // Solo actualiza si el nuevo nivel es realmente un avance
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
