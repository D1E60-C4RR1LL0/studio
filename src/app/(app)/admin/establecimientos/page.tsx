
"use client";

import * as React from "react";
import type { Institution } from "@/lib/definitions";
import {
  getInstitutionsFromAPI as getInstitutions,
  saveInstitutionToAPI as saveInstitution,
  deleteInstitutionFromAPI as deleteInstitution,
} from "@/lib/api/institutions";
import { InstitutionsTable } from "./components/institutions-table";
import { AddInstitutionForm } from "./components/add-institution-form";
import { EditInstitutionForm } from "./components/edit-institution-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Search, Edit3, PlusCircle, List, Trash2, AlertTriangle, Landmark } from "lucide-react";
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

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = React.useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = React.useState<Institution[]>([]);
  const [currentSearchInput, setCurrentSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  const [institutionToDelete, setInstitutionToDelete] = React.useState<Institution | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { toast } = useToast();

  const loadInstitutionData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getInstitutions();
      setInstitutions(data);
    } catch (error) {
      toast({
        title: "Error al cargar establecimientos",
        description: "No se pudieron cargar los datos. Intente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadInstitutionData();
  }, [loadInstitutionData]);

  React.useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filteredData = institutions.filter(item =>
      item.nombre.toLowerCase().includes(lowercasedSearchTerm) ||
      item.rbd.toLowerCase().includes(lowercasedSearchTerm) ||
      item.ubicacion.toLowerCase().includes(lowercasedSearchTerm) ||
      item.dependencia.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredInstitutions(filteredData);
  }, [searchTerm, institutions]);

  const handleSaveInstitution = async (institutionToSave: Institution | Omit<Institution, 'id'>) => {
    try {
      const saved = await saveInstitution(institutionToSave);
      await loadInstitutionData();
      toast({
        title: "Establecimiento Guardado",
        description: `${saved.nombre} ha sido guardado exitosamente.`,
      });
      setViewMode('table');
      setCurrentSearchInput("");
      setSearchTerm("");
    } catch (error) {
       toast({
        title: "Error al guardar",
        description: "No se pudo guardar el establecimiento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = (institution: Institution) => {
    setInstitutionToDelete(institution);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!institutionToDelete) return;
    try {
      await deleteInstitution(institutionToDelete.id);
      await loadInstitutionData();
      toast({
        title: "Establecimiento Eliminado",
        description: `${institutionToDelete.nombre} ha sido eliminado.`,
      });
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el establecimiento.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setInstitutionToDelete(null);
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
    table: "Gestión de Establecimientos",
    addForm: "Agregar Nuevo Establecimiento",
    editForm: "Editar Establecimiento",
  };
  const pageDescriptions: Record<ViewMode, string> = {
    table: "Ver, buscar, agregar, editar o eliminar establecimientos.",
    addForm: "Complete el formulario para agregar un nuevo establecimiento.",
    editForm: "Busque y modifique los datos del establecimiento.",
  };

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={pageTitles[viewMode]}
        description={pageDescriptions[viewMode]}
        actions={<Landmark className="h-8 w-8 text-primary" />}
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => { setViewMode('table'); setCurrentSearchInput(""); setSearchTerm(""); }}
            className={viewMode === 'table' ? 'bg-primary hover:bg-primary/90' : ''}
        >
            <List className="mr-2 h-4 w-4" />
            Listar Establecimientos
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
                placeholder="Buscar por RBD, nombre, comuna o dependencia"
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
          <InstitutionsTable
            institutions={searchTerm ? filteredInstitutions : institutions}
            isLoading={isLoading}
            onEdit={(institution) => {
              setViewMode('editForm');
            }}
            onDelete={handleDeleteRequest}
          />
        </>
      )}

      {viewMode === 'addForm' && (
        <AddInstitutionForm
          onSave={handleSaveInstitution}
          onCancel={() => setViewMode('table')}
        />
      )}
      
      {viewMode === 'editForm' && (
        <EditInstitutionForm
          onSave={handleSaveInstitution}
          onCancel={() => setViewMode('table')}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
                ¿Está seguro de eliminar este establecimiento?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará permanentemente el establecimiento: <br />
              <strong>{institutionToDelete?.nombre} (RBD: {institutionToDelete?.rbd})</strong>.
              <br /><br />
              ¿Desea continuar y eliminar este establecimiento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar establecimiento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
