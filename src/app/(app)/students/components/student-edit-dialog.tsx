
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAcademicLevels } from "@/lib/data"; 
import type { AcademicLevel } from "@/lib/definitions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const studentFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  rut: z.string().regex(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/, { message: "Formato de RUT inválido (ej: 12.345.678-9)." }),
  career: z.string().min(2, { message: "La carrera debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Dirección de correo inválida." }),
  practicumLevel: z.string().min(1, { message: "El nivel de práctica es requerido." }),
  periodo: z.string().optional(),
  tutor: z.string().optional(),
  location: z.string().min(2, { message: "La ubicación debe tener al menos 2 caracteres." }),
  specialConditions: z.string().optional(),
  avatar: z.string().url({ message: "Debe ser una URL válida." }).optional().or(z.literal('')),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentEditDialogProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
}

export function StudentEditDialog({ student, isOpen, onClose, onSave }: StudentEditDialogProps) {
  const [academicLevels, setAcademicLevels] = React.useState<AcademicLevel[]>([]);

  React.useEffect(() => {
    async function loadLevels() {
      const levels = await getAcademicLevels();
      setAcademicLevels(levels);
    }
    loadLevels();
  }, []);
  
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: student || {
      name: "",
      rut: "",
      career: "",
      email: "",
      practicumLevel: "",
      periodo: "",
      tutor: "",
      location: "",
      specialConditions: "",
      avatar: "",
    },
  });
  
  React.useEffect(() => {
    if (isOpen) { // Reset form only when dialog opens or student changes
      if (student) {
        form.reset(student);
      } else {
        form.reset({
          name: "", rut: "", career: "", email: "", practicumLevel: "", periodo: "", tutor: "", location: "", specialConditions: "", avatar: ""
        });
      }
    }
  }, [student, form, isOpen]);


  const onSubmit = (data: StudentFormData) => {
    // student prop could be the new student template or an existing student
    // if it's a new student, its id would be `new-${Date.now()}`
    const studentToSave: Student = {
      ...(student || {}), // spread existing student data (like ID) or empty object
      ...data, // override with form data
      id: student?.id || `new-${Date.now()}`, // ensure ID is present
    };
    onSave(studentToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student?.id.startsWith('new-') ? "Agregar Nuevo Estudiante" : "Editar Información del Estudiante"}</DialogTitle>
          <DialogDescription>
            {student?.id.startsWith('new-') ? "Ingrese los detalles para el nuevo estudiante." : `Actualice los detalles para ${student?.name}.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Ana Pérez García" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUT</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 12.345.678-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="career"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrera</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Ingeniería de Software" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección de Correo</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Ej: ana.perez@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="practicumLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Práctica</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un nivel de práctica" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {academicLevels.map(level => (
                          <SelectItem key={level.id} value={level.name}>{level.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="periodo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodo Académico (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 2024-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tutor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tutor Académico (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Dr. Carlos Soto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lugar/Institución de Práctica</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Soluciones Tecnológicas Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Avatar (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://placehold.co/100x100.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condiciones Especiales (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Requiere equipamiento para trabajo remoto, necesidad de lugar accesible." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
