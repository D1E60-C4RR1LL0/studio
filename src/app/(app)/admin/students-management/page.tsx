
"use client";

import * as React from "react";
import type { Student } from "@/lib/definitions";
import { getStudents, saveStudent } from "@/lib/data"; // Removed deleteStudent as it's not implemented in data.ts
import { StudentTable } from "@/app/(app)/students/components/student-table"; // Adjusted path
import { AddStudentForm } from "@/app/(app)/students/components/add-student-form"; // Adjusted path
import { EditStudentForm } from "@/app/(app)/students/components/edit-student-form"; // Adjusted path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Search, Edit3, UserPlus, List, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// AlertDialog is not used yet as deleteStudent is not implemented/called
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

type ViewMode = "table" | "addForm" | "editForm";

// Helper function to normalize RUTs by removing dots, hyphens, and converting to uppercase.
const normalizeRut = (rut: string | undefined): string => {
  if (!rut) return "";
  return rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
};

export default function AdminStudentsManagementPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [currentSearchInput, setCurrentSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  // const [studentToDelete, setStudentToDelete] = React.useState<Student | null>(null); // For future delete functionality
  // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false); // For future delete functionality

  const { toast } = useToast();

  const loadStudentData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getStudents();
      setStudents(data);
      // For CRUD page, initially show all students if no search term, or an empty list if data is empty
      setFilteredStudents(searchTerm.trim() ? data.filter(item => filterLogic(item, searchTerm)) : data);
    } catch (error) {
      toast({
        title: "Error al cargar estudiantes",
        description: "No se pudieron cargar los datos. Intente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, searchTerm]); // Added searchTerm

  React.useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);
  
  const filterLogic = (item: Student, term: string) => {
    const lowercasedSearchTerm = term.toLowerCase();
    const normalizedRutSearchTerm = normalizeRut(term);
    const fullName = `${item.firstName} ${item.lastNamePaternal} ${item.lastNameMaternal}`.toLowerCase();
    const itemRutNormalized = normalizeRut(item.rut);

    return (
      fullName.includes(lowercasedSearchTerm) ||
      item.rut.toLowerCase().includes(lowercasedSearchTerm) ||
      (normalizedRutSearchTerm.length > 0 && itemRutNormalized.includes(normalizedRutSearchTerm)) ||
      item.career.toLowerCase().includes(lowercasedSearchTerm) ||
      item.practicumLevel.toLowerCase().includes(lowercasedSearchTerm)
    );
  };


  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students); // Show all if search is cleared
      return;
    }
    const filteredData = students.filter(item => filterLogic(item, searchTerm));
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
      setCurrentSearchInput("");
      setSearchTerm(""); 
    } catch (error) {
       toast({
        title: "Error al guardar",
        description: "No se pudo guardar el estudiante.",
        variant: "destructive",
      });
    }
  };

  // const handleDeleteRequest = (student: Student) => {
  //   setStudentToDelete(student);
  //   setIsDeleteDialogOpen(true);
  // };

  // const confirmDelete = async () => {
  //   if (!studentToDelete) return;
  //   try {
  //     // await deleteStudent(studentToDelete.id); // This function needs to be implemented in data.ts
  //     await loadStudentData();
  //     toast({
  //       title: "Estudiante Eliminado",
  //       description: `${studentToDelete.name} ha sido eliminado.`, // Adjust if student has firstName/lastName
  //     });
  //   } catch (error) {
  //     toast({
  //       title: "Error al eliminar",
  //       description: "No se pudo eliminar el estudiante.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsDeleteDialogOpen(false);
  //     setStudentToDelete(null);
  //     setCurrentSearchInput("");
  //     setSearchTerm("");
  //   }
  // };
  
  const handleSearchAction = () => {
    setSearchTerm(currentSearchInput);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchAction();
    }
  };

  const pageTitles: Record<ViewMode, string> = {
    table: "Gestión de Estudiantes (CRUD)",
    addForm: "Agregar Nuevo Estudiante",
    editForm: "Editar Estudiante",
  };
  const pageDescriptions: Record<ViewMode, string> = {
    table: "Ver, buscar, agregar o editar estudiantes en la base de datos.",
    addForm: "Complete el formulario para agregar un nuevo estudiante.",
    editForm: "Busque y modifique los datos del estudiante.",
  };

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={pageTitles[viewMode]}
        description={pageDescriptions[viewMode]}
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => { setViewMode('table'); setCurrentSearchInput(""); setSearchTerm(""); }}
            className={viewMode === 'table' ? 'bg-primary hover:bg-primary/90' : ''}
        >
            <List className="mr-2 h-4 w-4" />
            Listar Estudiantes
        </Button>
        <Button
            variant={viewMode === 'addForm' ? 'default' : 'outline'}
            onClick={() => setViewMode('addForm')}
            className={viewMode === 'addForm' ? 'bg-primary hover:bg-primary/90' : ''}
        >
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar Nuevo
        </Button>
         <Button
            variant={viewMode === 'editForm' ? 'default' : 'outline'}
            onClick={() => setViewMode('editForm')}
            className={viewMode === 'editForm' ? 'bg-primary hover:bg-primary/90' : ''}
        >
            <Edit3 className="mr-2 h-4 w-4" />
            Editar Existente
        </Button>
      </div>

      {viewMode === 'table' && (
        <>
          <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por RUT, nombre, carrera, etc."
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
            students={searchTerm ? filteredStudents : students} // Show all students or filtered ones
            isLoading={isLoading}
            selectedStudents={new Set()} // Selection not used in CRUD view for coordination flow
            onSelectionChange={() => {}} // Dummy function as selection is not for coordination flow here
            // TODO: Add onEdit and onDelete props to StudentTable if actions are to be placed there
          />
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

      {/* AlertDialog for delete confirmation - future implementation
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
                ¿Está seguro de eliminar este estudiante?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará permanentemente al estudiante: <br />
              <strong>{studentToDelete?.firstName} {studentToDelete?.lastNamePaternal} (RUT: {studentToDelete?.rut})</strong>.
              <br /><br />
              ¿Desea continuar y eliminar este estudiante?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar estudiante
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}
