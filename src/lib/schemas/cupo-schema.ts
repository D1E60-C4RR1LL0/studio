import { z } from "zod";

export const cupoFormSchema = z.object({
  cantidad: z.coerce.number().min(1, { message: "Debe ser al menos 1." }),
  establecimiento_id: z.string().uuid({ message: "Establecimiento requerido." }),
  nivel_practica_id: z.string().min(1, { message: "Nivel de práctica requerido." }),
  carrera_id: z.string().min(1, { message: "Carrera requerida." }),
});

export type CupoFormData = z.infer<typeof cupoFormSchema>;
