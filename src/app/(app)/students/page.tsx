
"use client";

import * as React from "react";
import type { Student } from "@/lib/definitions";
import { getStudents } from "@/lib/data";
import { StudentTable } from "./components/student-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Search, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { usePracticumProgress, STAGES, STAGE_PATHS } from '@/hooks/usePracticumProgress';

const CONFIRMED_STUDENT_IDS_KEY = 'confirmedPracticumStudentIds';

const normalizeRut = (rut: string | undefined): string => {
  if (!rut) return "";
  return rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
};

export default function StudentSelectionPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [currentSearchInput, setCurrentSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedStudentsForConfirmation, setSelectedStudentsForConfirmation] = React.useState<Set<string>>(new Set());

  const { toast } = useToast();
  const router = useRouter();
  const { advanceStage, isLoadingProgress: isLoadingPracticumProgress } = usePracticumProgress();

  const loadStudentData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getStudents();
      setStudents(data);
      if (!searchTerm.trim()) {
        setFilteredStudents([]);
      }
    } catch (error) {
      toast({
        title: "Error al obtener estudiantes",
        description: "No se pudieron cargar los datos de los estudiantes. Intente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, searchTerm]);

  React.useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents([]);
      return;
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const normalizedRutSearchTerm = normalizeRut(searchTerm);

    const filteredData = students.filter(item => {
      const fullName = `${item.nombre} ${item.ap_paterno} ${item.ap_materno}`.toLowerCase();
      const itemRutNormalized = normalizeRut(item.rut);

      return (
        fullName.includes(lowercasedSearchTerm) ||
        item.rut.toLowerCase().includes(lowercasedSearchTerm) ||
        itemRutNormalized.includes(normalizedRutSearchTerm) ||
        item.carrera_id.toLowerCase().includes(lowercasedSearchTerm)
      );
    });

    setFilteredStudents(filteredData);
  }, [searchTerm, students]);

  const handleTableSelectionChange = (studentId: string, isSelected: boolean) => {
    setSelectedStudentsForConfirmation(prevSelected => {
      const newSelected = new Set(prevSelected);
      isSelected ? newSelected.add(studentId) : newSelected.delete(studentId);
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
      .map(s => `${s.nombre} ${s.ap_paterno}`)
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
    if (!currentSearchInput.trim()) {
      toast({
        title: "Búsqueda Vacía",
        description: "Mostrando todos los alumnos. Para filtrar, ingrese un término de búsqueda.",
        variant: "default"
      });
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchAction();
    }
  };

  if (isLoadingPracticumProgress || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando selección de estudiantes...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Paso 1: Selección de Estudiantes para Práctica"
        description="Busque y seleccione los alumnos que participarán en el proceso de asignación de prácticas. Los datos de los alumnos se gestionan en 'Gestión de Alumnos'."
      />

      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar alumno por nombre, RUT o carrera para iniciar la selección"
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

      {filteredStudents.length > 0 && (
        <div className="mt-6 flex justify-start">
          <Button 
            onClick={handleConfirmSelection} 
            size="lg" 
            className="bg-green-500 hover:bg-green-600 text-white" 
            disabled={selectedStudentsForConfirmation.size === 0 || isLoadingPracticumProgress}
          >
            <Check className="mr-2 h-5 w-5" /> Confirmar selección ({selectedStudentsForConfirmation.size}) y pasar a Notificar Establecimiento
          </Button>
        </div>
      )}

      {searchTerm && filteredStudents.length === 0 && !isLoading && (
        <p className="mt-4 text-muted-foreground">No se encontraron estudiantes con el término "{searchTerm}". Intente con otra búsqueda.</p>
      )}

      {!searchTerm && filteredStudents.length === 0 && !isLoading && (
        <p className="mt-4 text-muted-foreground">Ingrese un término de búsqueda para encontrar estudiantes y comenzar la selección.</p>
      )}
    </>
  );
}
