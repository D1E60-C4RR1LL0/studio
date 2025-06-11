
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Student } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentFormFields, studentFormSchema, type StudentFormData } from "./student-form-fields";
import { Save } from "lucide-react";

interface AddStudentFormProps {
  onSave: (student: Student) => void;
  onCancel: () => void;
}

export function AddStudentForm({ onSave, onCancel }: AddStudentFormProps) {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      rut: "",
      firstName: "",
      lastNamePaternal: "",
      lastNameMaternal: "",
      email: "",
      career: "",
      commune: "",
      tutor: "",
      practicumLevel: "",
      specialConditions: "",
      periodo: "",
      avatar: "",
    },
  });

  const onSubmit = (data: StudentFormData) => {
    const newStudent: Student = {
      id: `new-${Date.now()}`, // Generate a temporary new ID
      rut: data.rut,
      firstName: data.firstName,
      lastNamePaternal: data.lastNamePaternal,
      lastNameMaternal: data.lastNameMaternal,
      email: data.email,
      career: data.career,
      commune: data.commune,
      tutor: data.tutor,
      practicumLevel: data.practicumLevel,
      specialConditions: data.specialConditions,
      periodo: data.periodo, // Keep even if not in form, for consistency
      avatar: data.avatar,   // Keep even if not in form
    };
    onSave(newStudent);
    form.reset(); // Reset form after successful save
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
            <StudentFormFields form={form} isEditMode={false} />
            <div className="flex justify-start gap-4 pt-4">
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                <Save className="mr-2 h-4 w-4" /> Guardar estudiante
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
