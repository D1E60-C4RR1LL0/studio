
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, PanelLeft, Settings, LogOut, Home } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
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

// Main navigation items removed as per user request to use CoordinationHeader

export function AppShell({ children }: { children: ReactNode }) {
  const { state: sidebarState } = useSidebar();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 group">
            <GraduationCap className="h-8 w-8 text-sidebar-primary transition-transform group-hover:scale-110" />
            {sidebarState === "expanded" && (
              <h1 className="text-xl font-semibold text-sidebar-foreground font-headline">Gestor de Prácticas</h1>
            )}
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          {/* SidebarMenu with main nav items removed. Can be used for other links if needed in future. */}
          {/* <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.tooltip, side: "right", align: "center" }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu> */}
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border mt-auto"> {/* Added mt-auto */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center justify-start gap-2 w-full p-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="Avatar de Usuario" data-ai-hint="person avatar" />
                  <AvatarFallback>GU</AvatarFallback> {/* Gestor Usuario */}
                </Avatar>
                {sidebarState === "expanded" && (
                  <div className="text-left">
                    <p className="text-sm font-medium">Usuario Admin</p>
                    <p className="text-xs text-sidebar-foreground/70">admin@practicas.com</p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align={sidebarState === "expanded" ? "end" : "center"} className="w-56">
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
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col flex-1 w-full">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
            <div className="md:hidden">
              <SidebarTrigger><PanelLeft className="h-6 w-6" /></SidebarTrigger>
            </div>
            <div className="flex-1">
              {/* Breadcrumbs or current page title could go here */}
            </div>
          </header>
          <SidebarInset>
            <main className="flex-1 p-4 md:p-6 pt-0 md:pt-0 overflow-auto"> {/* Adjusted padding due to CoordinationHeader in layout */}
              {children}
            </main>
          </SidebarInset>
        </div>
    </div>
  );
}

export function AppShellProvider({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppShell>{children}</AppShell>
    </SidebarProvider>
  );
}
