// lib/api/institutions.ts
import { Institution } from "@/lib/definitions";
import { getCommuneById } from "./communes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Obtener todas las instituciones (establecimientos)
 */
export async function getInstitutionsFromAPI(): Promise<Institution[]> {
    const response = await fetch(`${API_BASE_URL}/establecimientos`);
    if (!response.ok) {
        throw new Error("Error al obtener establecimientos");
    }
    return response.json();
}

/**
 * Obtener un establecimiento por ID
 */
export async function getInstitutionByIdFromAPI(id: string): Promise<Institution> {
    const response = await fetch(`${API_BASE_URL}/establecimientos/${id}`);
    const institution = await response.json() as Institution;
    institution.comuna_id = await (await getCommuneById(institution.comuna_id.toString())).nombre;
    if (!response.ok) {
        throw new Error("Establecimiento no encontrado");
    }
    return institution
}

/**
 * Crear o actualizar un establecimiento
 */
export async function saveInstitutionToAPI(institution: Omit<Institution, "id"> | Institution): Promise<Institution> {
    const method = "id" in institution ? "PUT" : "POST";
    const url = "id" in institution
        ? `${API_BASE_URL}/establecimientos/${institution.id}`
        : `${API_BASE_URL}/establecimientos`;

    const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(institution),
    });

    if (!response.ok) {
        throw new Error("Error al guardar establecimiento");
    }
    return response.json();
}

/**
 * Eliminar un establecimiento por ID
 */
export async function deleteInstitutionFromAPI(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/establecimientos/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Error al eliminar establecimiento");
    }
}
