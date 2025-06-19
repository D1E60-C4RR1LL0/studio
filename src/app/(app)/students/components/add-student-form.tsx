"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Student } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentFormFields, studentFormSchema, type StudentFormData } from "./student-form-fields";
import { Save, XCircle } from "lucide-react";

interface AddStudentFormProps {
  onSave: (student: Omit<Student, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function AddStudentForm({ onSave, onCancel }: AddStudentFormProps) {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      rut: "",
      nombre: "",
      ap_paterno: "",
      ap_materno: "",
      email: "",
      cond_especial: "",
      carrera_id: "",
      comuna_id: "",
      tutor_id: "",
    },
  });

  const onSubmit = async (data: StudentFormData) => {
    const newStudentData: Omit<Student, 'id'> = {
      rut: data.rut,
      nombre: data.nombre,
      ap_paterno: data.ap_paterno,
      ap_materno: data.ap_materno,
      email: data.email,
      cond_especial: data.cond_especial,
      carrera_id: data.carrera_id,
      comuna_id: data.comuna_id,
      tutor_id: data.tutor_id,
    };
    await onSave(newStudentData);
    form.reset();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Agregar nuevo estudiante a la base de datos</CardTitle>
        <CardDescription>(Los campos con * son obligatorios)</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <StudentFormFields form={form} />
            <div className="flex justify-start gap-4 pt-4">
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white" disabled={form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> Guardar estudiante
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
