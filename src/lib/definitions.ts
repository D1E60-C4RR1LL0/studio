
export type Student = {
  id: string;
  rut: string;
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
  email: string;
  career: string;
  commune?: string;
  tutor?: string;
  practicumLevel: string;
  specialConditions?: string;
  location?: string; // Usado para asignar estudiantes a la ubicación de una institución
};

export type Institution = {
  id: string;
  rbd: string; // Rol Base de Datos - Identificador único del establecimiento
  name: string;
  dependency: string; // Ej: Municipal, Particular Subvencionado, Particular Pagado
  location: string; // Comuna donde se ubica
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  contactRole?: string;
  logo?: string; // URL del logo
};

export type AcademicLevel = {
  id: string;
  name: string;
};

export type Career = {
  id: string;
  name: string;
};

export type Commune = {
  id: string;
  name: string;
};

export type Tutor = {
  id: string;
  name: string;
};
