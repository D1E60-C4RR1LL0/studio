
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Career } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CareerFormFields, careerFormSchema, type CareerFormData } from "./career-form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCareers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Save, Search, XCircle } from "lucide-react";

interface EditCareerFormProps {
  onSave: (career: Career) => Promise<void>;
  onCancel: () => void;
}

export function EditCareerForm({ onSave, onCancel }: EditCareerFormProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentCareer, setCurrentCareer] = React.useState<Career | null>(null);
  const [isLoadingCareer, setIsLoadingCareer] = React.useState(false);
  const [careerNotFound, setCareerNotFound] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<CareerFormData>({
    resolver: zodResolver(careerFormSchema),
  });

  const handleSearchCareer = async () => {
    if (!searchTerm.trim()) {
      toast({ title: "Término de Búsqueda Requerido", description: "Por favor ingrese parte del nombre para buscar.", variant: "destructive" });
      return;
    }
    setIsLoadingCareer(true);
    setCareerNotFound(false);
    setCurrentCareer(null);
    form.reset();

    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    try {
      const allCareers = await getCareers();
      // Find first match, could be extended to show multiple if names are very similar
      const foundCareer = allCareers.find(
        c => c.name.toLowerCase().includes(lowerSearchTerm)
      );

      if (foundCareer) {
        setCurrentCareer(foundCareer);
        form.reset({ name: foundCareer.name });
        setCareerNotFound(false);
      } else {
        setCareerNotFound(true);
      }
    } catch (error) {
      toast({ title: "Error en la búsqueda", description: "No se pudo realizar la búsqueda de carreras.", variant: "destructive" });
    } finally {
      setIsLoadingCareer(false);
    }
  };

  const onSubmit = async (data: CareerFormData) => {
    if (!currentCareer) return;
    const careerToSave: Career = {
      ...currentCareer,
      name: data.name,
    };
    await onSave(careerToSave);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Editar Información de la Carrera</CardTitle>
        <CardDescription>Busque una carrera por su nombre y actualice sus datos. El campo con * es obligatorio.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
          <Label htmlFor="search-term-career">Buscar por Nombre de Carrera</Label>
          <div className="flex gap-2">
            <Input
              id="search-term-career"
              placeholder="Ej: Ingeniería Civil"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoadingCareer}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchCareer(); } }}
            />
            <Button onClick={handleSearchCareer} disabled={isLoadingCareer || !searchTerm.trim()}>
              <Search className="mr-2 h-4 w-4" /> {isLoadingCareer ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          {careerNotFound && !currentCareer && <p className="text-sm text-destructive mt-2">Carrera no encontrada. Verifique el nombre e intente nuevamente.</p>}
        </div>

        {currentCareer && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CareerFormFields form={form} />
              <div className="flex justify-start gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={form.formState.isSubmitting || !form.formState.isDirty}
                >
                  <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                   <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
              </div>
            </form>
          </Form>
        )}
         {!currentCareer && !isLoadingCareer && !careerNotFound && (
            <p className="text-sm text-muted-foreground">Ingrese un nombre y presione "Buscar" para editar una carrera.</p>
        )}
      </CardContent>
    </Card>
  );
}
