
"use client";

import Link from "next/link";
import { GraduationCap, Settings, LogOut, Home, MapPin, Landmark, NotebookText, Contact2, UserCog, UserCircle, LayoutDashboard, Users, DatabaseZap, FileText, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Helper component to handle active state for sidebar menu items
function AppSidebarMenuButton({ href, tooltip, children, icon: Icon }: { href: string, tooltip: string, children: ReactNode, icon: React.ElementType }) {
  const pathname = usePathname();
  // More specific active check: exact match or prefix match if not a base student/bulk path.
  let isActive = pathname === href;
  if (href !== "/" && !href.startsWith("/students") && href !== "/admin/bulk-upload" && href !== "/admin/templates" && href !== "/admin/students-management" && pathname.startsWith(href)) {
    isActive = true;
  }


  const { state: sidebarState } = useSidebar(); // Get sidebar state for tooltip visibility

  // Special case for /students to avoid matching /student-notifications
  let finalIsActive = isActive;
  if (href === "/students") { // This is for the coordination flow
    finalIsActive = pathname.startsWith("/students") || pathname.startsWith("/institution-notifications") || pathname.startsWith("/student-notifications");
  }
  if (href === "/admin/students-management") { // This is for the CRUD
    finalIsActive = pathname === "/admin/students-management";
  }
  if (href === "/admin/bulk-upload") {
    finalIsActive = pathname === "/admin/bulk-upload";
  }
  if (href === "/admin/templates") {
    finalIsActive = pathname === "/admin/templates";
  }


  return (
    <SidebarMenuItem>
      <Link href={href}>
        <SidebarMenuButton
          isActive={finalIsActive}
          tooltip={sidebarState === 'collapsed' ? tooltip : undefined}
          asChild={false} 
          className="flex items-center gap-2"
        >
          <Icon className="h-5 w-5" />
          <span className={cn(sidebarState === 'collapsed' && "sr-only")}>{children}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}


export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="border-r">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 group">
            <GraduationCap className="h-8 w-8 text-sidebar-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-semibold text-sidebar-foreground font-headline group-data-[collapsible=icon]:hidden">
              GestorPrácticas
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <AppSidebarMenuButton href="/students" tooltip="Coordinación de Prácticas" icon={Route}>
              Coordinación Prácticas
            </AppSidebarMenuButton>
             <AppSidebarMenuButton href="/admin/students-management" tooltip="Gestión de Alumnos" icon={Users}>
              Gestión de Alumnos
            </AppSidebarMenuButton>
            <AppSidebarMenuButton href="/admin/institutions" tooltip="Establecimientos" icon={Landmark}>
              Establecimientos
            </AppSidebarMenuButton>
            <AppSidebarMenuButton href="/admin/communes" tooltip="Comunas" icon={MapPin}>
              Comunas
            </AppSidebarMenuButton>
            <AppSidebarMenuButton href="/admin/careers" tooltip="Carreras" icon={NotebookText}>
              Carreras
            </AppSidebarMenuButton>
            <AppSidebarMenuButton href="/admin/tutors" tooltip="Tutores" icon={Contact2}>
              Tutores
            </AppSidebarMenuButton>
             <AppSidebarMenuButton href="/admin/directors" tooltip="Directivos" icon={UserCog}>
              Directivos
            </AppSidebarMenuButton>
            <AppSidebarMenuButton href="/admin/bulk-upload" tooltip="Carga Masiva" icon={DatabaseZap}>
              Carga Masiva
            </AppSidebarMenuButton>
            <AppSidebarMenuButton href="/admin/templates" tooltip="Plantillas" icon={FileText}>
              Plantillas
            </AppSidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton className="w-full flex items-center gap-2">
                    <LogOut className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex min-h-screen w-full flex-col bg-background">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
            {/* Left: Sidebar Toggle and Branding (Branding hidden if sidebar is visible and expanded) */}
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" /> {/* Hidden on md and up, sidebar rail handles it */}
               <Link href="/" className="flex items-center gap-2 group md:hidden">
                <GraduationCap className="h-7 w-7 text-primary"/>
                <h1 className="text-lg font-semibold text-foreground font-headline">GestorPrácticas</h1>
              </Link>
            </div>

            {/* Right: User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="Avatar de Usuario" data-ai-hint="person avatar"/>
                    <AvatarFallback>GU</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Ir a Inicio
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
