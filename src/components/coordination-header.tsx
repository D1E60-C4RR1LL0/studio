
"use client";

import type { MouseEvent } from "react";
import React from "react";
import Link from "next/link";
import { Users, Building2, User as UserIcon, CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePracticumProgress, STAGES } from "@/hooks/usePracticumProgress";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";


interface StepProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isActive?: boolean;
  isVisuallyCompletedForIcon?: boolean;
  isLocked?: boolean;
  href: string;
  onClick?: (e: MouseEvent) => void;
}

function Step({ icon: Icon, title, description, isActive, isVisuallyCompletedForIcon, isLocked, href, onClick }: StepProps) {
  const content = (
    <>
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full mb-2 transition-colors",
        isActive ? "bg-primary text-primary-foreground" :
        isLocked ? "bg-muted text-muted-foreground" :
        isVisuallyCompletedForIcon ? "bg-primary text-primary-foreground" :
        "bg-secondary text-secondary-foreground group-hover:bg-muted"
      )}>
        {isLocked ? <Lock className="w-6 h-6" /> : 
         (isVisuallyCompletedForIcon ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />)}
      </div>
      <h3 className={cn("font-semibold text-sm md:text-base", isActive && !isLocked ? "text-primary" : isLocked ? "text-muted-foreground" : "")}>{title}</h3>
      <p className={cn("text-xs md:text-sm", isLocked ? "text-muted-foreground" : "text-muted-foreground group-hover:text-foreground/80")}>{description}</p>
    </>
  );

  if (isLocked) {
    return (
      <div
        className={cn(
          "flex flex-col items-center text-center md:flex-1 md:items-start md:text-left relative group cursor-not-allowed opacity-70",
          "p-2 -m-2"
        )}
        onClick={onClick}
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={cn(
      "flex flex-col items-center text-center md:flex-1 md:items-start md:text-left relative group",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-2 -m-2",
       (isActive || isVisuallyCompletedForIcon) && !isLocked ? "text-primary" : "text-foreground"
    )} onClick={onClick}>
      {content}
    </Link>
  );
}

interface CoordinationHeaderProps {
  activeIndex: number;
}

const stepsData = [
  { href: "/students", icon: Users, title: "Selección de estudiantes", description: "Seleccione los estudiantes para la práctica", stage: STAGES.STUDENT_SELECTION },
  { href: "/institution-notifications", icon: Building2, title: "Notificación establecimiento", description: "Envío de lista al centro de práctica", stage: STAGES.INSTITUTION_NOTIFICATION },
  { href: "/student-notifications", icon: UserIcon, title: "Notificación a estudiantes", description: "Aviso a alumnos seleccionados", stage: STAGES.STUDENT_NOTIFICATION },
];

export function CoordinationHeader({ activeIndex }: CoordinationHeaderProps) {
  const { maxAccessLevel, isLoadingProgress } = usePracticumProgress();
  const { toast } = useToast();
  // const numSteps = stepsData.length; // No longer needed for line calculation

  if (isLoadingProgress) {
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center text-foreground mb-8">
          Coordinación de Prácticas Pedagógicas
        </h1>
        <div className="flex justify-center">
          <div className="relative flex flex-col md:inline-flex md:flex-row items-stretch md:items-start gap-6 md:gap-8">
            {stepsData.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center text-center md:flex-1 md:items-start md:text-left p-2 -m-2">
                  <Skeleton className="w-12 h-12 rounded-full mb-2" />
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-full md:w-5/6" />
                </div>
                {/* Mobile separator skeleton (optional, if you had one before) */}
                {/* {index < stepsData.length - 1 && (
                  <div className="md:hidden w-px h-10 bg-border my-1 self-center"><Skeleton className="h-full w-full"/></div>
                )} */}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-center text-foreground mb-8">
        Coordinación de Prácticas Pedagógicas
      </h1>
      <div className="flex justify-center">
        <div className="relative flex flex-col md:inline-flex md:flex-row items-stretch md:items-start gap-6 md:gap-16"> {/* Increased gap for desktop */}
          {stepsData.map((currentStep) => {
            const stepIsActive = currentStep.stage === activeIndex;
            const stepIsVisuallyCompletedForIcon = currentStep.stage < maxAccessLevel;
            const isLocked = currentStep.stage > maxAccessLevel;
            
            return (
              <React.Fragment key={currentStep.href}>
                <Step
                  href={currentStep.href}
                  icon={currentStep.icon}
                  title={currentStep.title}
                  description={currentStep.description}
                  isActive={stepIsActive}
                  isVisuallyCompletedForIcon={stepIsVisuallyCompletedForIcon}
                  isLocked={isLocked}
                  onClick={(e) => {
                    if (isLocked) {
                      e.preventDefault();
                      toast({ 
                          title: "Paso Bloqueado", 
                          description: "Debes completar los pasos anteriores para acceder a esta sección.",
                          variant: "destructive"
                      });
                    }
                  }}
                />
                {/* Lines have been removed */}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

