
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Tutor } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TutorFormFields, tutorFormSchema, type TutorFormData } from "./tutor-form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTutors } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Save, Search, XCircle } from "lucide-react";

interface EditTutorFormProps {
  onSave: (tutor: Tutor) => Promise<void>;
  onCancel: () => void;
}

export function EditTutorForm({ onSave, onCancel }: EditTutorFormProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentTutor, setCurrentTutor] = React.useState<Tutor | null>(null);
  const [isLoadingTutor, setIsLoadingTutor] = React.useState(false);
  const [tutorNotFound, setTutorNotFound] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<TutorFormData>({
    resolver: zodResolver(tutorFormSchema),
  });

  const handleSearchTutor = async () => {
    if (!searchTerm.trim()) {
      toast({ title: "Término de Búsqueda Requerido", description: "Por favor ingrese nombre o email para buscar.", variant: "destructive" });
      return;
    }
    setIsLoadingTutor(true);
    setTutorNotFound(false);
    setCurrentTutor(null);
    form.reset();

    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    try {
      const allTutors = await getTutors();
      const foundTutor = allTutors.find(
        t => t.nombre.toLowerCase().includes(lowerSearchTerm) || (t.email && t.email.toLowerCase().includes(lowerSearchTerm))
      );

      if (foundTutor) {
        setCurrentTutor(foundTutor);
        form.reset({ nombre: foundTutor.nombre, email: foundTutor.email || "" });
        setTutorNotFound(false);
      } else {
        setTutorNotFound(true);
      }
    } catch (error) {
      toast({ title: "Error en la búsqueda", description: "No se pudo realizar la búsqueda de tutores.", variant: "destructive" });
    } finally {
      setIsLoadingTutor(false);
    }
  };

  const onSubmit = async (data: TutorFormData) => {
    if (!currentTutor) return;
    const tutorToSave: Tutor = {
      ...currentTutor,
      nombre: data.nombre,
      email: data.email || undefined,
    };
    await onSave(tutorToSave);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Editar Información del Tutor</CardTitle>
        <CardDescription>Busque un tutor por nombre o correo y actualice sus datos. El campo Nombre es obligatorio.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
          <Label htmlFor="search-term-tutor">Buscar por Nombre o Correo del Tutor</Label>
          <div className="flex gap-2">
            <Input
              id="search-term-tutor"
              placeholder="Ej: Carlos Soto o carlos.soto@example.com"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoadingTutor}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchTutor(); } }}
            />
            <Button onClick={handleSearchTutor} disabled={isLoadingTutor || !searchTerm.trim()}>
              <Search className="mr-2 h-4 w-4" /> {isLoadingTutor ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          {tutorNotFound && !currentTutor && <p className="text-sm text-destructive mt-2">Tutor no encontrado. Verifique el término e intente nuevamente.</p>}
        </div>

        {currentTutor && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TutorFormFields form={form} />
              <div className="flex justify-start gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={form.formState.isSubmitting}
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
        {!currentTutor && !isLoadingTutor && !tutorNotFound && (
          <p className="text-sm text-muted-foreground">Ingrese un término y presione "Buscar" para editar un tutor.</p>
        )}
      </CardContent>
    </Card>
  );
}
