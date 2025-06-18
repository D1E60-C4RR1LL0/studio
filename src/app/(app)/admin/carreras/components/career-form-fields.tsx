
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

export const careerFormSchema = z.object({
  name: z.string().min(3, { message: "Nombre de la carrera es requerido (mínimo 3 caracteres)." }),
});

export type CareerFormData = z.infer<typeof careerFormSchema>;

interface CareerFormFieldsProps {
  form: UseFormReturn<CareerFormData>;
}

export function CareerFormFields({ form }: CareerFormFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Carrera *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Ingeniería de Software" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
