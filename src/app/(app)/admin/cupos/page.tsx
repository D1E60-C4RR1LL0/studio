"use client";

import { useEffect, useState } from "react";
import { getCupos, saveCupo, updateCupo, deleteCupo } from "@/lib/api/cupos";
import type { Cupo } from "@/lib/definitions";
import { PageHeader } from "@/components/page-header";
import { CuposTable } from "./components/cupos-table";
import { AddCupoForm } from "./components/add-cupo-form";
import { EditCupoForm } from "./components/edit-cupo-form";

export default function CuposPage() {
    const [cupos, setCupos] = useState<Cupo[]>([]);
    const [view, setView] = useState<"table" | "add" | "edit">("table");
    const [selectedCupo, setSelectedCupo] = useState<Cupo | null>(null);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        fetchCupos();
    }, []);

    const fetchCupos = async () => {
        try {
            const data = await getCupos();
            setCupos(data);
        } catch (error) {
            console.error("Error fetching cupos:", error);
        }
    };

    const handleSave = async (data: Omit<Cupo, "id">) => {
        try {
            await saveCupo(data);
            await fetchCupos();
            setView("table");
        } catch (error) {
            console.error("Error saving cupo:", error);
        }
    };

    const handleUpdate = async (id: number, data: Omit<Cupo, "id">) => {
        try {
            await updateCupo(id, data);
            await fetchCupos();
            setView("table");
        } catch (error) {
            console.error("Error updating cupo:", error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteCupo(id);
            await fetchCupos();
        } catch (error) {
            console.error("Error deleting cupo:", error);
        }
    };

    return (
        <div className="p-4 md:p-6">
            <PageHeader
                title="Asignación de Cupos"
                description="Asigne cupos por nivel de práctica y establecimiento."
            />

            {view === "table" && (
                <CuposTable
                    cupos={cupos}
                    isLoading={isLoading}
                    onEdit={(cupo) => {
                        setSelectedCupo(cupo);
                        setView("edit");
                    }}
                    onDelete={handleDelete}
                    onAdd={() => setView("add")}
                />
            )}

            {view === "add" && (
                <AddCupoForm
                    onSave={handleSave}
                    onCancel={() => setView("table")}
                />
            )}

            {view === "edit" && selectedCupo && (
                <EditCupoForm
                    initialCupo={selectedCupo}
                    onSave={(data) => handleUpdate(selectedCupo.id, data)}
                    onCancel={() => setView("table")}
                />
            )}
        </div>
    );
}
