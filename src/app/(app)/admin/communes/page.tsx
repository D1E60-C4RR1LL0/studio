
"use client";

import { PageHeader } from "@/components/page-header";

export default function AdminCommunesPage() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="Gestión de Comunas"
        description="Administrar las comunas disponibles en el sistema."
      />
      <div className="mt-4">
        <p className="text-muted-foreground">CRUD para comunas - Próximamente...</p>
        {/* Aquí iría la tabla y formularios para Comunas */}
      </div>
    </div>
  );
}
