
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Institution } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InstitutionFormFields, institutionFormSchema, type InstitutionFormData } from "./institution-form-fields";
import { Save, XCircle } from "lucide-react";

interface AddInstitutionFormProps {
  onSave: (institution: Omit<Institution, 'id' | 'logo'>) => Promise<void>;
  onCancel: () => void;
}

export function AddInstitutionForm({ onSave, onCancel }: AddInstitutionFormProps) {
  const form = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionFormSchema),
    defaultValues: {
      rbd: "",
      name: "",
      dependency: "",
      location: "", // Comuna
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      contactRole: "",
    },
  });

  const onSubmit = async (data: InstitutionFormData) => {
    const newInstitutionData: Omit<Institution, 'id' | 'logo'> = {
      rbd: data.rbd,
      name: data.name,
      dependency: data.dependency,
      location: data.location,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone || undefined,
      contactRole: data.contactRole || undefined,
    };
    await onSave(newInstitutionData);
    form.reset();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Agregar Nuevo Establecimiento</CardTitle>
        <CardDescription>Complete los campos para registrar un nuevo establecimiento. Los campos con * son obligatorios.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <InstitutionFormFields form={form} />
            <div className="flex justify-start gap-4 pt-4">
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white" disabled={form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> Guardar Establecimiento
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
