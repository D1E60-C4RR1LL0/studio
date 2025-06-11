
"use client";

import * as React from "react";
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
  onClick?: (e: React.MouseEvent) => void;
}

function Step({ icon: Icon, title, description, isActive, isVisuallyCompletedForIcon, isLocked, href, onClick }: StepProps) {
  const content = (
    <>
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full mb-2 transition-colors",
        isActive ? "bg-primary text-primary-foreground" :
        isLocked ? "bg-muted text-muted-foreground" :
        isVisuallyCompletedForIcon ? "bg-primary text-primary-foreground" : // Completed uses primary style
        "bg-secondary text-secondary-foreground group-hover:bg-muted"
      )}>
        {isLocked ? <Lock className="w-6 h-6" /> : 
         (isVisuallyCompletedForIcon ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />)}
      </div>
      <h3 className={cn("font-semibold text-sm md:text-base", isLocked && "text-muted-foreground")}>{title}</h3>
      <p className={cn("text-xs md:text-sm", isLocked && "text-muted-foreground")}>{description}</p>
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
      isActive ? "text-primary" : 
      isVisuallyCompletedForIcon ? "text-primary" : // Completed text also primary
      "text-muted-foreground hover:text-foreground/80"
    )} onClick={onClick}>
      {content}
    </Link>
  );
}

interface CoordinationHeaderProps {
  activeIndex: number; // This is StageValues from STAGES
}

const stepsData = [
  { href: "/students", icon: Users, title: "Selección de estudiantes", description: "Seleccione los estudiantes para la práctica", stage: STAGES.STUDENT_SELECTION },
  { href: "/institution-notifications", icon: Building2, title: "Notificación establecimiento", description: "Envío de lista al centro de práctica", stage: STAGES.INSTITUTION_NOTIFICATION },
  { href: "/student-notifications", icon: UserIcon, title: "Notificación a estudiantes", description: "Aviso a alumnos seleccionados", stage: STAGES.STUDENT_NOTIFICATION },
];

export function CoordinationHeader({ activeIndex }: CoordinationHeaderProps) {
  const { maxAccessLevel, isLoadingProgress } = usePracticumProgress();
  const { toast } = useToast();

  if (isLoadingProgress) {
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center text-foreground mb-8">
          Coordinación de Prácticas Pedagógicas
        </h1>
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-8 relative">
          {stepsData.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center text-center md:flex-1 md:items-start md:text-left p-2 -m-2">
                <Skeleton className="w-12 h-12 rounded-full mb-2" />
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full md:w-5/6" />
              </div>
               {index < stepsData.length - 1 && (
                <>
                  <div className="hidden md:block h-px w-full bg-border absolute top-6 left-[calc(33.33%_*_(${index}_+_0.5))] z-[-1]" style={{ transform: 'translateX(-50%)' }}></div>
                  <div className="md:hidden w-px h-8 bg-border my-2 self-center"></div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-center text-foreground mb-8">
        Coordinación de Prácticas Pedagógicas
      </h1>
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-8 relative">
        {stepsData.map((step, index) => {
          const stepIsActive = step.stage === activeIndex;
          const stepIsVisuallyCompletedForIcon = step.stage < maxAccessLevel;
          const isLocked = step.stage > maxAccessLevel;
          
          return (
            <React.Fragment key={step.href}>
              <Step
                href={step.href}
                icon={step.icon}
                title={step.title}
                description={step.description}
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
              {index < stepsData.length - 1 && (
                 <>
                  <div className="hidden md:block h-px w-full bg-border absolute top-6 left-[calc(33.33%_*_(${index}_+_0.5))] z-[-1]" style={{ transform: 'translateX(-50%)' }}></div>
                  <div className="md:hidden w-px h-8 bg-border my-2 self-center"></div>
                 </>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
