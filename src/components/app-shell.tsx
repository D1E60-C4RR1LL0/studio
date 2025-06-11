
"use client";

import Link from "next/link";
import { GraduationCap, Settings, LogOut, Home } from "lucide-react";
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

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground sm:px-6">
        {/* Left: Branding */}
        <Link href="/" className="flex items-center gap-2 group">
          <GraduationCap className="h-8 w-8 text-sidebar-primary transition-transform group-hover:scale-110" />
          <h1 className="text-xl font-semibold text-sidebar-foreground font-headline">Gestor de Prácticas</h1>
        </Link>

        {/* Right: User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {/* Using a Button for better accessibility and consistent styling for click targets */}
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-sidebar-accent focus-visible:ring-sidebar-ring">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://placehold.co/100x100.png" alt="Avatar de Usuario" data-ai-hint="person avatar"/>
                <AvatarFallback>GU</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-56"> {/* Uses default popover styling which respects app theme */}
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
      {/* CoordinationHeader and page-specific content are rendered as children by AppLayout */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
