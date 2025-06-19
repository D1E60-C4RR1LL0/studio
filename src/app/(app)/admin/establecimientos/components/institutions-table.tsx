
"use client";

import * as React from "react";
import type { Institution } from "@/lib/definitions";
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
import { Edit3, Trash2, Landmark, Users } from "lucide-react"; // Added Users icon for contacts

interface InstitutionsTableProps {
  institutions: Institution[];
  isLoading: boolean;
  onEdit: (institution: Institution) => void;
  onDelete: (institution: Institution) => void;
}

export function InstitutionsTable({ institutions, isLoading, onEdit, onDelete }: InstitutionsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RBD</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Dependencia</TableHead>
              <TableHead>Comuna</TableHead>
              <TableHead className="text-center">Contactos</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-4 w-[30px] mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (institutions.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border rounded-md">
        <Landmark className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">No se encontraron establecimientos</h3>
        <p className="text-muted-foreground">No hay establecimientos que coincidan con su búsqueda o no se han agregado aún.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RBD</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Dependencia</TableHead>
            <TableHead>Comuna</TableHead>
            <TableHead className="text-center">Nº Contactos</TableHead>
            <TableHead className="text-right w-[150px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {institutions.map((institution) => (
            <TableRow key={institution.id}>
              <TableCell className="font-medium">{institution.rbd}</TableCell>
              <TableCell>{institution.nombre}</TableCell>
              <TableCell>{institution.dependencia}</TableCell>
              <TableCell>{institution.comuna_id}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                   <Users className="h-4 w-4 mr-1 text-muted-foreground"/> {institution.directivos?.length || 0}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(institution)} title="Editar">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(institution)} title="Eliminar" className="text-destructive hover:text-destructive">
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
