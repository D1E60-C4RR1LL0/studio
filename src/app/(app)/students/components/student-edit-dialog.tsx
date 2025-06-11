
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Student } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { StudentFormFields, studentFormSchema, type StudentFormData } from "./student-form-fields";

interface StudentEditDialogProps {
  student: Student | null; // Student can be null if dialog is for a new student (though current flow uses AddStudentForm for new)
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
}

export function StudentEditDialog({ student, isOpen, onClose, onSave }: StudentEditDialogProps) {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    // Default values will be set by React.useEffect below
  });
  
  React.useEffect(() => {
    if (isOpen && student) {
      form.reset({
        rut: student.rut || "",
        firstName: student.firstName || "",
        lastNamePaternal: student.lastNamePaternal || "",
        lastNameMaternal: student.lastNameMaternal || "",
        email: student.email || "",
        career: student.career || "",
        commune: student.commune || "",
        tutor: student.tutor || "",
        practicumLevel: student.practicumLevel || "",
        specialConditions: student.specialConditions || "",
        periodo: student.periodo || "",
        avatar: student.avatar || "",
      });
    } else if (isOpen && !student) { // Fallback for opening dialog in 'new' mode, though less likely now
        form.reset({
            rut: "", firstName: "", lastNamePaternal: "", lastNameMaternal: "", email: "",
            career: "", commune: "", tutor: "", practicumLevel: "", specialConditions: "",
            periodo: "", avatar: "",
        });
    }
  }, [student, form, isOpen]);


  const onSubmit = (data: StudentFormData) => {
    if (!student) return; // Should not happen if dialog is for editing

    const studentToSave: Student = {
      ...student, // existing student data like ID
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
      periodo: data.periodo,
      avatar: data.avatar,
    };
    onSave(studentToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Información del Estudiante</DialogTitle>
          <DialogDescription>
            Actualice los detalles para {student?.firstName} {student?.lastNamePaternal}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <StudentFormFields form={form} isEditMode={true} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
