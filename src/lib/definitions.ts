
export type Student = {
  id: string;
  rut: string;
  firstName: string;
  lastNamePaternal: string;
  lastNameMaternal: string;
  email: string;
  career: string; // Stores the name of the career
  commune?: string; // Stores the name of the commune, optional
  tutor?: string; // Stores the name of the tutor, optional
  practicumLevel: string; // Nivel de Práctica, stores the name
  specialConditions?: string;
};

export type Institution = {
  id: string;
  name: string;
  location: string; // This might be more general, while commune is specific for student
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  logo?: string; // Optional: URL to a logo image
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

