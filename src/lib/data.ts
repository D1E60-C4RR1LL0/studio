
import type { Student, Institution, AcademicLevel, Career, Commune, Tutor } from './definitions';

const API_BASE = 'http://localhost:8000/api/v1';

// --- STUDENTS ---
export async function getStudents(): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/estudiantes`);
  if (!res.ok) throw new Error('Failed to fetch estudiantes');
  return res.json();
}

export async function getStudentById(id: string): Promise<Student> {
  const res = await fetch(`${API_BASE}/estudiantes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch estudiante');
  return res.json();
}

export async function saveStudent(student: Partial<Student>): Promise<Student> {
  const method = student.id ? 'PUT' : 'POST';
  const url = student.id ? `${API_BASE}/estudiantes/${student.id}` : `${API_BASE}/estudiantes`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error('Failed to save estudiante');
  return res.json();
}

// --- INSTITUTIONS ---
export async function getInstitutions(): Promise<Institution[]> {
  const res = await fetch(`${API_BASE}/establecimientos`);
  if (!res.ok) throw new Error('Failed to fetch establecimientos');
  return res.json();
}

export async function getInstitutionById(id: string): Promise<Institution> {
  const res = await fetch(`${API_BASE}/establecimientos/${id}`);
  if (!res.ok) throw new Error('Failed to fetch establecimiento');
  return res.json();
}

export async function saveInstitution(institution: Partial<Institution>): Promise<Institution> {
  const method = institution.id ? 'PUT' : 'POST';
  const url = institution.id ? `${API_BASE}/establecimientos/${institution.id}` : `${API_BASE}/establecimientos`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(institution),
  });
  if (!res.ok) throw new Error('Failed to save establecimiento');
  return res.json();
}

export async function deleteInstitution(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/establecimientos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete establecimiento');
}

// --- CAREERS ---
export async function getCareers(): Promise<Career[]> {
  const res = await fetch(`${API_BASE}/carreras`);
  if (!res.ok) throw new Error('Failed to fetch carreras');
  return res.json();
}

export async function saveCareer(career: Partial<Career>): Promise<Career> {
  const method = career.id ? 'PUT' : 'POST';
  const url = career.id ? `${API_BASE}/carreras/${career.id}` : `${API_BASE}/carreras`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(career),
  });
  if (!res.ok) throw new Error('Failed to save carrera');
  return res.json();
}

export async function deleteCareer(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/carreras/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete carrera');
}

// --- TUTORS ---
export async function getTutors(): Promise<Tutor[]> {
  const res = await fetch(`${API_BASE}/tutores`);
  if (!res.ok) throw new Error('Failed to fetch tutores');
  return res.json();
}

export async function saveTutor(tutor: Partial<Tutor>): Promise<Tutor> {
  const method = tutor.id ? 'PUT' : 'POST';
  const url = tutor.id ? `${API_BASE}/tutores/${tutor.id}` : `${API_BASE}/tutores`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tutor),
  });
  if (!res.ok) throw new Error('Failed to save tutor');
  return res.json();
}

export async function deleteTutor(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tutores/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete tutor');
}

// --- COMMUNES ---
export async function getCommunes(): Promise<Commune[]> {
  const res = await fetch(`${API_BASE}/comunas`);
  if (!res.ok) throw new Error('Failed to fetch comunas');
  return res.json();
}

export async function saveCommune(commune: Partial<Commune>): Promise<Commune> {
  const method = commune.id ? 'PUT' : 'POST';
  const url = commune.id ? `${API_BASE}/comunas/${commune.id}` : `${API_BASE}/comunas`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commune),
  });
  if (!res.ok) throw new Error('Failed to save comuna');
  return res.json();
}

export async function deleteCommune(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/comunas/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete comuna');
}



// --- Global Deletion (if implemented in backend) ---
export async function deleteAllData(): Promise<void> {
  const res = await fetch(`${API_BASE}/carga_masiva/vaciadoDB`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete all data');
}
