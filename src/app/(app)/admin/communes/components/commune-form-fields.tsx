
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

export const communeFormSchema = z.object({
  name: z.string().min(3, { message: "Nombre de la comuna es requerido (mínimo 3 caracteres)." }),
});

export type CommuneFormData = z.infer<typeof communeFormSchema>;

interface CommuneFormFieldsProps {
  form: UseFormReturn<CommuneFormData>;
}

export function CommuneFormFields({ form }: CommuneFormFieldsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Comuna *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Concepción" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
