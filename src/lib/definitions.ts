
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
  name: string;
  location: string; // Generalmente la comuna
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  contactRole?: string; // Nuevo campo: Cargo del contacto
  logo?: string;
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
