
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Career } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CareerFormFields, careerFormSchema, type CareerFormData } from "./career-form-fields";
import { Save, XCircle } from "lucide-react";

interface AddCareerFormProps {
  onSave: (career: Omit<Career, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function AddCareerForm({ onSave, onCancel }: AddCareerFormProps) {
  const form = useForm<CareerFormData>({
    resolver: zodResolver(careerFormSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const onSubmit = async (data: CareerFormData) => {
    await onSave(data);
    form.reset();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Agregar Nueva Carrera</CardTitle>
        <CardDescription>Complete el campo para registrar una nueva carrera. El campo con * es obligatorio.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CareerFormFields form={form} />
            <div className="flex justify-start gap-4 pt-4">
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white" disabled={form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> Guardar Carrera
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
