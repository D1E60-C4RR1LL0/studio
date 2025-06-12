
"use client";

import * as React from "react";
import type { Student } from "@/lib/definitions";
import { getStudents, saveStudent } from "@/lib/data";
import { StudentTable } from "./components/student-table";
import { AddStudentForm } from "./components/add-student-form";
import { EditStudentForm } from "./components/edit-student-form";
import { BulkStudentUploadForm } from "./components/bulk-student-upload-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Search, Edit3, Check, UserPlus, List, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { usePracticumProgress, STAGES, STAGE_PATHS } from '@/hooks/usePracticumProgress';

type ViewMode = "table" | "addForm" | "editForm" | "bulkUploadForm";
const CONFIRMED_STUDENT_IDS_KEY = 'confirmedPracticumStudentIds';

// Helper function to normalize RUTs by removing dots, hyphens, and converting to uppercase.
const normalizeRut = (rut: string | undefined): string => {
  if (!rut) return "";
  return rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
};

export default function StudentManagementPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [currentSearchInput, setCurrentSearchInput] = React.useState(""); // For live input
  const [searchTerm, setSearchTerm] = React.useState(""); // For triggered search
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [selectedStudentsForConfirmation, setSelectedStudentsForConfirmation] = React.useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");

  const { toast } = useToast();
  const router = useRouter();
  const { advanceStage, isLoadingProgress: isLoadingPracticumProgress } = usePracticumProgress();

  const loadStudentData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      toast({
        title: "Error al obtener estudiantes",
        description: "No se pudieron cargar los datos de los estudiantes. Intente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  // Effect for filtering students when searchTerm or the base students list changes
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents([]); // Keep table empty if no search term or search term is cleared
      return;
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const normalizedRutSearchTerm = normalizeRut(searchTerm); 

    const filteredData = students.filter(item => {
      const fullName = `${item.firstName} ${item.lastNamePaternal} ${item.lastNameMaternal}`.toLowerCase();
      const itemRutNormalized = normalizeRut(item.rut); 

      return (
        fullName.includes(lowercasedSearchTerm) ||
        item.rut.toLowerCase().includes(lowercasedSearchTerm) || 
        (normalizedRutSearchTerm.length > 0 && itemRutNormalized.includes(normalizedRutSearchTerm)) || 
        item.career.toLowerCase().includes(lowercasedSearchTerm) ||
        item.practicumLevel.toLowerCase().includes(lowercasedSearchTerm)
      );
    });
    setFilteredStudents(filteredData);
  }, [searchTerm, students]);
  
  const handleSaveStudent = async (studentToSave: Student | Omit<Student, 'id'>) => {
    try {
      const studentWithPossibleId = studentToSave as Partial<Student> & Omit<Student, 'id'>;
      const studentPayload: Student = studentWithPossibleId.id 
        ? studentWithPossibleId as Student
        : { ...studentWithPossibleId, id: `new-${Date.now()}-${Math.random().toString(36).substring(7)}` } as Student;

      const savedStudent = await saveStudent(studentPayload);
      
      await loadStudentData(); 
      
      toast({
        title: "Estudiante Guardado",
        description: `${savedStudent.firstName} ${savedStudent.lastNamePaternal} ha sido guardado exitosamente.`,
      });
      setViewMode('table'); 
      setSelectedStudentsForConfirmation(new Set());
      // Optionally clear search after saving to show an empty table or re-apply search if needed
      // setCurrentSearchInput(""); 
      // setSearchTerm(""); 
    } catch (error) {
       toast({
        title: "Error al guardar",
        description: "No se pudo guardar el estudiante.",
        variant: "destructive",
      });
    }
  };

  const handleBulkFileProcessed = async () => {
    await loadStudentData(); 
    setViewMode('table');
  };
  
  const handleDatabaseEmptied = async () => {
    await loadStudentData(); 
    // Stay in bulkUploadForm view
  };

  const handleTableSelectionChange = (studentId: string, isSelected: boolean) => {
    setSelectedStudentsForConfirmation(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (isSelected) {
        newSelected.add(studentId);
      } else {
        newSelected.delete(studentId);
      }
      return newSelected;
    });
  };
  
  const handleConfirmSelection = () => {
    if (selectedStudentsForConfirmation.size === 0) {
      toast({
        title: "Ningún estudiante seleccionado",
        description: "Por favor, seleccione al menos un estudiante para confirmar.",
        variant: "destructive",
      });
      return;
    }
    const selectedNames = students
        .filter(s => selectedStudentsForConfirmation.has(s.id))
        .map(s => `${s.firstName} ${s.lastNamePaternal}`)
        .join(', ');

    if (typeof window !== 'undefined') {
        localStorage.setItem(CONFIRMED_STUDENT_IDS_KEY, JSON.stringify(Array.from(selectedStudentsForConfirmation)));
    }

    toast({
      title: "Selección Confirmada",
      description: `Estudiantes seleccionados: ${selectedNames}. Avanzando al siguiente paso.`,
    });
    
    advanceStage(STAGES.INSTITUTION_NOTIFICATION);
    router.push(STAGE_PATHS[STAGES.INSTITUTION_NOTIFICATION]);
  };

  const handleSearchAction = () => {
    setSearchTerm(currentSearchInput);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchAction();
    }
  };
  
  const pageTitles: Record<ViewMode, string> = {
    table: "Selección de Estudiantes",
    addForm: "Agregar Nuevo Estudiante",
    editForm: "Editar Información del Estudiante",
    bulkUploadForm: "Carga Masiva de Datos desde Excel"
  };
  const pageDescriptions: Record<ViewMode, string> = {
    table: "Busca y selecciona los alumnos que podrían realizar su práctica.",
    addForm: "Complete el formulario para agregar un nuevo estudiante a la base de datos.",
    editForm: "Busque por RUT y modifique los datos del estudiante.",
    bulkUploadForm: "Suba la plantilla Excel con la información correspondiente."
  }

  if (isLoadingPracticumProgress || isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <p>Cargando gestión de estudiantes...</p>
        </div>
    );
  }

  return (
    <>
      <PageHeader 
        title={pageTitles[viewMode]}
        description={pageDescriptions[viewMode]}
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            onClick={() => {
              setViewMode('table');
              // setCurrentSearchInput(""); // Optionally clear search input when switching to table view
              // setSearchTerm(""); // Optionally clear search results
            }}
            className={viewMode === 'table' ? 'bg-primary hover:bg-primary/90' : ''}
        >
            <List className="mr-2 h-4 w-4" />
            Estudiantes existentes
        </Button>
        <Button 
            variant={viewMode === 'addForm' ? 'default' : 'outline'} 
            onClick={() => setViewMode('addForm')}
            className={viewMode === 'addForm' ? 'bg-primary hover:bg-primary/90' : ''}
        >
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar nuevo estudiante
        </Button>
        <Button 
            variant={viewMode === 'editForm' ? 'default' : 'outline'} 
            onClick={() => setViewMode('editForm')}
            className={viewMode === 'editForm' ? 'bg-primary hover:bg-primary/90' : ''}
        >
            <Edit3 className="mr-2 h-4 w-4" />
            Editar estudiante
        </Button>
        <Button 
            variant={viewMode === 'bulkUploadForm' ? 'default' : 'outline'} 
            onClick={() => setViewMode('bulkUploadForm')}
            className={viewMode === 'bulkUploadForm' ? 'bg-primary hover:bg-primary/90' : ''}
        >
            <UploadCloud className="mr-2 h-4 w-4" />
            Carga Masiva
        </Button>
      </div>

      {viewMode === 'table' && (
        <>
          <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar alumno por nombre, RUT o carrera"
                className="pl-8 w-full"
                value={currentSearchInput}
                onChange={(e) => setCurrentSearchInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
            </div>
            <Button onClick={handleSearchAction} className="sm:w-auto w-full">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>

          <StudentTable
            students={filteredStudents}
            isLoading={isLoading}
            selectedStudents={selectedStudentsForConfirmation}
            onSelectionChange={handleTableSelectionChange}
          />

          <div className="mt-6 flex justify-start">
            <Button 
                onClick={handleConfirmSelection} 
                size="lg" 
                className="bg-green-500 hover:bg-green-600 text-white" 
                disabled={selectedStudentsForConfirmation.size === 0 || isLoadingPracticumProgress || filteredStudents.length === 0}
            >
              <Check className="mr-2 h-5 w-5" /> Confirmar selección
            </Button>
          </div>
        </>
      )}

      {viewMode === 'addForm' && (
        <AddStudentForm 
          onSave={handleSaveStudent} 
          onCancel={() => setViewMode('table')} 
        />
      )}
      
      {viewMode === 'editForm' && (
        <EditStudentForm
          onSave={handleSaveStudent}
          onCancel={() => setViewMode('table')}
        />
      )}

      {viewMode === 'bulkUploadForm' && (
        <BulkStudentUploadForm
          onFileProcessed={handleBulkFileProcessed}
          onDatabaseEmptied={handleDatabaseEmptied}
          onCancel={() => setViewMode('table')}
        />
      )}
    </>
  );
}
