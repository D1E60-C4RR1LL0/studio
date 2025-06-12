
import type { Student, Institution, AcademicLevel, Career, Commune, Tutor, DirectorContact } from './definitions';

// --- Student Data ---
export const mockStudentsData: Student[] = [
  { id: '1', firstName: 'Ana Sofía', lastNamePaternal: 'Pérez', lastNameMaternal: 'García', rut: '11.111.111-1', career: 'Ingeniería de Software', email: 'ana.perez@example.com', practicumLevel: 'Práctica I', tutor: 'Dr. Carlos Soto', commune: 'Santiago', location: 'Santiago', specialConditions: 'Requiere configuración para trabajo remoto' },
  { id: '2', firstName: 'Juan José', lastNamePaternal: 'Rodríguez', lastNameMaternal: 'Vera', rut: '22.222.222-2', career: 'Diseño Gráfico', email: 'juan.rodriguez@example.com', practicumLevel: 'Práctica Profesional', tutor: 'Prof. Laura Vera', commune: 'Valparaíso', location: 'Valparaíso' },
  { id: '3', firstName: 'María Fernanda', lastNamePaternal: 'González', lastNameMaternal: 'Díaz', rut: '33.333.333-3', career: 'Administración de Empresas', email: 'maria.gonzalez@example.com', practicumLevel: 'Práctica II', tutor: 'Dr. Roberto Diaz', commune: 'Providencia', location: 'Santiago', specialConditions: 'Necesita lugar de trabajo accesible' },
  { id: '4', firstName: 'Luis Alberto', lastNamePaternal: 'Martínez', lastNameMaternal: 'Soto', rut: '44.444.444-4', career: 'Ingeniería de Software', email: 'luis.martinez@example.com', practicumLevel: 'Práctica I', tutor: 'Dr. Carlos Soto', commune: 'Concepción', location: 'Concepción' },
  { id: '5', firstName: 'Camila Andrea', lastNamePaternal: 'Silva', lastNameMaternal: 'Reyes', rut: '55.555.555-5', career: 'Ingeniería Civil', email: 'camila.silva@example.com', practicumLevel: 'Práctica Profesional', tutor: 'Prof. Elena Reyes', commune: 'Antofagasta', location: 'Antofagasta' },
  { id: '6', firstName: 'Pedro Pascal', lastNamePaternal: 'Pérez', lastNameMaternal: 'Gómez', rut: '66.666.666-6', career: 'Pedagogía en Educación Parvularia', email: 'pedro.perez@example.com', practicumLevel: 'Práctica Pedagógica II', tutor: 'Mg. Andrea Campos', commune: 'Concepción', location: 'Concepción' },
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

// --- Institution Data ---
export const mockInitialInstitutions: Institution[] = [
  { id: 'inst1', rbd: '1001', name: 'Soluciones Tecnológicas Inc.', dependency: 'Particular Pagado', location: 'Santiago', directorContacts: [{ id: 'dc1-1', name: 'Roberto Morales', email: 'roberto.morales@techsolutions.com', phone: '+56912345678', role: 'Gerente de Proyectos' }], logo: 'https://placehold.co/150x50.png' },
  { id: 'inst2', rbd: '1002', name: 'Diseños Creativos LLC', dependency: 'Particular Pagado', location: 'Valparaíso', directorContacts: [{ id: 'dc2-1', name: 'Sofia Castro', email: 'sofia.castro@creativedesigns.com', phone: '+56987654321', role: 'Directora de Arte' }], logo: 'https://placehold.co/150x50.png' },
  { id: 'inst3', rbd: '16793', name: 'LICEO TÉCNICO PROFESIONAL LA ARAUCANA', dependency: 'PART. SUBV.', location: 'Concepción', directorContacts: [{ id: 'dc3-1', name: 'Fernando López', email: 'fernando.lopez@globalcorp.com', role: 'Jefe de Operaciones' }, { id: 'dc3-2', name: 'Laura Acuña', email: 'laura.acuna@globalcorp.com', role: 'Coordinadora UTP' }], logo: 'https://placehold.co/150x50.png' },
  { id: 'inst4', rbd: '1004', name: 'Escuela Tres Palitos', dependency: 'Municipal', location: 'Concepción', directorContacts: [{ id: 'dc4-1', name: 'Condorito Pérez', email: 'condor.rector@palitos.cl', phone: '+56911223344', role: 'Director Académico' }], logo: 'https://placehold.co/150x50.png' },
  { id: 'inst5', rbd: '1005', name: 'Construcciones BuildWell', dependency: 'Particular Pagado', location: 'Antofagasta', directorContacts: [{ id: 'dc5-1', name: 'Andrés Torres', email: 'andres.torres@buildwell.com', role: 'Jefe de Obra' }], logo: 'https://placehold.co/150x50.png' },
  { id: 'inst6', rbd: '1006', name: 'Colegio Los Robles', dependency: 'Particular Subvencionado', location: 'Concepción', directorContacts: [{ id: 'dc6-1', name: 'Ana María Silva', email: 'amsilva@losrobles.cl', role: 'Coordinadora Académica' }], logo: 'https://placehold.co/150x50.png'}
];
function initializeInstitutions(): Institution[] {
  if (typeof window !== 'undefined') {
    const storedInstitutions = localStorage.getItem('practicumInstitutions');
    if (storedInstitutions) {
      try { return JSON.parse(storedInstitutions); } catch (e) { console.error("Error parsing institutions from localStorage", e); }
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

// --- Career Data ---
export const mockInitialCareers: Career[] = [
    { id: 'car1', name: 'Ingeniería de Software' },
    { id: 'car2', name: 'Diseño Gráfico' },
    { id: 'car3', name: 'Administración de Empresas' },
    { id: 'car4', name: 'Ingeniería Civil' },
    { id: 'car5', name: 'Psicología' },
    { id: 'car6', name: 'Pedagogía en Educación Básica' },
    { id: 'car7', name: 'Pedagogía en Educación Parvularia' },
];
function initializeCareers(): Career[] {
  if (typeof window !== 'undefined') {
    const storedCareers = localStorage.getItem('practicumCareers');
    if (storedCareers) {
      try { return JSON.parse(storedCareers); } catch (e) { console.error("Error parsing careers from localStorage", e); }
    }
  }
  return [...mockInitialCareers];
}
let mockCareers: Career[] = initializeCareers();
function persistCareers() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('practicumCareers', JSON.stringify(mockCareers));
  }
}

// --- Tutor Data ---
export const mockInitialTutors: Tutor[] = [
    { id: 'tut1', name: 'Dr. Carlos Soto', email: 'carlos.soto@example.com' },
    { id: 'tut2', name: 'Prof. Laura Vera', email: 'laura.vera@example.com' },
    { id: 'tut3', name: 'Dr. Roberto Diaz', email: 'roberto.diaz@example.com' },
    { id: 'tut4', name: 'Prof. Elena Reyes', email: 'elena.reyes@example.com' },
    { id: 'tut5', name: 'Mg. Andrea Campos', email: 'andrea.campos@example.com' },
    { id: 'tut6', name: 'Juan Pérez', email: 'juan.perez@ucsc.cl'}
];
function initializeTutors(): Tutor[] {
  if (typeof window !== 'undefined') {
    const storedTutors = localStorage.getItem('practicumTutors');
    if (storedTutors) {
      try { return JSON.parse(storedTutors); } catch (e) { console.error("Error parsing tutors from localStorage", e); }
    }
  }
  return [...mockInitialTutors];
}
let mockTutors: Tutor[] = initializeTutors();
function persistTutors() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('practicumTutors', JSON.stringify(mockTutors));
  }
}

// --- Commune Data ---
export const mockInitialCommunes: Commune[] = [
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
function initializeCommunes(): Commune[] {
  if (typeof window !== 'undefined') {
    const storedCommunes = localStorage.getItem('practicumCommunes');
    if (storedCommunes) {
      try { return JSON.parse(storedCommunes); } catch (e) { console.error("Error parsing communes from localStorage", e); }
    }
  }
  return [...mockInitialCommunes];
}
let mockCommunes: Commune[] = initializeCommunes();
function persistCommunes() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('practicumCommunes', JSON.stringify(mockCommunes));
  }
}

// --- AcademicLevel Data (Currently Read-Only) ---
export const mockAcademicLevels: AcademicLevel[] = [
  { id: 'level1', name: 'Práctica I' },
  { id: 'level2', name: 'Práctica II' },
  { id: 'level3', name: 'Práctica Profesional' },
  { id: 'level4', name: 'Pasantía Fase Inicial' },
  { id: 'level5', name: 'Pasantía Fase Final' },
  { id: 'level6', name: 'Práctica Pedagógica I'},
  { id: 'level7', name: 'Práctica Pedagógica II'},
];


// === Student Data Functions ===
export async function getStudents(): Promise<Student[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  if (mockStudents.length === 0 && typeof window !== 'undefined' && !localStorage.getItem('practicumStudents')) {
    mockStudents = [...mockStudentsData].map(s => ({ ...s, location: s.location || s.commune || 'Desconocida' }));
    persistStudents();
  } else if (mockStudents.length === 0 && (typeof window === 'undefined' || !localStorage.getItem('practicumStudents'))) {
     mockStudents = [...mockStudentsData].map(s => ({ ...s, location: s.location || s.commune || 'Desconocida' }));
  }
  return [...mockStudents];
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockStudents.find(s => s.id === id);
}

export async function saveStudent(studentToSave: Student | Omit<Student, 'id'>): Promise<Student> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const studentDataWithId: Student = (studentToSave as Student).id && !(studentToSave as Student).id.startsWith('new-')
    ? studentToSave as Student
    : { ...studentToSave, id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` } as Student;
  const studentWithLocation = { ...studentDataWithId, location: studentDataWithId.location || studentDataWithId.commune || 'Desconocida' };
  const index = mockStudents.findIndex(s => s.id === studentWithLocation.id);
  if (index !== -1) { mockStudents[index] = studentWithLocation; } else { mockStudents.push(studentWithLocation); }
  persistStudents();
  return studentWithLocation;
}

// === Institution Data Functions ===
export async function getInstitutions(): Promise<Institution[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
   if (mockInstitutions.length === 0 && typeof window !== 'undefined' && !localStorage.getItem('practicumInstitutions')) {
    mockInstitutions = [...mockInitialInstitutions];
    persistInstitutions();
  } else if (mockInstitutions.length === 0 && (typeof window === 'undefined' || !localStorage.getItem('practicumInstitutions'))) {
    mockInstitutions = [...mockInitialInstitutions];
  }
  return [...mockInstitutions];
}

export async function getInstitutionById(id: string): Promise<Institution | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockInstitutions.find(i => i.id === id);
}

export async function saveInstitution(institutionToSave: Omit<Institution, 'id' | 'logo'> | Institution): Promise<Institution> {
  await new Promise(resolve => setTimeout(resolve, 300));
  let institutionWithId: Institution;
  if ('id' in institutionToSave && institutionToSave.id && !institutionToSave.id.startsWith('new-inst-')) {
    institutionWithId = institutionToSave as Institution;
  } else {
    institutionWithId = { ...institutionToSave, id: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` } as Institution;
  }
  const processedDirectorContacts = (institutionWithId.directorContacts || []).map(contact => ({ ...contact, id: (contact.id && !contact.id.startsWith('new-contact-')) ? contact.id : `dc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }));
  const finalInstitutionData: Institution = { ...institutionWithId, directorContacts: processedDirectorContacts };
  const index = mockInstitutions.findIndex(i => i.id === finalInstitutionData.id);
  if (index !== -1) { mockInstitutions[index] = finalInstitutionData; } else { mockInstitutions.push(finalInstitutionData); }
  persistInstitutions();
  return finalInstitutionData;
}

export async function deleteInstitution(institutionId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  mockInstitutions = mockInstitutions.filter(i => i.id !== institutionId);
  persistInstitutions();
}

// === Career Data Functions ===
export async function getCareers(): Promise<Career[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (mockCareers.length === 0 && typeof window !== 'undefined' && !localStorage.getItem('practicumCareers')) {
        mockCareers = [...mockInitialCareers];
        persistCareers();
    } else if (mockCareers.length === 0 && (typeof window === 'undefined' || !localStorage.getItem('practicumCareers'))) {
        mockCareers = [...mockInitialCareers];
    }
    return [...mockCareers];
}

export async function saveCareer(careerToSave: Omit<Career, 'id'> | Career): Promise<Career> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const careerWithId: Career = ('id' in careerToSave && careerToSave.id && !careerToSave.id.startsWith('new-career-'))
        ? careerToSave as Career
        : { ...careerToSave, id: `career-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
    const index = mockCareers.findIndex(c => c.id === careerWithId.id);
    if (index !== -1) {
        mockCareers[index] = careerWithId;
    } else {
        mockCareers.push(careerWithId);
    }
    persistCareers();
    return careerWithId;
}

export async function deleteCareer(careerId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    mockCareers = mockCareers.filter(c => c.id !== careerId);
    persistCareers();
}

// === Tutor Data Functions ===
export async function getTutors(): Promise<Tutor[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
     if (mockTutors.length === 0 && typeof window !== 'undefined' && !localStorage.getItem('practicumTutors')) {
        mockTutors = [...mockInitialTutors];
        persistTutors();
    } else if (mockTutors.length === 0 && (typeof window === 'undefined' || !localStorage.getItem('practicumTutors'))) {
        mockTutors = [...mockInitialTutors];
    }
    return [...mockTutors];
}

export async function saveTutor(tutorToSave: Omit<Tutor, 'id'> | Tutor): Promise<Tutor> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const tutorWithId: Tutor = ('id' in tutorToSave && tutorToSave.id && !tutorToSave.id.startsWith('new-tutor-'))
        ? tutorToSave as Tutor
        : { ...tutorToSave, id: `tutor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
    const index = mockTutors.findIndex(t => t.id === tutorWithId.id);
    if (index !== -1) {
        mockTutors[index] = tutorWithId;
    } else {
        mockTutors.push(tutorWithId);
    }
    persistTutors();
    return tutorWithId;
}

export async function deleteTutor(tutorId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    mockTutors = mockTutors.filter(t => t.id !== tutorId);
    persistTutors();
}

// === Commune Data Functions ===
export async function getCommunes(): Promise<Commune[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    if (mockCommunes.length === 0 && typeof window !== 'undefined' && !localStorage.getItem('practicumCommunes')) {
        mockCommunes = [...mockInitialCommunes];
        persistCommunes();
    } else if (mockCommunes.length === 0 && (typeof window === 'undefined' || !localStorage.getItem('practicumCommunes'))) {
        mockCommunes = [...mockInitialCommunes];
    }
    return [...mockCommunes];
}

export async function saveCommune(communeToSave: Omit<Commune, 'id'> | Commune): Promise<Commune> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const communeWithId: Commune = ('id' in communeToSave && communeToSave.id && !communeToSave.id.startsWith('new-commune-'))
        ? communeToSave as Commune
        : { ...communeToSave, id: `commune-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
    const index = mockCommunes.findIndex(c => c.id === communeWithId.id);
    if (index !== -1) {
        mockCommunes[index] = communeWithId;
    } else {
        mockCommunes.push(communeWithId);
    }
    persistCommunes();
    return communeWithId;
}

export async function deleteCommune(communeId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    mockCommunes = mockCommunes.filter(c => c.id !== communeId);
    persistCommunes();
}

// === Read-Only Data Functions ===
export async function getAcademicLevels(): Promise<AcademicLevel[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockAcademicLevels;
}


// === Global Data Deletion ===
export async function deleteAllData(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  mockStudents = [];
  mockInstitutions = [];
  mockCareers = [];
  mockTutors = [];
  mockCommunes = []; // Clear communes
  persistStudents();
  persistInstitutions();
  persistCareers();
  persistTutors();
  persistCommunes(); // Persist cleared communes
  console.log("All mutable mock data (students, institutions, careers, tutors, communes) cleared.");
}

