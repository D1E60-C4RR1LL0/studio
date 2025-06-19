import { Student } from "@/lib/definitions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function getStudents(): Promise<Student[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/estudiantes`);
    if (!res.ok) throw new Error("Error al obtener estudiantes");
    return res.json();
}

export async function getStudentById(id: string): Promise<Student> {
    const res = await fetch(`${API_BASE_URL}/api/v1/estudiantes/${id}`);
    if (!res.ok) throw new Error("Error al obtener estudiante");
    return res.json();
}

export async function createStudent(student: Omit<Student, "id">): Promise<Student> {
    const res = await fetch(`${API_BASE_URL}/api/v1/estudiantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
    });
    if (!res.ok) throw new Error("Error al crear estudiante");
    return res.json();
}

export async function updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    const res = await fetch(`${API_BASE_URL}/api/v1/estudiantes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
    });
    if (!res.ok) throw new Error("Error al actualizar estudiante");
    return res.json();
}

export async function deleteStudent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/v1/estudiantes/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar estudiante");
}

export async function saveStudentToAPI(student: Omit<Student, "id">): Promise<Student> {
  const response = await fetch(`${API_BASE_URL}/api/v1/estudiantes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });

  if (!response.ok) throw new Error("Error al guardar el estudiante");
  return response.json();
}
