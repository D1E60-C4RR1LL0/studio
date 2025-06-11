
"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Building2, User as UserIcon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProps {
  icon: React.ElementType;
  title: string;
  description: string;
  isActive?: boolean;
  isCompleted?: boolean;
  href: string;
}

function Step({ icon: Icon, title, description, isActive, isCompleted, href }: StepProps) {
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center text-center md:flex-1 md:items-start md:text-left relative group",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-2 -m-2", // Focus styles
      (isActive || isCompleted) ? "text-primary" : "text-muted-foreground hover:text-foreground/80"
    )}>
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full mb-2 transition-colors",
        isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground group-hover:bg-muted"
      )}>
        {isCompleted && !isActive ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
      </div>
      <h3 className="font-semibold text-sm md:text-base">{title}</h3>
      <p className="text-xs md:text-sm">{description}</p>
    </Link>
  );
}

interface CoordinationHeaderProps {
  activeIndex: number;
}

const stepsData = [
  { href: "/students", icon: Users, title: "Selección de estudiantes", description: "Seleccione los estudiantes para la práctica" },
  { href: "/institution-notifications", icon: Building2, title: "Notificación establecimiento", description: "Envío de lista al centro de práctica" },
  { href: "/student-notifications", icon: UserIcon, title: "Notificación a estudiantes", description: "Aviso a alumnos seleccionados" },
];

export function CoordinationHeader({ activeIndex }: CoordinationHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-center text-foreground mb-8">
        Coordinación de Prácticas Pedagógicas
      </h1>
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-8 relative">
        {stepsData.map((step, index) => (
          <React.Fragment key={step.href}>
            <Step
              href={step.href}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isActive={index === activeIndex}
              isCompleted={index < activeIndex}
            />
            {index < stepsData.length - 1 && (
              <div className="hidden md:block h-px w-full bg-border absolute top-6 left-[calc(33.33%_*_(${index}_+_0.5))] z-[-1]" style={{ transform: 'translateX(-50%)' }}></div>
            )}
             {index < stepsData.length - 1 && (
                 <div className="md:hidden w-px h-8 bg-border my-2 self-center"></div>
             )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
