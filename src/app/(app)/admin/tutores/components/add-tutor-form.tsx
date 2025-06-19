
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Tutor } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TutorFormFields, tutorFormSchema, type TutorFormData } from "./tutor-form-fields";
import { Save, XCircle } from "lucide-react";

interface AddTutorFormProps {
  onSave: (tutor: Omit<Tutor, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function AddTutorForm({ onSave, onCancel }: AddTutorFormProps) {
  const form = useForm<TutorFormData>({
    resolver: zodResolver(tutorFormSchema),
    defaultValues: {
      nombre: "",
      email: "",
    },
  });

  const onSubmit = async (data: TutorFormData) => {
    await onSave({
        nombre: data.nombre,
        email: data.email || undefined, // Store undefined if email is empty
    });
    form.reset();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Agregar Nuevo Tutor</CardTitle>
        <CardDescription>Complete los campos para registrar un nuevo tutor. El campo con * es obligatorio.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TutorFormFields form={form} />
            <div className="flex justify-start gap-4 pt-4">
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white" disabled={form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> Guardar Tutor
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
