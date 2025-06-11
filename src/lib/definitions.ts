
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
  location?: string; // Used for matching students to institutions, can be same as commune or more general
};

export type Institution = {
  id: string;
  name: string;
  location: string; 
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
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
