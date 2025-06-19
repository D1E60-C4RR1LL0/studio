"use client";

import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Cupo } from "@/lib/definitions";

interface CuposTableProps {
    cupos: Cupo[];
    isLoading: boolean; // ✅ añade esta línea
    onEdit: (cupo: Cupo) => void;
    onDelete: (id: number) => Promise<void>;
    onAdd: () => void;
}

export function CuposTable({ cupos, isLoading, onEdit, onDelete, onAdd }: CuposTableProps) {
    if (isLoading) {
        return <p>Cargando cupos...</p>;
    }
    return (
        <div className="rounded-md border shadow-sm p-4">
            <div className="flex justify-end mb-4">
                <Button onClick={onAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Asignar Nuevo Cupo
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Establecimiento</TableHead>
                        <TableHead>Nivel de Práctica</TableHead>
                        <TableHead>Carrera</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cupos.map((cupo) => (
                        <TableRow key={cupo.id}>
                            <TableCell>{cupo.cantidad}</TableCell>
                            <TableCell>{cupo.establecimiento_id}</TableCell>
                            <TableCell>{cupo.nivel_practica_id}</TableCell>
                            <TableCell>{cupo.carrera_id}</TableCell>
                            <TableCell className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => onEdit(cupo)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => onDelete(cupo.id)}>
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