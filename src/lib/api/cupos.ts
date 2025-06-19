// lib/api/cupos.ts
"use server";

import { revalidatePath } from "next/cache";
import { Cupo } from "@/lib/definitions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const RESOURCE = `${API_BASE_URL}/api/v1/cupos`;

export async function getCupos(): Promise<Cupo[]> {
    const res = await fetch(RESOURCE);
    if (!res.ok) throw new Error("Error fetching cupos");
    return res.json();
}

export async function getCupoById(id: number): Promise<Cupo> {
    const res = await fetch(`${RESOURCE}/${id}`);
    if (!res.ok) throw new Error("Error fetching cupo by ID");
    return res.json();
}

export async function saveCupo(cupo: Omit<Cupo, "id">): Promise<Cupo> {
    const res = await fetch(RESOURCE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cupo),
    });
    if (!res.ok) throw new Error("Error creating cupo");
    const data = await res.json();
    revalidatePath("/admin/cupos");
    return data;
}

export async function updateCupo(id: number, cupo: Omit<Cupo, "id">): Promise<Cupo> {
    const res = await fetch(`${RESOURCE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cupo),
    });
    if (!res.ok) throw new Error("Error updating cupo");
    const data = await res.json();
    revalidatePath("/admin/cupos");
    return data;
}

export async function deleteCupo(id: number): Promise<void> {
    const res = await fetch(`${RESOURCE}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error deleting cupo");
    revalidatePath("/admin/cupos");
}

export async function getCuposByInstitution(institutionId: string): Promise<Cupo[]> {
    const res = await fetch(`${API_BASE_URL}/cupos`);
    if (!res.ok) throw new Error("Error al obtener todos los cupos");

    const allCupos: Cupo[] = await res.json();
    return allCupos.filter(cupo => cupo.establecimiento_id === institutionId);
}
