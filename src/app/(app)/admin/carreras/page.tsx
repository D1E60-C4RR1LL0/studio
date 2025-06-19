
"use client";

import * as React from "react";
import type { AcademicLevel, Career } from "@/lib/definitions";
import { getCareers, saveCareer, deleteCareer } from "@/lib/data";
import { CareersTable } from "./components/careers-table";
import { AddCareerForm } from "./components/add-career-form";
import { EditCareerForm } from "./components/edit-career-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Search, Edit3, PlusCircle, List, Trash2, AlertTriangle, NotebookText } from "lucide-react";
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

import { getAllAcademicLevels } from "@/lib/api/academic-levels";


type ViewMode = "table" | "addForm" | "editForm";

export default function AdminCareersPage() {
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [filteredCareers, setFilteredCareers] = React.useState<Career[]>([]);
  const [currentSearchInput, setCurrentSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  const [careerToDelete, setCareerToDelete] = React.useState<Career | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [academicLevels, setAcademicLevels] = React.useState<AcademicLevel[]>([]);


  const { toast } = useToast();

  const loadCareerData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCareers();
      setCareers(data);
    } catch (error) {
      toast({
        title: "Error al cargar carreras",
        description: "No se pudieron cargar los datos. Intente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadCareerData();
  }, [loadCareerData]);

  React.useEffect(() => {
    async function fetchLevels() {
      try {
        const levels = await getAllAcademicLevels();
        setAcademicLevels(levels);
      } catch {
        toast({ title: "Error al cargar niveles", description: "No se pudieron obtener los niveles.", variant: "destructive" });
      }
    }

    fetchLevels();
  }, []);


  React.useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filteredData = careers.filter(item =>
      item.nombre.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredCareers(filteredData);
  }, [searchTerm, careers]);

  const handleSaveCareer = async (careerToSave: Career | Omit<Career, 'id'>) => {
    try {
      const saved = await saveCareer(careerToSave);
      await loadCareerData();
      toast({
        title: "Carrera Guardada",
        description: `${saved.nombre} ha sido guardada exitosamente.`,
      });
      setViewMode('table');
      setCurrentSearchInput("");
      setSearchTerm("");
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la carrera.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = (career: Career) => {
    setCareerToDelete(career);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!careerToDelete) return;
    try {
      await deleteCareer(careerToDelete.id);
      await loadCareerData();
      toast({
        title: "Carrera Eliminada",
        description: `${careerToDelete.nombre} ha sido eliminada.`,
      });
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la carrera.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCareerToDelete(null);
      setCurrentSearchInput("");
      setSearchTerm("");
    }
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
    table: "Gestión de Carreras",
    addForm: "Agregar Nueva Carrera",
    editForm: "Editar Carrera",
  };
  const pageDescriptions: Record<ViewMode, string> = {
    table: "Ver, buscar, agregar, editar o eliminar carreras.",
    addForm: "Complete el formulario para agregar una nueva carrera.",
    editForm: "Busque y modifique los datos de la carrera.",
  };

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={pageTitles[viewMode]}
        description={pageDescriptions[viewMode]}
        actions={<NotebookText className="h-8 w-8 text-primary" />}
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          onClick={() => { setViewMode('table'); setCurrentSearchInput(""); setSearchTerm(""); }}
          className={viewMode === 'table' ? 'bg-primary hover:bg-primary/90' : ''}
        >
          <List className="mr-2 h-4 w-4" />
          Listar Carreras
        </Button>
        <Button
          variant={viewMode === 'addForm' ? 'default' : 'outline'}
          onClick={() => setViewMode('addForm')}
          className={viewMode === 'addForm' ? 'bg-primary hover:bg-primary/90' : ''}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Nueva
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
                placeholder="Buscar por nombre de carrera"
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
          <CareersTable
            careers={searchTerm ? filteredCareers : careers}
            isLoading={isLoading}
            academicLevels={academicLevels}
            onEdit={(career) => setViewMode('editForm')}
            onDelete={handleDeleteRequest}
          />
        </>
      )}

      {viewMode === 'addForm' && (
        <AddCareerForm
          onSave={handleSaveCareer}
          onCancel={() => setViewMode('table')}
        />
      )}

      {viewMode === 'editForm' && (
        <EditCareerForm
          onSave={handleSaveCareer}
          onCancel={() => setViewMode('table')}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
              ¿Está seguro de eliminar esta carrera?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará permanentemente la carrera: <br />
              <strong>{careerToDelete?.nombre}</strong>.
              <br /><br />
              ¿Desea continuar y eliminar esta carrera?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar carrera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
