"use server";

import { AcademicLevel } from "@/lib/definitions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function getAcademicLevels(): Promise<AcademicLevel[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/nivelpractica`);
    if (!res.ok) throw new Error("Error fetching academic levels");
    return res.json();
}

export async function saveAcademicLevel(level: Omit<AcademicLevel, "id">): Promise<AcademicLevel> {
    const res = await fetch(`${API_BASE_URL}/api/v1/nivelpractica`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(level),
    });
    if (!res.ok) throw new Error("Error saving academic level");
    return res.json();
}

export async function getAcademicLevelById(id: string): Promise<AcademicLevel> {
    const res = await fetch(`${API_BASE_URL}/api/v1/nivelpractica/${id}`);
    if (!res.ok) throw new Error("Error fetching academic level by ID");
    return res.json();
}

export async function updateAcademicLevel(id: string, level: Omit<AcademicLevel, "id">): Promise<AcademicLevel> {
    const res = await fetch(`${API_BASE_URL}/api/v1/nivelpractica/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(level),
    });
    if (!res.ok) throw new Error("Error updating academic level");
    return res.json();
}

export async function deleteAcademicLevel(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/v1/nivelpractica/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error deleting academic level");
}

export async function getAllAcademicLevels(): Promise<AcademicLevel[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/nivelpractica`);
    if (!res.ok) throw new Error("Error fetching academic levels");
    return res.json();
}

