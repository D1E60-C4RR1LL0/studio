"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { type CupoFormData } from "./add-cupo-form"; // o "./edit-cupo-form" si lo defines ahí

interface CupoFormFieldsProps {
    form: UseFormReturn<CupoFormData>;
}

export function CupoFormFields({ form }: CupoFormFieldsProps) {
    return (
        <>
            <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cantidad de cupos *</FormLabel>
                        <FormControl>
                            <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}
export { CupoFormData };

