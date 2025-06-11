
import type { Student, Institution, AcademicLevel } from './definitions';

export const mockStudents: Student[] = [
  { id: '1', name: 'Ana Sofía Pérez García', rut: '11.111.111-1', career: 'Ingeniería de Software', email: 'ana.perez@example.com', practicumLevel: 'Práctica I', periodo: '2024-1', tutor: 'Dr. Carlos Soto', location: 'Soluciones Tecnológicas Inc.', specialConditions: 'Requiere configuración para trabajo remoto', avatar: 'https://placehold.co/100x100.png' },
  { id: '2', name: 'Juan José Rodríguez Vera', rut: '22.222.222-2', career: 'Diseño Gráfico', email: 'juan.rodriguez@example.com', practicumLevel: 'Práctica Profesional', periodo: '2024-1', tutor: 'Prof. Laura Vera', location: 'Diseños Creativos LLC', avatar: 'https://placehold.co/100x100.png' },
  { id: '3', name: 'María Fernanda González Díaz', rut: '33.333.333-3', career: 'Administración de Empresas', email: 'maria.gonzalez@example.com', practicumLevel: 'Práctica II', periodo: '2023-2', tutor: 'Dr. Roberto Diaz', location: 'Global Corp', specialConditions: 'Necesita lugar de trabajo accesible', avatar: 'https://placehold.co/100x100.png' },
  { id: '4', name: 'Luis Alberto Martínez Soto', rut: '44.444.444-4', career: 'Ingeniería de Software', email: 'luis.martinez@example.com', practicumLevel: 'Práctica I', periodo: '2024-1', tutor: 'Dr. Carlos Soto', location: 'Innovatech', avatar: 'https://placehold.co/100x100.png' },
  { id: '5', name: 'Camila Andrea Silva Reyes', rut: '55.555.555-5', career: 'Ingeniería Civil', email: 'camila.silva@example.com', practicumLevel: 'Práctica Profesional', periodo: '2023-2', tutor: 'Prof. Elena Reyes', location: 'Construcciones BuildWell', avatar: 'https://placehold.co/100x100.png' },
];

export const mockInstitutions: Institution[] = [
  { id: 'inst1', name: 'Soluciones Tecnológicas Inc.', location: 'Santiago', contactName: 'Roberto Morales', contactEmail: 'roberto.morales@techsolutions.com', contactPhone: '+56912345678', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst2', name: 'Diseños Creativos LLC', location: 'Valparaíso', contactName: 'Sofia Castro', contactEmail: 'sofia.castro@creativedesigns.com', contactPhone: '+56987654321', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst3', name: 'Global Corp', location: 'Santiago', contactName: 'Fernando López', contactEmail: 'fernando.lopez@globalcorp.com', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst4', name: 'Innovatech', location: 'Concepción', contactName: 'Gabriela Núñez', contactEmail: 'gabriela.nunez@innovatech.com', contactPhone: '+56911223344', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst5', name: 'Construcciones BuildWell', location: 'Antofagasta', contactName: 'Andrés Torres', contactEmail: 'andres.torres@buildwell.com', logo: 'https://placehold.co/150x50.png' },
];

export const mockAcademicLevels: AcademicLevel[] = [
  { id: 'level1', name: 'Práctica I' },
  { id: 'level2', name: 'Práctica II' },
  { id: 'level3', name: 'Práctica Profesional' },
  { id: 'level4', name: 'Pasantía Fase Inicial' },
  { id: 'level5', name: 'Pasantía Fase Final' },
];

export async function getStudents(): Promise<Student[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockStudents;
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockStudents.find(s => s.id === id);
}

export async function updateStudent(updatedStudent: Student): Promise<Student> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockStudents.findIndex(s => s.id === updatedStudent.id);
  if (index !== -1) {
    mockStudents[index] = updatedStudent;
    return updatedStudent;
  }
  throw new Error('Estudiante no encontrado');
}

export async function getInstitutions(): Promise<Institution[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockInstitutions;
}

export async function getInstitutionById(id: string): Promise<Institution | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockInstitutions.find(i => i.id === id);
}

export async function updateInstitution(updatedInstitution: Institution): Promise<Institution> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockInstitutions.findIndex(i => i.id === updatedInstitution.id);
  if (index !== -1) {
    mockInstitutions[index] = updatedInstitution;
    return updatedInstitution;
  }
  throw new Error('Institución no encontrada');
}

export async function getAcademicLevels(): Promise<AcademicLevel[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockAcademicLevels;
}
