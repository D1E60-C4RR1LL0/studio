
"use client";

import { PageHeader } from "@/components/page-header";

export default function AdminInstitutionsPage() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="Gestión de Establecimientos"
        description="Administrar los establecimientos educativos asociados."
      />
      <div className="mt-4">
        <p className="text-muted-foreground">CRUD para establecimientos - Próximamente...</p>
        {/* Aquí iría la tabla y formularios para Establecimientos */}
      </div>
    </div>
  );
}
