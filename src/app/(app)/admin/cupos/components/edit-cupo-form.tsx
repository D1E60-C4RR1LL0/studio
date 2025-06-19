"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { CupoFormFields} from "./cupo-form-fields";
import { cupoFormSchema, type CupoFormData } from "@/lib/schemas/cupo-schema";

import type { Cupo } from "@/lib/definitions";

interface EditCupoFormProps {
    initialCupo: Cupo;
    onSave: (data: Omit<Cupo, "id">) => Promise<void>;
    onCancel: () => void;
}

export function EditCupoForm({ initialCupo, onSave, onCancel }: EditCupoFormProps) {
    const form = useForm<CupoFormData>({
        resolver: zodResolver(cupoFormSchema),
        defaultValues: {
            cantidad: initialCupo.cantidad,
            establecimiento_id: initialCupo.establecimiento_id,
            nivel_practica_id: initialCupo.nivel_practica_id,
            carrera_id: initialCupo.carrera_id,
        },
    });

    const onSubmit = async (data: CupoFormData) => {
        await onSave({
            cantidad: data.cantidad,
            establecimiento_id: data.establecimiento_id,
            nivel_practica_id: data.nivel_practica_id,
            carrera_id: data.carrera_id,
        });
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Editar Cupo</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <CupoFormFields form={form} />
                        <div className="flex gap-2">
                            <Button type="submit">Actualizar</Button>
                            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}