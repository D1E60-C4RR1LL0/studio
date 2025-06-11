export type Student = {
  id: string;
  name: string;
  rut: string; 
  career: string;
  email: string;
  practicumLevel: string;
  tutor?: string;
  location: string; 
  specialConditions?: string;
  avatar?: string; // Optional: URL to an avatar image
};

export type Institution = {
  id: string;
  name: string;
  location: string; 
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  logo?: string; // Optional: URL to a logo image
};

export type AcademicLevel = {
  id: string;
  name: string;
};
