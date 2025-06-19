
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Career, Commune, Tutor } from "@/lib/definitions";
import { getCareers, getCommunes, getTutors } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export const studentFormSchema = z.object({
  rut: z.string()
    .min(1, { message: "RUT es requerido." })
    .transform((val, ctx) => {
      const cleaned = val.replace(/\./g, "").replace(/-/g, "").toUpperCase();
      if (!/^\d{7,8}[\dkK]$/.test(cleaned)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RUT inválido.",
        });
        return z.NEVER;
      }
      const body = cleaned.slice(0, -1);
      const verifier = cleaned.slice(-1);
      let formattedRut = "";
      if (body.length === 8) {
        formattedRut = `${body.substring(0, 2)}.${body.substring(2, 5)}.${body.substring(5, 8)}-${verifier}`;
      } else if (body.length === 7) {
        formattedRut = `${body.substring(0, 1)}.${body.substring(1, 4)}.${body.substring(4, 7)}-${verifier}`;
      } else {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RUT inválido. Largo incorrecto.",
        });
        return z.NEVER;
      }
      return formattedRut;
    }),
  nombre: z.string().min(1, { message: "Nombre es requerido." }),
  ap_paterno: z.string().min(1, { message: "Apellido paterno es requerido." }),
  ap_materno: z.string().min(1, { message: "Apellido materno es requerido." }),
  email: z.string().email({ message: "Correo inválido." }),
  carrera_id: z.string().min(1, { message: "Carrera es requerida." }),
  comuna_id: z.string().optional(), // ahora es opcional
  tutor_id: z.string().optional(),  // ahora es opcional
  cond_especial: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormFieldsProps {
  form: UseFormReturn<StudentFormData>;
}

export function StudentFormFields({ form }: StudentFormFieldsProps) {
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [communes, setCommunes] = React.useState<Commune[]>([]);
  const [tutors, setTutors] = React.useState<Tutor[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    async function loadSelectOptions() {
      try {
        const [careerData, communeData, tutorData] = await Promise.all([
          getCareers(),
          getCommunes(),
          getTutors(),
        ]);
        setCareers(careerData);
        setCommunes(communeData);
        setTutors(tutorData);
      } catch (error) {
        toast({
          title: "Error al cargar opciones",
          description: "No se pudieron cargar los datos.",
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
          name="rut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RUT *</FormLabel>
              <FormControl>
                <Input placeholder="12.345.678-9 o 12345678K" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="ap_paterno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido Paterno *</FormLabel>
              <FormControl>
                <Input placeholder="Apellido Paterno" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ap_materno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido Materno *</FormLabel>
              <FormControl>
                <Input placeholder="Apellido Materno" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="correo@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="carrera_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrera</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una carrera" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {careers.map((career) => (
                    <SelectItem key={career.id} value={career.id}>
                      {career.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="comuna_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comuna</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una comuna" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {communes.map(commune => (
                    <SelectItem key={commune.id} value={commune.id}>{commune.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tutor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tutor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tutor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tutors.map(tutor => (
                    <SelectItem key={tutor.id} value={tutor.id}>{tutor.nombre}</SelectItem>
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
        name="cond_especial"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Condiciones Especiales</FormLabel>
            <FormControl>
              <Textarea placeholder="Indique cualquier condición especial del estudiante" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
