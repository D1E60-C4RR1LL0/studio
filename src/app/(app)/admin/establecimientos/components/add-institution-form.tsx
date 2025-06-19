"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Institution } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  InstitutionFormFields,
  institutionFormSchema,
  type InstitutionFormData,
} from "./institution-form-fields";
import { Save, XCircle } from "lucide-react";

interface AddInstitutionFormProps {
  onSave: (institution: Omit<Institution, "id">) => Promise<void>;
  onCancel: () => void;
}

export function AddInstitutionForm({
  onSave,
  onCancel,
}: AddInstitutionFormProps) {
  const form = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionFormSchema),
    defaultValues: {
      rbd: "",
      nombre: "",
      dependencia: "",
      comuna_id: "",
      directivos: [{ name: "", email: "", phone: "", contactRole: "" }],
    },
  });

  const onSubmit = async (data: InstitutionFormData) => {
    const newInstitutionData: Omit<Institution, "id"> = {
      rbd: data.rbd,
      nombre: data.nombre,
      dependencia: data.dependencia,
      comuna_id: data.comuna_id,
      directivos: data.directivos.map((contact) => ({
        nombre: contact.name,
        email: contact.email,
        telefono: contact.phone || undefined,
        cargo: contact.contactRole || undefined
      }))
    };
    await onSave(newInstitutionData);
    form.reset();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Agregar nuevo establecimiento</CardTitle>
        <CardDescription>
          Complete el formulario con la información del establecimiento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            autoComplete="off"
          >
            <InstitutionFormFields form={form} />
            <div className="flex justify-start gap-4 pt-4">
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white"
                disabled={form.formState.isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" /> Guardar establecimiento
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
