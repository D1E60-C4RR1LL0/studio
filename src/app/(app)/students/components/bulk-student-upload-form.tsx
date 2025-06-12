
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, XCircle, Loader2, Trash2, AlertTriangle } from "lucide-react";
// import type { Student } from "@/lib/definitions"; // No longer needed for direct saveStudent
import { deleteAllStudents } from "@/lib/data"; 
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


interface BulkStudentUploadFormProps {
  onFileProcessed: () => Promise<void>;
  onDatabaseEmptied: () => Promise<void>;
  onCancel: () => void;
}

// Placeholder for Excel parsing logic
// Actual Excel parsing requires a library like SheetJS/xlsx or server-side processing.
// This function currently simulates processing and expects a very specific structure if used.
// For real Excel files, this would need to be replaced.
function parseExcelFileContents(fileText: string): Record<string, string>[] {
  console.warn(
    "Excel parsing is not fully implemented. This function is a placeholder." + 
    "It expects CSV-like content if any text is passed. For real .xlsx/.xls, use a library."
  );
  // Simulating a CSV parse for now if text content is somehow extracted
  const lines = fileText.trim().split(/\r\n|\n/);
  if (lines.length < 2) return []; 

  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    if (values.length === headers.length) {
      const entry: Record<string, string> = {};
      headers.forEach((header, index) => {
        entry[header] = values[index];
      });
      data.push(entry);
    } else {
      console.warn(`Skipping line ${i+1} due to incorrect number of columns (simulated CSV).`);
    }
  }
  return data;
}


export function BulkStudentUploadForm({ onFileProcessed, onDatabaseEmptied, onCancel }: BulkStudentUploadFormProps) {
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

    // --- SIMULATED PROCESSING ---
    // In a real scenario, you would read the Excel file here using a library like SheetJS (xlsx)
    // For now, we'll simulate adding a few dummy students or assume the file is empty for demo purposes.
    
    let successCount = 0;
    // Example: const dummyStudents = [ { rut: '11.111.111-1', firstName: 'Dummy', ... } ];
    // for (const studentData of dummyStudents) { ... await saveStudent(...); successCount++; }
    
    // Simulate some delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Procesamiento de Excel Completado (Simulado)",
      description: `${successCount} registros procesados desde el archivo (simulación).`,
      variant: "default",
    });
    // --- END SIMULATED PROCESSING ---
    
    // If actual parsing were implemented:
    /*
    try {
      // const fileBuffer = await selectedFile.arrayBuffer(); // For SheetJS
      // const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      // const sheetName = workbook.SheetNames[0];
      // const worksheet = workbook.Sheets[sheetName];
      // const jsonData = XLSX.utils.sheet_to_json(worksheet);
      // ... then process jsonData ...
    } catch (error) {
      // ... error handling ...
    }
    */

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
      await deleteAllStudents();
      toast({
        title: "Base de Datos Vaciada",
        description: "Todos los datos de estudiantes han sido eliminados exitosamente.",
        variant: "default",
      });
      await onDatabaseEmptied(); // Refresh data in parent, view remains the same
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
            Seleccione la plantilla de carga masiva (archivo Excel) con la información correspondiente.
            <br />
            Asegúrese de que el archivo tenga la estructura y columnas definidas en la plantilla oficial proporcionada.
            <br />
            <strong>Nota:</strong> La funcionalidad de vaciar la base de datos eliminará TODOS los datos de estudiantes existentes. Úsela con precaución.
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
            Vaciar Base de Datos
          </Button>
          <Button
            onClick={handleProcessFile}
            disabled={!selectedFile || isProcessing}
            className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
          >
            {isProcessing && selectedFile ? ( // Show loader only if processing a file
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            {isProcessing && selectedFile ? "Procesando..." : "Procesar archivo Excel"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing} className="w-full sm:w-auto">
            <XCircle className="mr-2 h-4 w-4" /> Cancelar
          </Button>
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
              Esta acción es irreversible y eliminará permanentemente TODOS los datos de los estudiantes de la base de datos.
              No podrá deshacer esta acción. 
              <br /><br />
              <strong>¿Desea continuar y vaciar la base de datos de estudiantes?</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)} disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEmptyDatabase}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, vaciar base de datos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

