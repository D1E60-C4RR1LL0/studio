
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
      <header className="text-center mb-12">
        <GraduationCap className="w-24 h-24 text-primary mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-primary font-headline">Gestor de Prácticas</h1>
        <p className="text-xl text-muted-foreground mt-4">Optimiza y gestiona las prácticas de los estudiantes con facilidad.</p>
      </header>
      <main className="space-y-6">
        <section className="text-center">
          <p className="text-lg mb-6 max-w-md mx-auto">
            Bienvenido al Gestor de Prácticas. Accede a herramientas para el seguimiento de estudiantes, comunicación con instituciones y notificaciones.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/students">Entrar a la Aplicación</Link>
          </Button>
        </section>
      </main>
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Gestor de Prácticas. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
