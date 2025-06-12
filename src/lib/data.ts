
import type { Student, Institution, AcademicLevel, Career, Commune, Tutor } from './definitions';

// Initial mock data (immutable)
export const mockStudentsData: Student[] = [
  { id: '1', firstName: 'Ana Sofía', lastNamePaternal: 'Pérez', lastNameMaternal: 'García', rut: '11.111.111-1', career: 'Ingeniería de Software', email: 'ana.perez@example.com', practicumLevel: 'Práctica I', tutor: 'Dr. Carlos Soto', commune: 'Santiago', location: 'Santiago', specialConditions: 'Requiere configuración para trabajo remoto' },
  { id: '2', firstName: 'Juan José', lastNamePaternal: 'Rodríguez', lastNameMaternal: 'Vera', rut: '22.222.222-2', career: 'Diseño Gráfico', email: 'juan.rodriguez@example.com', practicumLevel: 'Práctica Profesional', tutor: 'Prof. Laura Vera', commune: 'Valparaíso', location: 'Valparaíso' },
  { id: '3', firstName: 'María Fernanda', lastNamePaternal: 'González', lastNameMaternal: 'Díaz', rut: '33.333.333-3', career: 'Administración de Empresas', email: 'maria.gonzalez@example.com', practicumLevel: 'Práctica II', tutor: 'Dr. Roberto Diaz', commune: 'Providencia', location: 'Santiago', specialConditions: 'Necesita lugar de trabajo accesible' },
  { id: '4', firstName: 'Luis Alberto', lastNamePaternal: 'Martínez', lastNameMaternal: 'Soto', rut: '44.444.444-4', career: 'Ingeniería de Software', email: 'luis.martinez@example.com', practicumLevel: 'Práctica I', tutor: 'Dr. Carlos Soto', commune: 'Concepción', location: 'Concepción' },
  { id: '5', firstName: 'Camila Andrea', lastNamePaternal: 'Silva', lastNameMaternal: 'Reyes', rut: '55.555.555-5', career: 'Ingeniería Civil', email: 'camila.silva@example.com', practicumLevel: 'Práctica Profesional', tutor: 'Prof. Elena Reyes', commune: 'Antofagasta', location: 'Antofagasta' },
  { id: '6', firstName: 'Pedro Pascal', lastNamePaternal: 'Pérez', lastNameMaternal: 'Gómez', rut: '66.666.666-6', career: 'Pedagogía en Educación Parvularia', email: 'pedro.perez@example.com', practicumLevel: 'Práctica Pedagógica II', tutor: 'Prof. Andrea Campos', commune: 'Concepción', location: 'Concepción' },
];

function initializeStudents(): Student[] {
  if (typeof window !== 'undefined') {
    const storedStudents = localStorage.getItem('practicumStudents');
    if (storedStudents) {
      try {
        const parsedStudents = JSON.parse(storedStudents);
        return parsedStudents.map((s: Student) => ({ ...s, location: s.location || s.commune || 'Desconocida' }));
      } catch (e) {
        console.error("Error parsing students from localStorage", e);
      }
    }
  }
  return [...mockStudentsData].map(s => ({ ...s, location: s.location || s.commune || 'Desconocida' }));
}

let mockStudents: Student[] = initializeStudents();

function persistStudents() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('practicumStudents', JSON.stringify(mockStudents));
  }
}

export const mockInitialInstitutions: Institution[] = [
  { id: 'inst1', rbd: '1001', name: 'Soluciones Tecnológicas Inc.', dependency: 'Particular Pagado', location: 'Santiago', contactName: 'Roberto Morales', contactEmail: 'roberto.morales@techsolutions.com', contactPhone: '+56912345678', contactRole: 'Gerente de Proyectos', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst2', rbd: '1002', name: 'Diseños Creativos LLC', dependency: 'Particular Pagado', location: 'Valparaíso', contactName: 'Sofia Castro', contactEmail: 'sofia.castro@creativedesigns.com', contactPhone: '+56987654321', contactRole: 'Directora de Arte', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst3', rbd: '16793', name: 'LICEO TÉCNICO PROFESIONAL LA ARAUCANA', dependency: 'PART. SUBV.', location: 'Concepción', contactName: 'Fernando López', contactEmail: 'fernando.lopez@globalcorp.com', contactRole: 'Jefe de Operaciones', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst4', rbd: '1004', name: 'Escuela Tres Palitos', dependency: 'Municipal', location: 'Concepción', contactName: 'Condorito Pérez', contactEmail: 'condor.rector@palitos.cl', contactPhone: '+56911223344', contactRole: 'Director Académico', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst5', rbd: '1005', name: 'Construcciones BuildWell', dependency: 'Particular Pagado', location: 'Antofagasta', contactName: 'Andrés Torres', contactEmail: 'andres.torres@buildwell.com', contactRole: 'Jefe de Obra', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst6', rbd: '1006', name: 'Colegio Los Robles', dependency: 'Particular Subvencionado', location: 'Concepción', contactName: 'Ana María Silva', contactEmail: 'amsilva@losrobles.cl', contactRole: 'Coordinadora Académica', logo: 'https://placehold.co/150x50.png'}
];

function initializeInstitutions(): Institution[] {
  if (typeof window !== 'undefined') {
    const storedInstitutions = localStorage.getItem('practicumInstitutions');
    if (storedInstitutions) {
      try {
        return JSON.parse(storedInstitutions);
      } catch (e) {
        console.error("Error parsing institutions from localStorage", e);
      }
    }
  }
  return [...mockInitialInstitutions];
}

let mockInstitutions: Institution[] = initializeInstitutions();

function persistInstitutions() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('practicumInstitutions', JSON.stringify(mockInstitutions));
  }
}


export const mockAcademicLevels: AcademicLevel[] = [
  { id: 'level1', name: 'Práctica I' },
  { id: 'level2', name: 'Práctica II' },
  { id: 'level3', name: 'Práctica Profesional' },
  { id: 'level4', name: 'Pasantía Fase Inicial' },
  { id: 'level5', name: 'Pasantía Fase Final' },
  { id: 'level6', name: 'Práctica Pedagógica I'},
  { id: 'level7', name: 'Práctica Pedagógica II'},
];

export const mockCareers: Career[] = [
    { id: 'car1', name: 'Ingeniería de Software' },
    { id: 'car2', name: 'Diseño Gráfico' },
    { id: 'car3', name: 'Administración de Empresas' },
    { id: 'car4', name: 'Ingeniería Civil' },
    { id: 'car5', name: 'Psicología' },
    { id: 'car6', name: 'Pedagogía en Educación Básica' },
    { id: 'car7', name: 'Pedagogía en Educación Parvularia' },
];

export const mockCommunes: Commune[] = [
    { id: 'com1', name: 'Santiago' },
    { id: 'com2', name: 'Providencia' },
    { id: 'com3', name: 'Las Condes' },
    { id: 'com4', name: 'Valparaíso' },
    { id: 'com5', name: 'Viña del Mar' },
    { id: 'com6', name: 'Concepción' },
    { id: 'com7', name: 'Antofagasta' },
    { id: 'com8', name: 'Talcahuano'},
    { id: 'com9', name: 'San Pedro de la Paz'},
];

export const mockTutors: Tutor[] = [
    { id: 'tut1', name: 'Dr. Carlos Soto' },
    { id: 'tut2', name: 'Prof. Laura Vera' },
    { id: 'tut3', name: 'Dr. Roberto Diaz' },
    { id: 'tut4', name: 'Prof. Elena Reyes' },
    { id: 'tut5', name: 'Mg. Andrea Campos' },
    { id: 'tut6', name: 'Juan Pérez (juan.perez@ucsc.cl)'}
];

// Student Data Functions
export async function getStudents(): Promise<Student[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (mockStudents.length === 0 && typeof window !== 'undefined' && !localStorage.getItem('practicumStudents')) {
    mockStudents = [...mockStudentsData].map(s => ({ ...s, location: s.location || s.commune || 'Desconocida' }));
    persistStudents();
  } else if (mockStudents.length === 0 && (typeof window === 'undefined' || !localStorage.getItem('practicumStudents'))) {
    mockStudents = [...mockStudentsData].map(s => ({ ...s, location: s.location || s.commune || 'Desconocida' }));
  }
  return [...mockStudents];
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockStudents.find(s => s.id === id);
}

export async function saveStudent(studentToSave: Student | Omit<Student, 'id'>): Promise<Student> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const studentDataWithId: Student = (studentToSave as Student).id && !(studentToSave as Student).id.startsWith('new-')
    ? studentToSave as Student
    : { ...studentToSave, id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` } as Student;

  const studentWithLocation = {
    ...studentDataWithId,
    location: studentDataWithId.location || studentDataWithId.commune || 'Desconocida' 
  };

  const index = mockStudents.findIndex(s => s.id === studentWithLocation.id);

  if (index !== -1) {
    mockStudents[index] = studentWithLocation;
  } else {
    mockStudents.push(studentWithLocation);
  }
  persistStudents();
  return studentWithLocation;
}

export async function deleteAllStudents(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  mockStudents = [];
  persistStudents();
}

// Institution Data Functions
export async function getInstitutions(): Promise<Institution[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
   if (mockInstitutions.length === 0 && typeof window !== 'undefined' && !localStorage.getItem('practicumInstitutions')) {
    mockInstitutions = [...mockInitialInstitutions];
    persistInstitutions();
  } else if (mockInstitutions.length === 0 && (typeof window === 'undefined' || !localStorage.getItem('practicumInstitutions'))) {
    mockInstitutions = [...mockInitialInstitutions];
  }
  return [...mockInstitutions];
}

export async function getInstitutionById(id: string): Promise<Institution | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockInstitutions.find(i => i.id === id);
}

export async function saveInstitution(institutionToSave: Institution | Omit<Institution, 'id'>): Promise<Institution> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const institutionDataWithId: Institution = (institutionToSave as Institution).id && !(institutionToSave as Institution).id.startsWith('new-')
    ? institutionToSave as Institution
    : { ...institutionToSave, id: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` } as Institution;

  const index = mockInstitutions.findIndex(i => i.id === institutionDataWithId.id);

  if (index !== -1) {
    mockInstitutions[index] = institutionDataWithId;
  } else {
    mockInstitutions.push(institutionDataWithId);
  }
  persistInstitutions();
  return institutionDataWithId;
}

export async function deleteInstitution(institutionId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  mockInstitutions = mockInstitutions.filter(i => i.id !== institutionId);
  persistInstitutions();
}

// Other Data Functions
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
