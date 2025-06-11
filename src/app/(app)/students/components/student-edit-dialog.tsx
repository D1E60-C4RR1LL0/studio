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
import { mockAcademicLevels } from "@/lib/data"; // Using mock data for levels
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const studentFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  rut: z.string().regex(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/, { message: "Invalid RUT format (e.g., 12.345.678-9)." }),
  career: z.string().min(2, { message: "Career must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  practicumLevel: z.string().min(1, { message: "Practicum level is required." }),
  tutor: z.string().optional(),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
  specialConditions: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentEditDialogProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
}

export function StudentEditDialog({ student, isOpen, onClose, onSave }: StudentEditDialogProps) {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: student || {
      name: "",
      rut: "",
      career: "",
      email: "",
      practicumLevel: "",
      tutor: "",
      location: "",
      specialConditions: "",
      avatar: "",
    },
  });
  
  React.useEffect(() => {
    if (student) {
      form.reset(student);
    } else {
      form.reset({
        name: "", rut: "", career: "", email: "", practicumLevel: "", tutor: "", location: "", specialConditions: "", avatar: ""
      });
    }
  }, [student, form, isOpen]);


  const onSubmit = (data: StudentFormData) => {
    if (!student) return; // Should not happen if dialog is for editing or adding existing
    
    const studentToSave: Student = {
      ...student, // Preserves ID and any other non-form fields
      ...data,
    };
    onSave(studentToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student?.id.startsWith('new-') ? "Add New Student" : "Edit Student Information"}</DialogTitle>
          <DialogDescription>
            {student?.id.startsWith('new-') ? "Enter the details for the new student." : `Update the details for ${student?.name}.`}
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
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ana Pérez García" {...field} />
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
                      <Input placeholder="e.g., 12.345.678-9" {...field} />
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
                    <FormLabel>Career</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Software Engineering" {...field} />
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., ana.perez@example.com" {...field} />
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
                    <FormLabel>Practicum Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a practicum level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockAcademicLevels.map(level => (
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
                name="tutor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Tutor (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dr. Carlos Soto" {...field} />
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
                  <FormLabel>Practicum Location/Institution</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tech Solutions Inc." {...field} />
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
                  <FormLabel>Avatar URL (Optional)</FormLabel>
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
                  <FormLabel>Special Conditions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Requires remote work setup, accessible workplace needed." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
