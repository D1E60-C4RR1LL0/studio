import type { Student, Institution, AcademicLevel } from './definitions';

export const mockStudents: Student[] = [
  { id: '1', name: 'Ana Sofía Pérez García', rut: '11.111.111-1', career: 'Software Engineering', email: 'ana.perez@example.com', practicumLevel: 'Practicum I', tutor: 'Dr. Carlos Soto', location: 'Tech Solutions Inc.', specialConditions: 'Requires remote work setup', avatar: 'https://placehold.co/100x100.png' },
  { id: '2', name: 'Juan José Rodríguez Vera', rut: '22.222.222-2', career: 'Graphic Design', email: 'juan.rodriguez@example.com', practicumLevel: 'Professional Practicum', tutor: 'Prof. Laura Vera', location: 'Creative Designs LLC', avatar: 'https://placehold.co/100x100.png' },
  { id: '3', name: 'María Fernanda González Díaz', rut: '33.333.333-3', career: 'Business Administration', email: 'maria.gonzalez@example.com', practicumLevel: 'Practicum II', tutor: 'Dr. Roberto Diaz', location: 'Global Corp', specialConditions: 'Accessible workplace needed', avatar: 'https://placehold.co/100x100.png' },
  { id: '4', name: 'Luis Alberto Martínez Soto', rut: '44.444.444-4', career: 'Software Engineering', email: 'luis.martinez@example.com', practicumLevel: 'Practicum I', tutor: 'Dr. Carlos Soto', location: 'Innovatech', avatar: 'https://placehold.co/100x100.png' },
  { id: '5', name: 'Camila Andrea Silva Reyes', rut: '55.555.555-5', career: 'Civil Engineering', email: 'camila.silva@example.com', practicumLevel: 'Professional Practicum', tutor: 'Prof. Elena Reyes', location: 'BuildWell Constructions', avatar: 'https://placehold.co/100x100.png' },
];

export const mockInstitutions: Institution[] = [
  { id: 'inst1', name: 'Tech Solutions Inc.', location: 'Santiago', contactName: 'Roberto Morales', contactEmail: 'roberto.morales@techsolutions.com', contactPhone: '+56912345678', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst2', name: 'Creative Designs LLC', location: 'Valparaíso', contactName: 'Sofia Castro', contactEmail: 'sofia.castro@creativedesigns.com', contactPhone: '+56987654321', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst3', name: 'Global Corp', location: 'Santiago', contactName: 'Fernando López', contactEmail: 'fernando.lopez@globalcorp.com', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst4', name: 'Innovatech', location: 'Concepción', contactName: 'Gabriela Núñez', contactEmail: 'gabriela.nunez@innovatech.com', contactPhone: '+56911223344', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst5', name: 'BuildWell Constructions', location: 'Antofagasta', contactName: 'Andrés Torres', contactEmail: 'andres.torres@buildwell.com', logo: 'https://placehold.co/150x50.png' },
];

export const mockAcademicLevels: AcademicLevel[] = [
  { id: 'level1', name: 'Practicum I' },
  { id: 'level2', name: 'Practicum II' },
  { id: 'level3', name: 'Professional Practicum' },
  { id: 'level4', name: 'Internship Initial Phase' },
  { id: 'level5', name: 'Internship Final Phase' },
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
  throw new Error('Student not found');
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
  throw new Error('Institution not found');
}

export async function getAcademicLevels(): Promise<AcademicLevel[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockAcademicLevels;
}
