"use client";

import * as React from "react";
import type { Student } from "@/lib/definitions";
import { getStudents } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { StudentTable } from "./components/student-table";
import { StudentEditDialog } from "./components/student-edit-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudentManagementPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = React.useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getStudents();
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        toast({
          title: "Error fetching students",
          description: "Could not load student data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  React.useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = students.filter(item => {
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredStudents(filteredData);
  }, [searchTerm, students]);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleAddNew = () => {
    // For a real "add new" scenario, you'd initialize a new student object
    // For this example, we'll open the dialog with a blank-ish student or a template
    setSelectedStudent({ 
      id: `new-${Date.now()}`, // Temporary ID
      name: "", 
      rut: "", 
      career: "", 
      email: "", 
      practicumLevel: "", 
      location: "" 
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleSaveStudent = (updatedStudent: Student) => {
    // This would typically involve an API call to save the student
    // For mock purposes, we update the local state
    setStudents(prevStudents => {
      const existingStudentIdx = prevStudents.findIndex(s => s.id === updatedStudent.id);
      if (existingStudentIdx > -1) {
        // Update existing student
        const newStudents = [...prevStudents];
        newStudents[existingStudentIdx] = updatedStudent;
        return newStudents;
      } else {
        // Add new student
        return [...prevStudents, updatedStudent];
      }
    });
    toast({
      title: "Student Saved",
      description: `${updatedStudent.name} has been successfully saved.`,
    });
    handleDialogClose();
  };

  return (
    <>
      <PageHeader
        title="Student Management"
        description="Search, view, and edit student practicum information."
        actions={
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Student
          </Button>
        }
      />
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students by name, RUT, career, etc..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <StudentTable
        students={filteredStudents}
        onEdit={handleEdit}
        isLoading={isLoading}
      />
      {selectedStudent && (
        <StudentEditDialog
          student={selectedStudent}
          isOpen={isEditDialogOpen}
          onClose={handleDialogClose}
          onSave={handleSaveStudent}
        />
      )}
    </>
  );
}
