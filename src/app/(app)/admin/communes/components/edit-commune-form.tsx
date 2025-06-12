
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Commune } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CommuneFormFields, communeFormSchema, type CommuneFormData } from "./commune-form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCommunes } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Save, Search, XCircle } from "lucide-react";

interface EditCommuneFormProps {
  onSave: (commune: Commune) => Promise<void>;
  onCancel: () => void;
}

export function EditCommuneForm({ onSave, onCancel }: EditCommuneFormProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentCommune, setCurrentCommune] = React.useState<Commune | null>(null);
  const [isLoadingCommune, setIsLoadingCommune] = React.useState(false);
  const [communeNotFound, setCommuneNotFound] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<CommuneFormData>({
    resolver: zodResolver(communeFormSchema),
  });

  const handleSearchCommune = async () => {
    if (!searchTerm.trim()) {
      toast({ title: "Término de Búsqueda Requerido", description: "Por favor ingrese parte del nombre para buscar.", variant: "destructive" });
      return;
    }
    setIsLoadingCommune(true);
    setCommuneNotFound(false);
    setCurrentCommune(null);
    form.reset();

    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    try {
      const allCommunes = await getCommunes();
      const foundCommune = allCommunes.find(
        c => c.name.toLowerCase().includes(lowerSearchTerm)
      );

      if (foundCommune) {
        setCurrentCommune(foundCommune);
        form.reset({ name: foundCommune.name });
        setCommuneNotFound(false);
      } else {
        setCommuneNotFound(true);
      }
    } catch (error) {
      toast({ title: "Error en la búsqueda", description: "No se pudo realizar la búsqueda de comunas.", variant: "destructive" });
    } finally {
      setIsLoadingCommune(false);
    }
  };

  const onSubmit = async (data: CommuneFormData) => {
    if (!currentCommune) return;
    const communeToSave: Commune = {
      ...currentCommune,
      name: data.name,
    };
    await onSave(communeToSave);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Editar Información de la Comuna</CardTitle>
        <CardDescription>Busque una comuna por su nombre y actualice sus datos. El campo con * es obligatorio.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
          <Label htmlFor="search-term-commune">Buscar por Nombre de Comuna</Label>
          <div className="flex gap-2">
            <Input
              id="search-term-commune"
              placeholder="Ej: Santiago"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoadingCommune}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchCommune(); } }}
            />
            <Button onClick={handleSearchCommune} disabled={isLoadingCommune || !searchTerm.trim()}>
              <Search className="mr-2 h-4 w-4" /> {isLoadingCommune ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          {communeNotFound && !currentCommune && <p className="text-sm text-destructive mt-2">Comuna no encontrada. Verifique el nombre e intente nuevamente.</p>}
        </div>

        {currentCommune && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CommuneFormFields form={form} />
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
         {!currentCommune && !isLoadingCommune && !communeNotFound && (
            <p className="text-sm text-muted-foreground">Ingrese un nombre y presione "Buscar" para editar una comuna.</p>
        )}
      </CardContent>
    </Card>
  );
}
