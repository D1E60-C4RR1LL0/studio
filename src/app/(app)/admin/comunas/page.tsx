
"use client";

import * as React from "react";
import type { Commune } from "@/lib/definitions";
import { getCommunes, saveCommune, deleteCommune } from "@/lib/data";
import { CommunesTable } from "./components/communes-table";
import { AddCommuneForm } from "./components/add-commune-form";
import { EditCommuneForm } from "./components/edit-commune-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Search, Edit3, PlusCircle, List, Trash2, AlertTriangle, MapPin as PageIcon } from "lucide-react";
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

export default function AdminCommunesPage() {
  const [communes, setCommunes] = React.useState<Commune[]>([]);
  const [filteredCommunes, setFilteredCommunes] = React.useState<Commune[]>([]);
  const [currentSearchInput, setCurrentSearchInput] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");
  const [communeToDelete, setCommuneToDelete] = React.useState<Commune | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { toast } = useToast();

  const loadCommuneData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCommunes();
      setCommunes(data);
    } catch (error) {
      toast({
        title: "Error al cargar comunas",
        description: "No se pudieron cargar los datos. Intente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadCommuneData();
  }, [loadCommuneData]);

  React.useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filteredData = communes.filter(item =>
      item.name.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredCommunes(filteredData);
  }, [searchTerm, communes]);

  const handleSaveCommune = async (communeToSave: Commune | Omit<Commune, 'id'>) => {
    try {
      const saved = await saveCommune(communeToSave);
      await loadCommuneData();
      toast({
        title: "Comuna Guardada",
        description: `${saved.name} ha sido guardada exitosamente.`,
      });
      setViewMode('table');
      setCurrentSearchInput("");
      setSearchTerm("");
    } catch (error) {
       toast({
        title: "Error al guardar",
        description: "No se pudo guardar la comuna.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = (commune: Commune) => {
    setCommuneToDelete(commune);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!communeToDelete) return;
    try {
      await deleteCommune(communeToDelete.id);
      await loadCommuneData();
      toast({
        title: "Comuna Eliminada",
        description: `${communeToDelete.name} ha sido eliminada.`,
      });
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la comuna.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCommuneToDelete(null);
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
    table: "Gestión de Comunas",
    addForm: "Agregar Nueva Comuna",
    editForm: "Editar Comuna",
  };
  const pageDescriptions: Record<ViewMode, string> = {
    table: "Ver, buscar, agregar, editar o eliminar comunas.",
    addForm: "Complete el formulario para agregar una nueva comuna.",
    editForm: "Busque y modifique los datos de la comuna.",
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
            Listar Comunas
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
                placeholder="Buscar por nombre de comuna"
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
          <CommunesTable
            communes={searchTerm ? filteredCommunes : communes}
            isLoading={isLoading}
            onEdit={(commune) => setViewMode('editForm')} // Simplificado, se buscará en el form
            onDelete={handleDeleteRequest}
          />
        </>
      )}

      {viewMode === 'addForm' && (
        <AddCommuneForm
          onSave={handleSaveCommune}
          onCancel={() => setViewMode('table')}
        />
      )}
      
      {viewMode === 'editForm' && (
        <EditCommuneForm
          onSave={handleSaveCommune}
          onCancel={() => setViewMode('table')}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
                ¿Está seguro de eliminar esta comuna?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará permanentemente la comuna: <br />
              <strong>{communeToDelete?.name}</strong>.
              <br /><br />
              ¿Desea continuar y eliminar esta comuna?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar comuna
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
