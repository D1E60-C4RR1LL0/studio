"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Upload, Trash2 } from "lucide-react";

// ✅ Props que recibe el componente
interface BulkDataUploadFormProps {
  onFileProcessed: () => Promise<void>;
  onDatabaseEmptied: () => Promise<void>;
}

export function BulkDataUploadForm({
  onFileProcessed,
  onDatabaseEmptied,
}: BulkDataUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsUploading(true);

    if (!selectedFile) {
      toast({
        title: "Archivo no seleccionado",
        description: "Por favor, seleccione un archivo antes de continuar.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:8000/api/v1/carga_masiva", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al procesar el archivo.");
      }

      toast({
        title: "Carga Exitosa",
        description: "Los datos se han procesado correctamente.",
      });

      await onFileProcessed?.(); // ✅ Notificar al componente padre
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Error al cargar",
        description: "Hubo un problema al cargar el archivo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEmptyDatabase = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/carga_masiva/vaciadoDB", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al vaciar la base de datos");

      toast({
        title: "Base de Datos Vaciada",
        description: "Todos los registros han sido eliminados.",
      });

      await onDatabaseEmptied?.(); // ✅ Notificar al componente padre
    } catch (error) {
      toast({
        title: "Error al vaciar",
        description: "Hubo un problema al vaciar la base de datos.",
        variant: "destructive",
      });
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="file"
        accept=".xlsx"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        disabled={isUploading}
      />

      <div className="flex gap-4">
        <Button type="submit" disabled={isUploading}>
          <Upload className="mr-2 h-4 w-4" /> Procesar Archivo
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={() => setIsConfirmDialogOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Vaciar Base de Datos
        </Button>
      </div>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todos los datos cargados previamente.
              ¿Desea continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEmptyDatabase}>
              Vaciar Base de Datos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
