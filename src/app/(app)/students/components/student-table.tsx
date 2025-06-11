"use client";

import type { Student } from "@/lib/definitions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pencil, UserCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  isLoading: boolean;
}

export function StudentTable({ students, onEdit, isLoading }: StudentTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>RUT</TableHead>
              <TableHead>Career</TableHead>
              <TableHead>Practicum Level</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-[80px]" /></TableCell>
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
        <h3 className="text-xl font-semibold">No Students Found</h3>
        <p className="text-muted-foreground">There are no students matching your current criteria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 hidden sm:table-cell"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">RUT</TableHead>
            <TableHead>Career</TableHead>
            <TableHead className="hidden lg:table-cell">Practicum Level</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="hidden sm:table-cell">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="person avatar" />
                  <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                <div className="font-medium">{student.name}</div>
                <div className="text-xs text-muted-foreground">{student.email}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{student.rut}</TableCell>
              <TableCell>{student.career}</TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge variant="secondary">{student.practicumLevel}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{student.location}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => onEdit(student)}>
                  <Pencil className="h-4 w-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Edit</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
