
"use client";

import * as React from "react";
import type { Student } from "@/lib/definitions";
import { getStudents, getAcademicLevels } from "@/lib/data";
import { CoordinationHeader } from "@/components/coordination-header";
import { StudentTable } from "./components/student-table";
import { StudentEditDialog } from "./components/student-edit-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Edit3, Check, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudentManagementPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [selectedStudentForEdit, setSelectedStudentForEdit] = React.useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isNewStudentMode, setIsNewStudentMode] = React.useState(false);

  const [selectedStudentsForConfirmation, setSelectedStudentsForConfirmation] = React.useState<Set<string>>(new Set());

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
      return (
        item.name.toLowerCase().includes(lowercasedFilter) ||
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
        setIsNewStudentMode(false);
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

  const handleAddNewStudent = () => {
    setSelectedStudentForEdit(null); // Clear any previous selection
    setIsNewStudentMode(true);
    setIsEditDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedStudentForEdit(null);
    setIsNewStudentMode(false);
  };

  const handleSaveStudent = (updatedStudent: Student) => {
    setStudents(prevStudents => {
      const existingStudentIdx = prevStudents.findIndex(s => s.id === updatedStudent.id);
      let newStudentsArray;
      if (existingStudentIdx > -1) {
        newStudentsArray = [...prevStudents];
        newStudentsArray[existingStudentIdx] = updatedStudent;
      } else {
        // Add new student with a real ID if backend would generate one
        // For mock, we use the ID from the dialog (which might be new-timestamp or existing)
        newStudentsArray = [...prevStudents, updatedStudent];
      }
      // If editing, ensure selection reflects update
      if (selectedStudentsForConfirmation.has(updatedStudent.id)) {
         // Potentially re-filter or update UI if relevant fields changed
      }
      return newStudentsArray;
    });
    toast({
      title: "Estudiante Guardado",
      description: `${updatedStudent.name} ha sido guardado exitosamente.`,
    });
    handleDialogClose();
     // Potentially clear selection if editing one, or keep if adding many
    if(!isNewStudentMode) setSelectedStudentsForConfirmation(new Set());
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
        .map(s => s.name)
        .join(', ');

    toast({
      title: "Selección Confirmada",
      description: `Estudiantes seleccionados: ${selectedNames}. (Simulado)`,
    });
    // Here you would typically proceed to the next step or save the selection
    // For now, just clear selection
    setSelectedStudentsForConfirmation(new Set());
  }

  const canEdit = selectedStudentsForConfirmation.size === 1;

  return (
    <>
      <CoordinationHeader activeIndex={0} />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
                <h2 className="text-2xl font-semibold text-foreground">Selección de estudiantes</h2>
                <Badge variant="secondary" className="ml-3 bg-blue-100 text-blue-700 border-blue-300">En proceso</Badge>
            </div>
        </div>
        <p className="text-muted-foreground">
          Selecciona los alumnos que podrían realizar su práctica en esta institución.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button variant="default" className="bg-primary hover:bg-primary/90">Estudiantes existentes</Button>
        <Button variant="outline" onClick={handleAddNewStudent}>
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar nuevo estudiante
        </Button>
        <Button variant="outline" onClick={handleEditStudent} disabled={!canEdit}>
            <Edit3 className="mr-2 h-4 w-4" />
            Editar estudiante
        </Button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar alumno por nombre o RUT"
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddNewStudent} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar
        </Button>
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

      {(isEditDialogOpen) && (
        <StudentEditDialog
          student={isNewStudentMode ? { id: `new-${Date.now()}`, name: "", rut: "", career: "", email: "", practicumLevel: "", location: "", periodo: "" } : selectedStudentForEdit}
          isOpen={isEditDialogOpen}
          onClose={handleDialogClose}
          onSave={handleSaveStudent}
        />
      )}
    </>
  );
}
