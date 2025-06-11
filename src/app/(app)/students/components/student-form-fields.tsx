
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
import type { AcademicLevel, Career, Commune, Tutor } from "@/lib/definitions";
import { getAcademicLevels, getCareers, getCommunes, getTutors } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export const studentFormSchema = z.object({
  rut: z.string()
    .min(1, { message: "RUT es requerido." })
    .transform((val, ctx) => {
      // Normalize: remove dots, hyphens, convert K to uppercase
      const cleaned = val.replace(/\./g, "").replace(/-/g, "").toUpperCase();
      
      if (!/^\d{7,8}[\dkK]$/.test(cleaned)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RUT inválido. Formato esperado: XXXXXXXXK o XX.XXX.XXX-K (donde X es número y K puede ser K o número).",
        });
        return z.NEVER; // Prevents further processing by Zod for this field
      }

      const body = cleaned.slice(0, -1);
      const verifier = cleaned.slice(-1);

      let formattedRut = "";
      if (body.length === 8) { // e.g., 12345678
        formattedRut = `${body.substring(0, 2)}.${body.substring(2, 5)}.${body.substring(5, 8)}-${verifier}`;
      } else if (body.length === 7) { // e.g., 1234567
        formattedRut = `${body.substring(0, 1)}.${body.substring(1, 4)}.${body.substring(4, 7)}-${verifier}`;
      } else {
        // This case should ideally be caught by the regex, but acts as a fallback.
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RUT inválido. Largo incorrecto después de la normalización.",
        });
        return z.NEVER;
      }
      return formattedRut;
    }),
  firstName: z.string().min(1, { message: "Nombre es requerido." }),
  lastNamePaternal: z.string().min(1, { message: "Apellido paterno es requerido." }),
  lastNameMaternal: z.string().min(1, { message: "Apellido materno es requerido." }),
  email: z.string().email({ message: "Dirección de correo inválida." }),
  career: z.string().min(1, { message: "Carrera es requerida." }),
  commune: z.string().optional(),
  tutor: z.string().optional(),
  practicumLevel: z.string().min(1, { message: "Nivel de práctica es requerido." }),
  specialConditions: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormFieldsProps {
  form: UseFormReturn<StudentFormData>;
}

export function StudentFormFields({ form }: StudentFormFieldsProps) {
  const [academicLevels, setAcademicLevels] = React.useState<AcademicLevel[]>([]);
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [communes, setCommunes] = React.useState<Commune[]>([]);
  const [tutors, setTutors] = React.useState<Tutor[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    async function loadSelectOptions() {
      try {
        const [levels, careerData, communeData, tutorData] = await Promise.all([
          getAcademicLevels(),
          getCareers(),
          getCommunes(),
          getTutors(),
        ]);
        setAcademicLevels(levels);
        setCareers(careerData);
        setCommunes(communeData);
        setTutors(tutorData);
      } catch (error) {
        toast({
          title: "Error al cargar opciones",
          description: "No se pudieron cargar los datos para los campos de selección.",
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
          name="firstName"
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
          name="lastNamePaternal"
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
          name="lastNameMaternal"
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
          name="career"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carrera *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una carrera" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {careers.map(career => (
                    <SelectItem key={career.id} value={career.name}>{career.name}</SelectItem>
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
          name="commune"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comuna</FormLabel>
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
        <FormField
          control={form.control}
          name="tutor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tutor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un tutor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tutors.map(tutor => (
                    <SelectItem key={tutor.id} value={tutor.name}>{tutor.name}</SelectItem>
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
        name="practicumLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nivel de Práctica *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un nivel de práctica" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {academicLevels.map(level => (
                  <SelectItem key={level.id} value={level.name}>{level.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="specialConditions"
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

