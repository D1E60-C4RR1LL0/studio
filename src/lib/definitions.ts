export type Student = {
  id: string;
  rut: string;
  nombre: string;
  ap_paterno: string;
  ap_materno: string;
  email: string;
  cond_especial?: string;
  carrera_id: string;
  comuna_id?: string;
  tutor_id?: string;
  carrera?: Career;
  comuna?: Commune;
  tutor?: Tutor;
};

export type Career = {
  id: string;
  nombre: string;
};

export type Commune = {
  id: string;
  nombre: string;
};

export type Tutor = {
  id: string;
  nombre: string;
  email?: string;
};

export type AcademicLevel = {
  id: string;
  nombre: string;
  carrera_id: string;
};


export type DirectorContact = {
  id?: string;
  nombre: string;
  email: string;
  telefono?: string;
  cargo?: string;
};

export interface Institution {
  rbd: string;
  nombre: string;
  dependencia: string;
  comuna_id: number | string; // Comuna ID puede ser un número o una cadena
  id?: string;
  directivos?: DirectorContact[];
}

export type Cupo = {
  id: number;
  establecimiento_id: string;
  nivel_practica_id: string;
  carrera_id: string; // ← ESTA propiedad es obligatoria
  cantidad: number;
  nivel_practica?: AcademicLevel;
};


