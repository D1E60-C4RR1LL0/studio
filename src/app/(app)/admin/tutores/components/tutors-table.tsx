
"use client";

import * as React from "react";
import type { Tutor } from "@/lib/definitions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit3, Trash2, Contact2 } from "lucide-react";

interface TutorsTableProps {
  tutors: Tutor[];
  isLoading: boolean;
  onEdit: (tutor: Tutor) => void;
  onDelete: (tutor: Tutor) => void;
}

export function TutorsTable({ tutors, isLoading, onEdit, onDelete }: TutorsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Tutor</TableHead>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (tutors.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border rounded-md">
        <Contact2 className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">No se encontraron tutores</h3>
        <p className="text-muted-foreground">No hay tutores que coincidan con su búsqueda o no se han agregado aún.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del Tutor</TableHead>
            <TableHead>Correo Electrónico</TableHead>
            <TableHead className="text-right w-[150px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tutors.map((tutor) => (
            <TableRow key={tutor.id}>
              <TableCell className="font-medium">{tutor.name}</TableCell>
              <TableCell>{tutor.email || <span className="text-muted-foreground">N/A</span>}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(tutor)} title="Editar">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(tutor)} title="Eliminar" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
