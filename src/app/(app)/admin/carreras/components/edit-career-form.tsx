"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Career, AcademicLevel } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CareerFormFields, careerFormSchema, type CareerFormData } from "./career-form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCareers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Save, Search, XCircle, Trash2 } from "lucide-react";
import { getAllAcademicLevels, saveAcademicLevel, deleteAcademicLevel } from "@/lib/api/academic-levels";


interface EditCareerFormProps {
  onSave: (career: Career) => Promise<void>;
  onCancel: () => void;
}

export function EditCareerForm({ onSave, onCancel }: EditCareerFormProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentCareer, setCurrentCareer] = React.useState<Career | null>(null);
  const [isLoadingCareer, setIsLoadingCareer] = React.useState(false);
  const [careerNotFound, setCareerNotFound] = React.useState(false);
  const [levels, setLevels] = React.useState<AcademicLevel[]>([]);
  const [newLevelName, setNewLevelName] = React.useState("");
  const { toast } = useToast();

  const form = useForm<CareerFormData>({
    resolver: zodResolver(careerFormSchema),
  });

  const fetchLevels = async (careerId: string) => {
  try {
    const allLevels = await getAllAcademicLevels();
    const filtered = allLevels.filter(level => level.carrera_id === careerId);
    setLevels(filtered);
  } catch {
    toast({
      title: "Error al cargar niveles",
      description: "No se pudieron obtener los niveles.",
      variant: "destructive",
    });
  }
};


  const handleSearchCareer = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Término de Búsqueda Requerido",
        description: "Por favor ingrese parte del nombre para buscar.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingCareer(true);
    setCareerNotFound(false);
    setCurrentCareer(null);
    form.reset();

    try {
      const allCareers = await getCareers();
      const foundCareer = allCareers.find((c) =>
        c.nombre.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );

      if (foundCareer) {
        setCurrentCareer(foundCareer);
        form.reset({ nombre: foundCareer.nombre });
        fetchLevels(foundCareer.id);
      } else {
        setCareerNotFound(true);
      }
    } catch {
      toast({
        title: "Error en la búsqueda",
        description: "No se pudo realizar la búsqueda.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCareer(false);
    }
  };

  const onSubmit = async (data: CareerFormData) => {
    if (!currentCareer) return;
    await onSave({ ...currentCareer, nombre: data.nombre });
  };

  const handleAddLevel = async () => {
    if (!currentCareer || !newLevelName.trim()) return;
    try {
      await saveAcademicLevel({ nombre: newLevelName, carrera_id: currentCareer.id });
      fetchLevels(currentCareer.id);
      setNewLevelName("");
      toast({ title: "Nivel agregado correctamente." });
    } catch {
      toast({ title: "Error", description: "No se pudo agregar el nivel", variant: "destructive" });
    }
  };

  const handleDeleteLevel = async (id: number) => {
    try {
      await deleteAcademicLevel(String(id));
      if (currentCareer) fetchLevels(currentCareer.id);
    } catch {
      toast({ title: "Error al eliminar", description: "No se pudo eliminar el nivel", variant: "destructive" });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Editar Información de la Carrera</CardTitle>
        <CardDescription>Busque una carrera y administre sus niveles de práctica.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
          <Label>Buscar por nombre de carrera</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Ej: Pedagogía General Básica"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchCareer(); } }}
              disabled={isLoadingCareer}
            />
            <Button onClick={handleSearchCareer}>
              <Search className="mr-2 h-4 w-4" /> Buscar
            </Button>
          </div>
          {careerNotFound && <p className="text-sm text-destructive">Carrera no encontrada.</p>}
        </div>

        {currentCareer && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CareerFormFields form={form} />

              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium">Niveles de Práctica</h4>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Ej: Práctica I"
                    value={newLevelName}
                    onChange={(e) => setNewLevelName(e.target.value)}
                  />
                  <Button onClick={handleAddLevel} type="button">Agregar</Button>
                </div>

                <ul className="mt-4 space-y-2">
                  {levels.map((level) => (
                    <li key={level.id} className="flex justify-between items-center border rounded px-3 py-2">
                      <span>{level.nombre}</span>
                      <Button size="icon" variant="destructive" onClick={() => handleDeleteLevel(Number(level.id))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                  {levels.length === 0 && <p className="text-muted-foreground text-sm mt-2">No hay niveles registrados.</p>}
                </ul>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="bg-green-500 text-white" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                  <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
