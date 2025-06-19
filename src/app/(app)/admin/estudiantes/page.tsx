"use client";

import * as React from "react";
import type { Student } from "@/lib/definitions";
import { getStudents, saveStudentToAPI } from "@/lib/api/students";
import { StudentTable } from "@/app/(app)/students/components/student-table";
import { AddStudentForm } from "@/app/(app)/students/components/add-student-form";
import { EditStudentForm } from "@/app/(app)/students/components/edit-student-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Search, Edit3, UserPlus, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ViewMode = "table" | "addForm" | "editForm";

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

  const { toast } = useToast();

  const loadStudentData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getStudents();
      setStudents(data);
      setFilteredStudents(
        searchTerm.trim()
          ? data.filter((item: Student) => filterLogic(item, searchTerm))
          : data
      );
    } catch (error) {
      toast({
        title: "Error al cargar estudiantes",
        description: "No se pudieron cargar los datos. Intente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, searchTerm]);

  React.useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  const filterLogic = (item: Student, term: string) => {
    const lowercasedSearchTerm = term.toLowerCase();
    const normalizedRutSearchTerm = normalizeRut(term);
    const fullName = `${item.nombre} ${item.ap_paterno} ${item.ap_materno}`.toLowerCase();
    const itemRutNormalized = normalizeRut(item.rut);

    return (
      fullName.includes(lowercasedSearchTerm) ||
      item.rut.toLowerCase().includes(lowercasedSearchTerm) ||
      (normalizedRutSearchTerm.length > 0 && itemRutNormalized.includes(normalizedRutSearchTerm)) ||
      item.carrera?.nombre?.toLowerCase().includes(lowercasedSearchTerm)
    );

  };

  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }
    const filteredData = students.filter((item) => filterLogic(item, searchTerm));
    setFilteredStudents(filteredData);
  }, [searchTerm, students]);

  const handleSaveStudent = async (studentToSave: Student | Omit<Student, "id">) => {
    try {
      const savedStudent = await saveStudentToAPI(studentToSave);
      await loadStudentData();
      toast({
        title: "Estudiante Guardado",
        description: `${savedStudent.nombre} ${savedStudent.ap_paterno} ha sido guardado exitosamente.`,
      });
      setViewMode("table");
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

  const handleSearchAction = () => {
    setSearchTerm(currentSearchInput);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearchAction();
    }
  };

  const pageTitles: Record<ViewMode, string> = {
    table: "Gestión de Estudiantes",
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
          variant={viewMode === "table" ? "default" : "outline"}
          onClick={() => {
            setViewMode("table");
            setCurrentSearchInput("");
            setSearchTerm("");
          }}
          className={viewMode === "table" ? "bg-primary hover:bg-primary/90" : ""}
        >
          <List className="mr-2 h-4 w-4" />
          Listar Estudiantes
        </Button>
        <Button
          variant={viewMode === "addForm" ? "default" : "outline"}
          onClick={() => setViewMode("addForm")}
          className={viewMode === "addForm" ? "bg-primary hover:bg-primary/90" : ""}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar Nuevo
        </Button>
        <Button
          variant={viewMode === "editForm" ? "default" : "outline"}
          onClick={() => setViewMode("editForm")}
          className={viewMode === "editForm" ? "bg-primary hover:bg-primary/90" : ""}
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Editar Existente
        </Button>
      </div>

      {viewMode === "table" && (
        <>
          <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h--4 w-4 text-muted-foreground" />
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
            students={searchTerm ? filteredStudents : students}
            isLoading={isLoading}
            selectedStudents={new Set()}
            onSelectionChange={() => { }}
          />
        </>
      )}

      {viewMode === "addForm" && (
        <AddStudentForm
          onSave={handleSaveStudent}
          onCancel={() => setViewMode("table")}
        />
      )}

      {viewMode === "editForm" && (
        <EditStudentForm
          onSave={handleSaveStudent}
          onCancel={() => setViewMode("table")}
        />
      )}
    </div>
  );
}
