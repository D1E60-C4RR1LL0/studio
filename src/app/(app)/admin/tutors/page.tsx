
"use client";

import { PageHeader } from "@/components/page-header";

export default function AdminTutorsPage() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="Gestión de Tutores"
        description="Administrar los tutores académicos."
      />
      <div className="mt-4">
        <p className="text-muted-foreground">CRUD para tutores - Próximamente...</p>
        {/* Aquí iría la tabla y formularios para Tutores */}
      </div>
    </div>
  );
}
