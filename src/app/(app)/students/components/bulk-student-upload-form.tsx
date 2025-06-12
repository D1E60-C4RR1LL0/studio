
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, XCircle, CheckCircle, Loader2 } from "lucide-react";
import type { Student } from "@/lib/definitions";
import { saveStudent } from "@/lib/data"; // Assuming saveStudent can handle adding new students
import { studentFormSchema } from "./student-form-fields"; // For validation if needed

interface BulkStudentUploadFormProps {
  onUploadComplete: () => Promise<void>;
  onCancel: () => void;
}

// Very basic CSV parser
// Note: For robust CSV parsing, a library like PapaParse is recommended,
// but avoiding new dependencies due to potential install issues.
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r\n|\n/);
  if (lines.length < 2) return []; // Must have header and at least one data row

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
      console.warn(`Skipping line ${i+1} due to incorrect number of columns.`);
    }
  }
  return data;
}


export function BulkStudentUploadForm({ onUploadComplete, onCancel }: BulkStudentUploadFormProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [fileName, setFileName] = React.useState<string>("");
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
        setFileName(file.name);
      } else {
        toast({
          title: "Archivo no válido",
          description: "Por favor, seleccione un archivo .csv.",
          variant: "destructive",
        });
        setSelectedFile(null);
        setFileName("");
        event.target.value = ""; // Reset file input
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
        description: "Por favor, seleccione un archivo .csv para procesar.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const fileText = await selectedFile.text();
      const parsedData = parseCSV(fileText);

      if (parsedData.length === 0) {
        toast({
          title: "Archivo CSV vacío o mal formado",
          description: "El archivo no contiene datos válidos o no tiene un encabezado correcto.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Define expected headers and their corresponding Student object keys
      // This mapping is crucial for converting CSV row to Student object
      const headerMapping: Record<string, keyof Omit<Student, 'id'>> = {
        'rut': 'rut',
        'firstName': 'firstName',
        'lastNamePaternal': 'lastNamePaternal',
        'lastNameMaternal': 'lastNameMaternal',
        'email': 'email',
        'career': 'career',
        'commune': 'commune',
        'tutor': 'tutor',
        'practicumLevel': 'practicumLevel',
        'specialConditions': 'specialConditions',
        'location': 'location' // location might be same as commune if not specified
      };

      for (const row of parsedData) {
        const studentData: Partial<Omit<Student, 'id'>> = {};
        let validRow = true;

        for (const csvHeader in headerMapping) {
          if (row[csvHeader] !== undefined) {
            const studentKey = headerMapping[csvHeader];
            studentData[studentKey] = row[csvHeader];
          }
        }
        
        // Ensure required fields based on studentFormSchema (excluding RUT for this check as it's complex)
        if (!studentData.firstName || !studentData.lastNamePaternal || !studentData.lastNameMaternal || !studentData.email || !studentData.career || !studentData.practicumLevel) {
            errors.push(`Faltan campos requeridos en una fila: ${JSON.stringify(row)}`);
            errorCount++;
            continue;
        }
        
        // Validate RUT separately before formatting
        const cleanedRut = (studentData.rut || "").replace(/\./g, "").replace(/-/g, "").toUpperCase();
        if (!/^\d{7,8}[\dkK]$/.test(cleanedRut)) {
            errors.push(`RUT inválido en fila: ${studentData.rut} -> ${JSON.stringify(row)}`);
            errorCount++;
            continue;
        }
        
        // Format RUT
        const body = cleanedRut.slice(0, -1);
        const verifier = cleanedRut.slice(-1);
        let formattedRut = "";
        if (body.length === 8) { 
            formattedRut = `${body.substring(0, 2)}.${body.substring(2, 5)}.${body.substring(5, 8)}-${verifier}`;
        } else if (body.length === 7) {
            formattedRut = `${body.substring(0, 1)}.${body.substring(1, 4)}.${body.substring(4, 7)}-${verifier}`;
        } else {
             errors.push(`RUT con formato inesperado: ${studentData.rut} -> ${JSON.stringify(row)}`);
            errorCount++;
            continue;
        }
        studentData.rut = formattedRut;


        // Add default location if not provided, based on commune
        if (!studentData.location && studentData.commune) {
            studentData.location = studentData.commune;
        }


        try {
          // Attempt to save the student. saveStudent should handle ID generation.
          // Make sure all required fields of Student (except id) are present.
          await saveStudent(studentData as Omit<Student, 'id'>);
          successCount++;
        } catch (e) {
          console.error("Error guardando estudiante desde CSV:", e, studentData);
          errors.push(`Error al guardar: ${studentData.rut} - ${(e as Error).message}`);
          errorCount++;
        }
      }

      toast({
        title: "Procesamiento de CSV Completado",
        description: `${successCount} estudiantes agregados. ${errorCount} filas con errores.`,
        variant: successCount > 0 && errorCount === 0 ? "default" : (errorCount > 0 ? "destructive" : "default"),
      });

      if (errors.length > 0) {
        console.warn("Errores durante la carga masiva:", errors);
        // Optionally, display these errors more prominently to the user
      }

      await onUploadComplete();
    } catch (error) {
      console.error("Error procesando el archivo CSV:", error);
      toast({
        title: "Error al procesar archivo",
        description: "No se pudo leer o procesar el archivo CSV.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedFile(null);
      setFileName("");
      // Reset the file input visually if possible (though this is tricky with controlled inputs)
      const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Cargar Estudiantes desde CSV</CardTitle>
        <CardDescription>
          Seleccione un archivo .csv para agregar múltiples estudiantes.
          Asegúrese de que el archivo tenga las siguientes columnas en el encabezado (el orden no importa, pero los nombres deben coincidir):
          <code className="block bg-muted p-2 rounded-md my-2 text-xs">
            rut,firstName,lastNamePaternal,lastNameMaternal,email,career,commune,tutor,practicumLevel,specialConditions,location
          </code>
          El campo `location` es opcional; si no se provee, se usará el valor de `commune`. Los demás campos opcionales de la ficha del alumno (tutor, specialConditions, commune) pueden dejarse vacíos en el CSV.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="csv-file-input">Archivo CSV</Label>
          <Input
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            disabled={isProcessing}
          />
          {fileName && <p className="text-sm text-muted-foreground mt-2">Archivo seleccionado: {fileName}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-start gap-4 pt-4">
        <Button
          onClick={handleProcessFile}
          disabled={!selectedFile || isProcessing}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="mr-2 h-4 w-4" />
          )}
          {isProcessing ? "Procesando..." : "Procesar archivo CSV"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
          <XCircle className="mr-2 h-4 w-4" /> Cancelar
        </Button>
      </CardFooter>
    </Card>
  );
}

