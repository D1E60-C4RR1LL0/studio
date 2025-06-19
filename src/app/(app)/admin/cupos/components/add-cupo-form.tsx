"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { CupoFormFields} from "./cupo-form-fields";
import { cupoFormSchema, type CupoFormData } from "@/lib/schemas/cupo-schema";


interface AddCupoFormProps {
    onSave: (data: Omit<CupoFormData, "id">) => Promise<void>;
    onCancel: () => void;
}

export function AddCupoForm({ onSave, onCancel }: AddCupoFormProps) {
    const form = useForm<CupoFormData>({
        resolver: zodResolver(cupoFormSchema),
        defaultValues: {
            cantidad: 0,
            establecimiento_id: "",
            nivel_practica_id: "",
            carrera_id: "",
        },
    });

    const onSubmit = async (data: CupoFormData) => {
        await onSave({
            cantidad: data.cantidad,
            establecimiento_id: data.establecimiento_id,
            nivel_practica_id: data.nivel_practica_id,
            carrera_id: data.carrera_id,
        });
        form.reset();
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Asignar Cupo</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <CupoFormFields form={form} />
                        <div className="flex gap-2">
                            <Button type="submit">Guardar</Button>
                            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export { CupoFormData };
