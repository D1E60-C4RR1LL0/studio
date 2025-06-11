
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Student } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StudentFormFields, studentFormSchema, type StudentFormData } from "./student-form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStudents } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Save, Search, XCircle } from "lucide-react";

interface EditStudentFormProps {
  onSave: (student: Student) => Promise<void>;
  onCancel: () => void;
}

// Helper function to normalize RUTs by removing dots, hyphens, and converting to uppercase.
const normalizeRut = (rut: string | undefined): string => {
  if (!rut) return "";
  return rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
};

export function EditStudentForm({ onSave, onCancel }: EditStudentFormProps) {
  const [rutSearch, setRutSearch] = React.useState("");
  const [currentStudent, setCurrentStudent] = React.useState<Student | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = React.useState(false);
  const [studentNotFound, setStudentNotFound] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
  });

  const handleSearchStudent = async () => {
    if (!rutSearch.trim()) {
      toast({ title: "RUT Requerido", description: "Por favor ingrese un RUT para buscar.", variant: "destructive" });
      return;
    }
    setIsLoadingStudent(true);
    setStudentNotFound(false);
    setCurrentStudent(null);
    form.reset(); 

    const normalizedSearchRut = normalizeRut(rutSearch.trim());

    try {
      const allStudents = await getStudents();
      const foundStudents = allStudents.filter(s => normalizeRut(s.rut).startsWith(normalizedSearchRut));

      if (foundStudents.length === 1) {
        const student = foundStudents[0];
        setCurrentStudent(student);
        form.reset({
          rut: student.rut,
          firstName: student.firstName,
          lastNamePaternal: student.lastNamePaternal,
          lastNameMaternal: student.lastNameMaternal,
          email: student.email,
          career: student.career,
          commune: student.commune || "",
          tutor: student.tutor || "",
          practicumLevel: student.practicumLevel,
          specialConditions: student.specialConditions || "",
        });
        setStudentNotFound(false);
      } else if (foundStudents.length > 1) {
        toast({
          title: "Múltiples coincidencias",
          description: "Se encontraron varios estudiantes. Por favor, ingrese un RUT más específico.",
          variant: "default",
        });
        setStudentNotFound(false); 
      } else {
        setStudentNotFound(true);
      }
    } catch (error) {
      toast({ title: "Error en la búsqueda", description: "No se pudo realizar la búsqueda.", variant: "destructive" });
    } finally {
      setIsLoadingStudent(false);
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    if (!currentStudent) return;

    const studentToSave: Student = {
      id: currentStudent.id,
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
    };
    await onSave(studentToSave);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Editar información del estudiante</CardTitle>
        <CardDescription>Busque un estudiante por RUT y actualice sus datos. (Los campos con * son obligatorios)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
          <Label htmlFor="rut-search">Buscar por RUT (puede ser parcial)</Label>
          <div className="flex gap-2">
            <Input
              id="rut-search"
              placeholder="Ej: 12345678K o 12.345.678-9"
              value={rutSearch}
              onChange={(e) => setRutSearch(e.target.value)}
              disabled={isLoadingStudent}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); 
                  handleSearchStudent();
                }
              }}
            />
            <Button onClick={handleSearchStudent} disabled={isLoadingStudent || !rutSearch.trim()}>
              <Search className="mr-2 h-4 w-4" /> {isLoadingStudent ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          {studentNotFound && !currentStudent && <p className="text-sm text-destructive mt-2">Estudiante no encontrado. Verifique el RUT e intente nuevamente.</p>}
        </div>

        {currentStudent && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <StudentFormFields form={form} />
              <div className="flex justify-start gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={form.formState.isSubmitting || !form.formState.isDirty}
                >
                  <Save className="mr-2 h-4 w-4" /> Guardar cambios
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                   <XCircle className="mr-2 h-4 w-4" /> Cancelar
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
