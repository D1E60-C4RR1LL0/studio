
"use client";

import * as React from "react";
import type { Student } from "@/lib/definitions";
import { getStudents, saveStudent } from "@/lib/data";
import { StudentTable } from "./components/student-table";
import { StudentEditDialog } from "./components/student-edit-dialog";
import { AddStudentForm } from "./components/add-student-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Search, Edit3, Check, UserPlus, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ViewMode = "table" | "addForm";

export default function StudentManagementPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [selectedStudentForEdit, setSelectedStudentForEdit] = React.useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  
  const [selectedStudentsForConfirmation, setSelectedStudentsForConfirmation] = React.useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");

  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getStudents();
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        toast({
          title: "Error al obtener estudiantes",
          description: "No se pudieron cargar los datos de los estudiantes. Intente más tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  React.useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = students.filter(item => {
      const fullName = `${item.firstName} ${item.lastNamePaternal} ${item.lastNameMaternal}`.toLowerCase();
      return (
        fullName.includes(lowercasedFilter) ||
        item.rut.toLowerCase().includes(lowercasedFilter) ||
        item.career.toLowerCase().includes(lowercasedFilter) ||
        item.practicumLevel.toLowerCase().includes(lowercasedFilter) ||
        (item.periodo && item.periodo.toLowerCase().includes(lowercasedFilter))
      );
    });
    setFilteredStudents(filteredData);
  }, [searchTerm, students]);

  const handleEditStudent = () => {
    if (selectedStudentsForConfirmation.size === 1) {
      const studentIdToEdit = Array.from(selectedStudentsForConfirmation)[0];
      const student = students.find(s => s.id === studentIdToEdit);
      if (student) {
        setSelectedStudentForEdit(student);
        setIsEditDialogOpen(true);
      }
    } else {
      toast({
        title: "Selección Inválida",
        description: "Por favor, seleccione un solo estudiante para editar.",
        variant: "destructive",
      });
    }
  };
  
  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedStudentForEdit(null);
  };

  const handleSaveStudent = async (studentToSave: Student) => {
    try {
      const savedStudent = await saveStudent(studentToSave);
      setStudents(prevStudents => {
        const existingStudentIdx = prevStudents.findIndex(s => s.id === savedStudent.id);
        let newStudentsArray;
        if (existingStudentIdx > -1) {
          newStudentsArray = [...prevStudents];
          newStudentsArray[existingStudentIdx] = savedStudent;
        } else {
          newStudentsArray = [...prevStudents, savedStudent];
        }
        return newStudentsArray;
      });
      toast({
        title: "Estudiante Guardado",
        description: `${savedStudent.firstName} ${savedStudent.lastNamePaternal} ha sido guardado exitosamente.`,
      });
      if (viewMode === 'addForm') {
        setViewMode('table'); // Switch back to table after adding
      }
      handleDialogClose(); // Close edit dialog if open
      setSelectedStudentsForConfirmation(new Set()); // Clear selection
    } catch (error) {
       toast({
        title: "Error al guardar",
        description: "No se pudo guardar el estudiante.",
        variant: "destructive",
      });
    }
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

    toast({
      title: "Selección Confirmada",
      description: `Estudiantes seleccionados: ${selectedNames}. (Simulado)`,
    });
    setSelectedStudentsForConfirmation(new Set());
  }

  const canEdit = selectedStudentsForConfirmation.size === 1;

  return (
    <>
      <PageHeader 
        title="Selección de Estudiantes"
        description={viewMode === 'table' ? "Selecciona los alumnos que podrían realizar su práctica en esta institución." : "Agregue un nuevo estudiante a la base de datos."}
      />

      <div className="flex items-center gap-2 mb-6">
        <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            onClick={() => setViewMode('table')}
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
        <Button variant="outline" onClick={handleEditStudent} disabled={!canEdit || viewMode === 'addForm'}>
            <Edit3 className="mr-2 h-4 w-4" />
            Editar estudiante
        </Button>
      </div>

      {viewMode === 'table' && (
        <>
          <div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar alumno por nombre, RUT o carrera"
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <StudentTable
            students={filteredStudents}
            isLoading={isLoading}
            selectedStudents={selectedStudentsForConfirmation}
            onSelectionChange={handleTableSelectionChange}
          />

          <div className="mt-6 flex justify-start">
            <Button onClick={handleConfirmSelection} size="lg" className="bg-green-600 hover:bg-green-700 text-white">
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

      {isEditDialogOpen && selectedStudentForEdit && (
        <StudentEditDialog
          student={selectedStudentForEdit}
          isOpen={isEditDialogOpen}
          onClose={handleDialogClose}
          onSave={handleSaveStudent}
        />
      )}
    </>
  );
}
