
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

export const tutorFormSchema = z.object({
  nombre: z.string().min(3, { message: "Nombre del tutor es requerido (mínimo 3 caracteres)." }),
  email: z.string().email({ message: "Correo electrónico inválido." }).optional().or(z.literal('')),
});

export type TutorFormData = z.infer<typeof tutorFormSchema>;

interface TutorFormFieldsProps {
  form: UseFormReturn<TutorFormData>;
}

export function TutorFormFields({ form }: TutorFormFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="nombre"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Tutor *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Dr. Carlos Soto" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Electrónico</FormLabel>
            <FormControl>
              <Input type="email" placeholder="ejemplo@ucsc.cl" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
