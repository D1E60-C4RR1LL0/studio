
"use client";

import * as React from "react";
import type { Career } from "@/lib/definitions";
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
import { Edit3, Trash2, NotebookText } from "lucide-react";

interface CareersTableProps {
  careers: Career[];
  isLoading: boolean;
  onEdit: (career: Career) => void;
  onDelete: (career: Career) => void;
}

export function CareersTable({ careers, isLoading, onEdit, onDelete }: CareersTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre de la Carrera</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (careers.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border rounded-md">
        <NotebookText className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">No se encontraron carreras</h3>
        <p className="text-muted-foreground">No hay carreras que coincidan con su búsqueda o no se han agregado aún.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre de la Carrera</TableHead>
            <TableHead className="text-right w-[150px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {careers.map((career) => (
            <TableRow key={career.id}>
              <TableCell className="font-medium">{career.name}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(career)} title="Editar">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(career)} title="Eliminar" className="text-destructive hover:text-destructive">
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
