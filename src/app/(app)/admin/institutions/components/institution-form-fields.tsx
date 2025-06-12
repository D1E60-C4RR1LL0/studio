
"use client";

import * as React from "react";
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
import type { Commune } from "@/lib/definitions";
import { getCommunes } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export const institutionFormSchema = z.object({
  rbd: z.string().min(1, { message: "RBD es requerido." })
    .regex(/^\d+$/, { message: "RBD debe contener solo números." }),
  name: z.string().min(3, { message: "Nombre es requerido (mínimo 3 caracteres)." }),
  dependency: z.string().min(1, { message: "Dependencia es requerida." }),
  location: z.string().min(1, { message: "Comuna es requerida." }), // Corresponde a Comuna
  contactName: z.string().min(1, { message: "Nombre de contacto es requerido." }),
  contactEmail: z.string().email({ message: "Correo electrónico de contacto inválido." }),
  contactPhone: z.string().optional(),
  contactRole: z.string().optional(),
  // logo: z.string().url({ message: "URL de logo inválida." }).optional(), // Omitido por ahora
});

export type InstitutionFormData = z.infer<typeof institutionFormSchema>;

interface InstitutionFormFieldsProps {
  form: UseFormReturn<InstitutionFormData>;
}

export function InstitutionFormFields({ form }: InstitutionFormFieldsProps) {
  const [communes, setCommunes] = React.useState<Commune[]>([]);
  const { toast } = useToast();

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

  return (
    <div className="space-y-4">
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
          name="location" // Este campo corresponde a 'Comuna'
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
      <FormField
        control={form.control}
        name="contactName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Contacto *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Juan Pérez" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="contactEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Electrónico del Contacto *</FormLabel>
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
          name="contactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono del Contacto</FormLabel>
              <FormControl>
                <Input placeholder="+56912345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo del Contacto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Director, Coordinador UTP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
