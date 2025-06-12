
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { BulkDataUploadForm } from "./components/bulk-data-upload-form"; // Adjusted path
import { useToast } from "@/hooks/use-toast";
// No need to import student data functions here unless this page itself shows data

export default function BulkUploadPage() {
  const { toast } = useToast();

  // These handlers are now simplified as the form is on its own page.
  // They primarily exist to fulfill the prop contract of BulkDataUploadForm
  // and can be used to show global messages if needed, separate from the form's internal toasts.
  const handleFileProcessed = async () => {
    // This could be a place to trigger a global notification or a refresh
    // of some dashboard if one existed, but for now, it's mainly for the form's internal logic.
    toast({
      title: "Archivo Procesado (Simulado)",
      description: "La información de la carga masiva se habría actualizado en la base de datos.",
      variant: "default",
    });
  };
  
  const handleDatabaseEmptied = async () => {
    // Similar to above, could trigger global actions.
    toast({
      title: "Base de Datos Vaciada (Simulado)",
      description: "Todos los datos han sido eliminados.",
      variant: "default",
    });
  };

  return (
    <div className="p-4 md:p-6">
      <PageHeader 
        title="Carga Masiva de Datos"
        description="Utilice esta sección para cargar datos desde una plantilla Excel y para gestionar la base de datos completa."
      />
      <div className="mt-6">
        <BulkDataUploadForm
          onFileProcessed={handleFileProcessed}
          onDatabaseEmptied={handleDatabaseEmptied}
          // onCancel is removed as it's a dedicated page
        />
      </div>
    </div>
  );
}
