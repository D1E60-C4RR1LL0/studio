
"use client";

import { PageHeader } from "@/components/page-header";

export default function AdminDirectorsPage() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="Gestión de Directivos"
        description="Administrar los contactos directivos de las instituciones."
      />
      <div className="mt-4">
        <p className="text-muted-foreground">CRUD para directivos - Próximamente...</p>
        {/* Aquí iría la tabla y formularios para Directivos */}
      </div>
    </div>
  );
}
