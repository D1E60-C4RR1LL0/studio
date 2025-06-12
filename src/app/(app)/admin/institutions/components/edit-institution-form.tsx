
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Institution, DirectorContact } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InstitutionFormFields, institutionFormSchema, type InstitutionFormData } from "./institution-form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInstitutions } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Save, Search, XCircle } from "lucide-react";

interface EditInstitutionFormProps {
  onSave: (institution: Institution) => Promise<void>;
  onCancel: () => void;
}

export function EditInstitutionForm({ onSave, onCancel }: EditInstitutionFormProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentInstitution, setCurrentInstitution] = React.useState<Institution | null>(null);
  const [isLoadingInstitution, setIsLoadingInstitution] = React.useState(false);
  const [institutionNotFound, setInstitutionNotFound] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionFormSchema),
  });

  const handleSearchInstitution = async () => {
    if (!searchTerm.trim()) {
      toast({ title: "Término de Búsqueda Requerido", description: "Por favor ingrese RBD o parte del nombre para buscar.", variant: "destructive" });
      return;
    }
    setIsLoadingInstitution(true);
    setInstitutionNotFound(false);
    setCurrentInstitution(null);
    form.reset();

    const lowerSearchTerm = searchTerm.trim().toLowerCase();

    try {
      const allInstitutions = await getInstitutions();
      const foundInstitution = allInstitutions.find(
        inst => inst.rbd.toLowerCase() === lowerSearchTerm || inst.name.toLowerCase().includes(lowerSearchTerm)
      );

      if (foundInstitution) {
        setCurrentInstitution(foundInstitution);
        const directorContactsForForm = (foundInstitution.directorContacts && foundInstitution.directorContacts.length > 0)
          ? foundInstitution.directorContacts.map(dc => ({
              id: dc.id, // Preserve ID for existing contacts
              name: dc.name,
              email: dc.email,
              phone: dc.phone || "",
              contactRole: dc.role || "",
            }))
          : [{ name: "", email: "", phone: "", contactRole: "" }]; // Default if no contacts

        form.reset({
          rbd: foundInstitution.rbd,
          name: foundInstitution.name,
          dependency: foundInstitution.dependency,
          location: foundInstitution.location,
          directorContacts: directorContactsForForm,
        });
        setInstitutionNotFound(false);
      } else {
        setInstitutionNotFound(true);
      }
    } catch (error) {
      toast({ title: "Error en la búsqueda", description: "No se pudo realizar la búsqueda.", variant: "destructive" });
    } finally {
      setIsLoadingInstitution(false);
    }
  };

  const onSubmit = async (data: InstitutionFormData) => {
    if (!currentInstitution) return;

    // Map form data contacts back to DirectorContact structure
    const directorContactsToSave: DirectorContact[] = data.directorContacts.map(contact => ({
      id: contact.id || `new-contact-${Date.now()}-${Math.random().toString(36).substring(2,9)}`, // Assign new ID if not present
      name: contact.name,
      email: contact.email,
      phone: contact.phone || undefined,
      role: contact.contactRole || undefined,
    }));

    const institutionToSave: Institution = {
      ...currentInstitution,
      rbd: data.rbd,
      name: data.name,
      dependency: data.dependency,
      location: data.location,
      directorContacts: directorContactsToSave,
    };
    await onSave(institutionToSave);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Editar Información del Establecimiento</CardTitle>
        <CardDescription>Busque un establecimiento por RBD o Nombre y actualice sus datos. Los campos con * son obligatorios.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
          <Label htmlFor="search-term">Buscar por RBD o Nombre</Label>
          <div className="flex gap-2">
            <Input
              id="search-term"
              placeholder="Ej: 16793 o Liceo La Araucana"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoadingInstitution}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchInstitution();
                }
              }}
            />
            <Button onClick={handleSearchInstitution} disabled={isLoadingInstitution || !searchTerm.trim()}>
              <Search className="mr-2 h-4 w-4" /> {isLoadingInstitution ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          {institutionNotFound && !currentInstitution && <p className="text-sm text-destructive mt-2">Establecimiento no encontrado. Verifique el término de búsqueda e intente nuevamente.</p>}
        </div>

        {currentInstitution && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <InstitutionFormFields form={form} />
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
         {!currentInstitution && !isLoadingInstitution && !institutionNotFound && (
            <p className="text-sm text-muted-foreground">Ingrese un RBD o nombre y presione "Buscar" para editar un establecimiento.</p>
        )}
      </CardContent>
    </Card>
  );
}
