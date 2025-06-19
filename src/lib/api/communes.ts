// lib/api/communes.ts
"use server";

import { revalidatePath } from "next/cache";
import { Commune } from "@/lib/definitions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * Fetch all communes from the API
 */
export async function getCommunes(): Promise<Commune[]> {
    const res = await fetch(`${API_BASE_URL}/comunas`);
    if (!res.ok) throw new Error("Error fetching communes");
    return res.json();
}

/**
 * Save a new commune to the API
 */
export async function saveCommune(commune: Omit<Commune, "id">): Promise<Commune> {
    const res = await fetch(`${API_BASE_URL}/comunas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: commune.nombre }),
    });
    if (!res.ok) throw new Error("Error saving commune");
    const data = await res.json();
    revalidatePath("/admin/comunas");
    return data;
}

/**
 * Update an existing commune
 */
export async function updateCommune(id: string, commune: Omit<Commune, "id">): Promise<Commune> {
    const res = await fetch(`${API_BASE_URL}/comunas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: commune.nombre }),
    });
    if (!res.ok) throw new Error("Error updating commune");
    const data = await res.json();
    revalidatePath("/admin/comunas");
    return data;
}

/**
 * Get a specific commune by ID
 */
export async function getCommuneById(id: string): Promise<Commune> {
    const res = await fetch(`${API_BASE_URL}/comunas/${id}`);
    if (!res.ok) throw new Error("Error fetching commune by ID");
    return res.json();
}

/**
 * Delete a commune by ID
 */
export async function deleteCommune(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/comunas/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error deleting commune");
    revalidatePath("/admin/comunas");
}
