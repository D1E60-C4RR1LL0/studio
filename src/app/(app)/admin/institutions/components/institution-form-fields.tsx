
"use client";

import * as React from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Commune, DirectorContact } from "@/lib/definitions"; // DirectorContact imported
import { getCommunes } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from "lucide-react";

const directorContactSchema = z.object({
  id: z.string().optional(), // ID can be present if editing, or generated on save
  name: z.string().min(1, { message: "Nombre del directivo es requerido." }),
  email: z.string().email({ message: "Correo electrónico del directivo inválido." }),
  phone: z.string().optional(),
  contactRole: z.string().optional(), // Renamed from 'role' to avoid conflict if 'role' is used elsewhere.
});

export const institutionFormSchema = z.object({
  rbd: z.string().min(1, { message: "RBD es requerido." })
    .regex(/^\d+$/, { message: "RBD debe contener solo números." }),
  name: z.string().min(3, { message: "Nombre es requerido (mínimo 3 caracteres)." }),
  dependency: z.string().min(1, { message: "Dependencia es requerida." }),
  location: z.string().min(1, { message: "Comuna es requerida." }),
  directorContacts: z.array(directorContactSchema).min(1, { message: "Debe agregar al menos un directivo." }),
});

export type InstitutionFormData = z.infer<typeof institutionFormSchema>;

interface InstitutionFormFieldsProps {
  form: UseFormReturn<InstitutionFormData>;
}

export function InstitutionFormFields({ form }: InstitutionFormFieldsProps) {
  const [communes, setCommunes] = React.useState<Commune[]>([]);
  const { toast } = useToast();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "directorContacts",
  });

  React.useEffect(() => {
    async function loadSelectOptions() {
      try {
        const communeData = await getCommunes();
        setCommunes(communeData);
      } catch (error) {
        toast({
          title: "Error al cargar comunas",
          description: "No se pudieron cargar las opciones para el campo Comuna.",
          variant: "destructive",
        });
      }
    }
    loadSelectOptions();
  }, [toast]);

  // Ensure at least one director contact field is present on initial render if array is empty
  React.useEffect(() => {
    if (fields.length === 0) {
      append({ name: "", email: "", phone: "", contactRole: "" });
    }
  }, [fields, append]);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="rbd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RBD *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 16793" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Establecimiento *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Liceo Técnico Profesional La Araucana" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="dependency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dependencia *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: PART. SUBV., Municipal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comuna *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una comuna" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {communes.map(commune => (
                    <SelectItem key={commune.id} value={commune.name}>{commune.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Directivos / Contactos *</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", email: "", phone: "", contactRole: "" })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Contacto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((item, index) => (
            <div key={item.id} className="p-4 border rounded-md space-y-3 relative bg-muted/20">
               {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar Contacto</span>
                </Button>
              )}
              <FormField
                control={form.control}
                name={`directorContacts.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Contacto {index + 1} *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`directorContacts.${index}.email`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico {index + 1} *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contacto@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`directorContacts.${index}.phone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono {index + 1}</FormLabel>
                      <FormControl>
                        <Input placeholder="+56912345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`directorContacts.${index}.contactRole`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo {index + 1}</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Director, Coordinador UTP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
           <FormField
              control={form.control}
              name="directorContacts"
              render={() => (
                 <FormMessage />
              )}
            />
        </CardContent>
      </Card>
    </div>
  );
}
