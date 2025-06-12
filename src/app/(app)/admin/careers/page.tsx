
"use client";

import { PageHeader } from "@/components/page-header";

export default function AdminCareersPage() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="Gestión de Carreras"
        description="Administrar las carreras ofrecidas."
      />
      <div className="mt-4">
        <p className="text-muted-foreground">CRUD para carreras - Próximamente...</p>
        {/* Aquí iría la tabla y formularios para Carreras */}
      </div>
    </div>
  );
}
