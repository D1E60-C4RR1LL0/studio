
"use client";

import * as React from "react";
import type { Student } from "@/lib/definitions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle } from "lucide-react";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  selectedStudents: Set<string>;
  onSelectionChange: (studentId: string,isSelected: boolean) => void;
}

export function StudentTable({ students, isLoading, selectedStudents, onSelectionChange }: StudentTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"><Skeleton className="h-4 w-4" /></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>RUT</TableHead>
              <TableHead>Carrera</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Periodo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (students.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border rounded-md">
        <UserCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">No se encontraron estudiantes</h3>
        <p className="text-muted-foreground">No hay estudiantes que coincidan con sus criterios actuales.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Seleccionar</TableHead>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>RUT</TableHead>
            <TableHead>Carrera</TableHead>
            <TableHead>Nivel</TableHead>
            <TableHead>Periodo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow 
              key={student.id}
              data-state={selectedStudents.has(student.id) ? "selected" : ""}
            >
              <TableCell>
                <Checkbox
                  aria-label={`Seleccionar ${student.firstName} ${student.lastNamePaternal}`}
                  checked={selectedStudents.has(student.id)}
                  onCheckedChange={(checked) => onSelectionChange(student.id, Boolean(checked))}
                />
              </TableCell>
              <TableCell>
                <div className="font-medium">{`${student.firstName} ${student.lastNamePaternal} ${student.lastNameMaternal}`}</div>
                <div className="text-xs text-muted-foreground md:hidden">{student.rut}</div>
                <div className="text-xs text-muted-foreground md:hidden">{student.career}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{student.rut}</TableCell>
              <TableCell className="hidden md:table-cell">{student.career}</TableCell>
              <TableCell>{student.practicumLevel}</TableCell>
              <TableCell>{student.periodo || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
