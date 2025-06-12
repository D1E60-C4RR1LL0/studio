
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

// Use a mutable copy for operations like add/update
// Initialize from localStorage if available, otherwise use mock data
function initializeStudents(): Student[] {
  if (typeof window !== 'undefined') {
    const storedStudents = localStorage.getItem('practicumStudents');
    if (storedStudents) {
      try {
        const parsedStudents = JSON.parse(storedStudents);
        // Ensure location is set for all students loaded from localStorage
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


export const mockInstitutions: Institution[] = [
  { id: 'inst1', name: 'Soluciones Tecnológicas Inc.', location: 'Santiago', contactName: 'Roberto Morales', contactEmail: 'roberto.morales@techsolutions.com', contactPhone: '+56912345678', contactRole: 'Gerente de Proyectos', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst2', name: 'Diseños Creativos LLC', location: 'Valparaíso', contactName: 'Sofia Castro', contactEmail: 'sofia.castro@creativedesigns.com', contactPhone: '+56987654321', contactRole: 'Directora de Arte', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst3', name: 'Global Corp', location: 'Santiago', contactName: 'Fernando López', contactEmail: 'fernando.lopez@globalcorp.com', contactRole: 'Jefe de Operaciones', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst4', name: 'Escuela Tres Palitos', location: 'Concepción', contactName: 'Condorito Pérez', contactEmail: 'condor.rector@palitos.cl', contactPhone: '+56911223344', contactRole: 'Director Académico', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst5', name: 'Construcciones BuildWell', location: 'Antofagasta', contactName: 'Andrés Torres', contactEmail: 'andres.torres@buildwell.com', contactRole: 'Jefe de Obra', logo: 'https://placehold.co/150x50.png' },
  { id: 'inst6', name: 'Colegio Los Robles', location: 'Concepción', contactName: 'Ana María Silva', contactEmail: 'amsilva@losrobles.cl', contactRole: 'Coordinadora Académica', logo: 'https://placehold.co/150x50.png'}
];

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

export async function getStudents(): Promise<Student[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Ensure mockStudents is initialized if it became empty for some reason and localStorage is also empty
  if (mockStudents.length === 0 && typeof window !== 'undefined' && !localStorage.getItem('practicumStudents')) {
    mockStudents = [...mockStudentsData].map(s => ({ ...s, location: s.location || s.commune || 'Desconocida' }));
    persistStudents(); // Persist the initial mock data if localStorage was empty
  } else if (mockStudents.length === 0 && (typeof window === 'undefined' || !localStorage.getItem('practicumStudents'))) {
    // For server-side or environments without localStorage, always start with mockStudentsData
    mockStudents = [...mockStudentsData].map(s => ({ ...s, location: s.location || s.commune || 'Desconocida' }));
  }
  return [...mockStudents]; // Return a copy
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
  mockStudents = []; // Clear the in-memory array
  persistStudents(); // Persist the empty array to localStorage
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
