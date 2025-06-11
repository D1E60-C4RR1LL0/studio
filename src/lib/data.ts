
import type { Student, Institution, AcademicLevel, Career, Commune, Tutor } from './definitions';

export const mockStudentsData: Student[] = [
  { id: '1', firstName: 'Ana Sofía', lastNamePaternal: 'Pérez', lastNameMaternal: 'García', rut: '11.111.111-1', career: 'Ingeniería de Software', email: 'ana.perez@example.com', practicumLevel: 'Práctica I', periodo: '2024-1', tutor: 'Dr. Carlos Soto', commune: 'Santiago', specialConditions: 'Requiere configuración para trabajo remoto', avatar: 'https://placehold.co/100x100.png' },
  { id: '2', firstName: 'Juan José', lastNamePaternal: 'Rodríguez', lastNameMaternal: 'Vera', rut: '22.222.222-2', career: 'Diseño Gráfico', email: 'juan.rodriguez@example.com', practicumLevel: 'Práctica Profesional', periodo: '2024-1', tutor: 'Prof. Laura Vera', commune: 'Valparaíso', avatar: 'https://placehold.co/100x100.png' },
  { id: '3', firstName: 'María Fernanda', lastNamePaternal: 'González', lastNameMaternal: 'Díaz', rut: '33.333.333-3', career: 'Administración de Empresas', email: 'maria.gonzalez@example.com', practicumLevel: 'Práctica II', periodo: '2023-2', tutor: 'Dr. Roberto Diaz', commune: 'Providencia', specialConditions: 'Necesita lugar de trabajo accesible', avatar: 'https://placehold.co/100x100.png' },
  { id: '4', firstName: 'Luis Alberto', lastNamePaternal: 'Martínez', lastNameMaternal: 'Soto', rut: '44.444.444-4', career: 'Ingeniería de Software', email: 'luis.martinez@example.com', practicumLevel: 'Práctica I', periodo: '2024-1', tutor: 'Dr. Carlos Soto', commune: 'Concepción', avatar: 'https://placehold.co/100x100.png' },
  { id: '5', firstName: 'Camila Andrea', lastNamePaternal: 'Silva', lastNameMaternal: 'Reyes', rut: '55.555.555-5', career: 'Ingeniería Civil', email: 'camila.silva@example.com', practicumLevel: 'Práctica Profesional', periodo: '2023-2', tutor: 'Prof. Elena Reyes', commune: 'Antofagasta', avatar: 'https://placehold.co/100x100.png' },
];
// Use a mutable copy for operations like add/update
let mockStudents: Student[] = [...mockStudentsData];


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

export const mockCareers: Career[] = [
    { id: 'car1', name: 'Ingeniería de Software' },
    { id: 'car2', name: 'Diseño Gráfico' },
    { id: 'car3', name: 'Administración de Empresas' },
    { id: 'car4', name: 'Ingeniería Civil' },
    { id: 'car5', name: 'Psicología' },
    { id: 'car6', name: 'Pedagogía en Educación Básica' },
];

export const mockCommunes: Commune[] = [
    { id: 'com1', name: 'Santiago' },
    { id: 'com2', name: 'Providencia' },
    { id: 'com3', name: 'Las Condes' },
    { id: 'com4', name: 'Valparaíso' },
    { id: 'com5', name: 'Viña del Mar' },
    { id: 'com6', name: 'Concepción' },
    { id: 'com7', name: 'Antofagasta' },
];

export const mockTutors: Tutor[] = [
    { id: 'tut1', name: 'Dr. Carlos Soto' },
    { id: 'tut2', name: 'Prof. Laura Vera' },
    { id: 'tut3', name: 'Dr. Roberto Diaz' },
    { id: 'tut4', name: 'Prof. Elena Reyes' },
    { id: 'tut5', name: 'Mg. Andrea Campos' },
];

export async function getStudents(): Promise<Student[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockStudents]; // Return a copy
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockStudents.find(s => s.id === id);
}

export async function saveStudent(studentToSave: Student): Promise<Student> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockStudents.findIndex(s => s.id === studentToSave.id);
  if (index !== -1) {
    mockStudents[index] = studentToSave;
  } else {
    mockStudents.push(studentToSave);
  }
  return studentToSave;
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

export async function getCareers(): Promise<Career[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCareers;
}

export async function getCommunes(): Promise<Commune[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCommunes;
}

export async function getTutors(): Promise<Tutor[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockTutors;
}
