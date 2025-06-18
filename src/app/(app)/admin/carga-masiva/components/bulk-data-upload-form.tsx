
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, XCircle, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { deleteAllData } from "@/lib/data"; 
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


interface BulkDataUploadFormProps {
  onFileProcessed: () => Promise<void>;
  onDatabaseEmptied: () => Promise<void>;
  // onCancel: () => void; // No longer needed if it's a dedicated page
}


export function BulkDataUploadForm({ onFileProcessed, onDatabaseEmptied }: BulkDataUploadFormProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [fileName, setFileName] = React.useState<string>("");
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const validExcelTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel" // .xls
      ];
      if (validExcelTypes.includes(file.type) || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        setSelectedFile(file);
        setFileName(file.name);
      } else {
        toast({
          title: "Archivo no válido",
          description: "Por favor, seleccione un archivo Excel (.xlsx o .xls).",
          variant: "destructive",
        });
        setSelectedFile(null);
        setFileName("");
        event.target.value = ""; 
      }
    } else {
      setSelectedFile(null);
      setFileName("");
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) {
      toast({
        title: "No hay archivo seleccionado",
        description: "Por favor, seleccione un archivo Excel para procesar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    toast({
        title: "Procesamiento Simulado",
        description: "La carga de archivos Excel está en modo de simulación. No se procesarán datos reales del archivo.",
        variant: "default",
    });
    
    let successCount = 0;
    // Simulate some delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Procesamiento de Excel Completado (Simulado)",
      description: `${successCount} registros procesados desde el archivo (simulación). La base de datos se actualizaría si el procesamiento fuera real.`,
      variant: "default",
    });
    
    await onFileProcessed(); 
    setIsProcessing(false);
    setSelectedFile(null);
    setFileName("");
    const fileInput = document.getElementById('excel-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEmptyDatabaseRequest = () => {
    setIsAlertOpen(true);
  };

  const confirmEmptyDatabase = async () => {
    setIsProcessing(true);
    try {
      await deleteAllData(); // Use the generalized delete function
      toast({
        title: "Base de Datos Vaciada",
        description: "Todos los datos (simulados: estudiantes e instituciones) han sido eliminados exitosamente.",
        variant: "default",
      });
      await onDatabaseEmptied();
    } catch (error) {
      console.error("Error vaciando la base de datos:", error);
      toast({
        title: "Error al Vaciar Base de Datos",
        description: "No se pudo completar la operación.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsAlertOpen(false);
    }
  };


  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Cargar Datos desde Excel</CardTitle>
          <CardDescription>
            Seleccione la plantilla de carga masiva (archivo Excel) con la información correspondiente para actualizar la base de datos.
            <br />
            Asegúrese de que el archivo tenga la estructura y columnas definidas en la plantilla oficial proporcionada.
            <br />
            <strong>Nota:</strong> La funcionalidad de vaciar la base de datos eliminará TODOS los datos existentes (estudiantes, instituciones, etc.). Úsela con extrema precaución.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="excel-file-input">Archivo Excel (.xlsx, .xls)</Label>
            <Input
              id="excel-file-input"
              type="file"
              accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              disabled={isProcessing}
            />
            {fileName && <p className="text-sm text-muted-foreground mt-2">Archivo seleccionado: {fileName}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-start items-stretch sm:items-center gap-4 pt-4">
          <Button
            onClick={handleEmptyDatabaseRequest}
            variant="destructive"
            className="w-full sm:w-auto"
            disabled={isProcessing}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Vaciar Base de Datos Completa
          </Button>
          <Button
            onClick={handleProcessFile}
            disabled={!selectedFile || isProcessing}
            className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
          >
            {isProcessing && selectedFile ? ( 
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            {isProcessing && selectedFile ? "Procesando..." : "Procesar archivo Excel"}
          </Button>
          {/* Cancel button might not be needed if this is a dedicated page, or it could navigate back to a dashboard */}
          {/* <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing} className="w-full sm:w-auto">
            <XCircle className="mr-2 h-4 w-4" /> Cancelar
          </Button> */}
        </CardFooter>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
                ¿Está absolutamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará permanentemente TODOS LOS DATOS de la base de datos (incluyendo estudiantes, establecimientos, etc.).
              No podrá deshacer esta acción. 
              <br /><br />
              <strong>¿Desea continuar y vaciar TODA la base de datos?</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)} disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEmptyDatabase}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, vaciar TODA la base de datos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
