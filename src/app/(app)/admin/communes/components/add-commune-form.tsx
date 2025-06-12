
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Commune } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CommuneFormFields, communeFormSchema, type CommuneFormData } from "./commune-form-fields";
import { Save, XCircle } from "lucide-react";

interface AddCommuneFormProps {
  onSave: (commune: Omit<Commune, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function AddCommuneForm({ onSave, onCancel }: AddCommuneFormProps) {
  const form = useForm<CommuneFormData>({
    resolver: zodResolver(communeFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: CommuneFormData) => {
    await onSave(data);
    form.reset();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Agregar Nueva Comuna</CardTitle>
        <CardDescription>Complete el campo para registrar una nueva comuna. El campo con * es obligatorio.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CommuneFormFields form={form} />
            <div className="flex justify-start gap-4 pt-4">
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white" disabled={form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> Guardar Comuna
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                <XCircle className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
