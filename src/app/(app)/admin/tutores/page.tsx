
"use client";

import * as React from "react";
import type { Tutor } from "@/lib/definitions";
import { getTutors, saveTutor, deleteTutor } from "@/lib/data";
import { TutorsTable } from "./components/tutors-table";
import { AddTutorForm } from "./components/add-tutor-form";
import { EditTutorForm } from "./components/edit-tutor-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Search, Edit3, PlusCircle, List, Trash2, AlertTriangle, Contact2 as PageIcon } from "lucide-react";
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

type ViewMode = "table" | "addForm" | "editForm";

export default function AdminTutorsPage() {
  const [tutors, setTutors] = React.useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = React.useState<Tutor[]>([]);
  const [currentSearchInput, setCurrentSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  const [tutorToDelete, setTutorToDelete] = React.useState<Tutor | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { toast } = useToast();

  const loadTutorData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getTutors();
      setTutors(data);
    } catch (error) {
      toast({
        title: "Error al cargar tutores",
        description: "No se pudieron cargar los datos. Intente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadTutorData();
  }, [loadTutorData]);

  React.useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filteredData = tutors.filter(item =>
      item.nombre.toLowerCase().includes(lowercasedSearchTerm) ||
      (item.email && item.email.toLowerCase().includes(lowercasedSearchTerm))
    );
    setFilteredTutors(filteredData);
  }, [searchTerm, tutors]);

  const handleSaveTutor = async (tutorToSave: Tutor | Omit<Tutor, 'id'>) => {
    try {
      const saved = await saveTutor(tutorToSave);
      await loadTutorData();
      toast({
        title: "Tutor Guardado",
        description: `${saved.nombre} ha sido guardado exitosamente.`,
      });
      setViewMode('table');
      setCurrentSearchInput("");
      setSearchTerm("");
    } catch (error) {
       toast({
        title: "Error al guardar",
        description: "No se pudo guardar el tutor.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = (tutor: Tutor) => {
    setTutorToDelete(tutor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tutorToDelete) return;
    try {
      await deleteTutor(tutorToDelete.id);
      await loadTutorData();
      toast({
        title: "Tutor Eliminado",
        description: `${tutorToDelete.nombre} ha sido eliminado.`,
      });
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el tutor.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setTutorToDelete(null);
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
    table: "Gestión de Tutores",
    addForm: "Agregar Nuevo Tutor",
    editForm: "Editar Tutor",
  };
  const pageDescriptions: Record<ViewMode, string> = {
    table: "Ver, buscar, agregar, editar o eliminar tutores.",
    addForm: "Complete el formulario para agregar un nuevo tutor.",
    editForm: "Busque y modifique los datos del tutor.",
  };

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={pageTitles[viewMode]}
        description={pageDescriptions[viewMode]}
        actions={<PageIcon className="h-8 w-8 text-primary" />}
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => { setViewMode('table'); setCurrentSearchInput(""); setSearchTerm(""); }}
            className={viewMode === 'table' ? 'bg-primary hover:bg-primary/90' : ''}
        >
            <List className="mr-2 h-4 w-4" />
            Listar Tutores
        </Button>
        <Button
            variant={viewMode === 'addForm' ? 'default' : 'outline'}
            onClick={() => setViewMode('addForm')}
            className={viewMode === 'addForm' ? 'bg-primary hover:bg-primary/90' : ''}
        >
            <PlusCircle className="mr-2 h-4 w-4" />
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
                placeholder="Buscar por nombre o correo del tutor"
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
          <TutorsTable
            tutors={searchTerm ? filteredTutors : tutors}
            isLoading={isLoading}
            onEdit={(tutor) => setViewMode('editForm')}
            onDelete={handleDeleteRequest}
          />
        </>
      )}

      {viewMode === 'addForm' && (
        <AddTutorForm
          onSave={handleSaveTutor}
          onCancel={() => setViewMode('table')}
        />
      )}
      
      {viewMode === 'editForm' && (
        <EditTutorForm
          onSave={handleSaveTutor}
          onCancel={() => setViewMode('table')}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
                ¿Está seguro de eliminar este tutor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará permanentemente al tutor: <br />
              <strong>{tutorToDelete?.nombre}</strong>.
              <br /><br />
              ¿Desea continuar y eliminar este tutor?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar tutor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}