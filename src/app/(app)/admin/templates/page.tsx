
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateEditor } from "./components/template-editor";

// Export this for use in institution-notifications/page.tsx
export const institutionPlaceholders = [
  { key: "{{directivo.nombre}}", description: "Nombre del directivo/contacto en la institución." },
  { key: "{{directivo.cargo}}", description: "Cargo del directivo/contacto en la institución." },
  { key: "{{directivo.email}}", description: "Correo electrónico del directivo/contacto." },
  { key: "{{nombre_establecimiento}}", description: "Nombre del establecimiento educativo." },
  { key: "{{semana_inicio_profesional}}", description: "Semana de inicio de la Práctica Profesional (ej: semana del dd de MMMM)." },
  { key: "{{semana_termino_profesional}}", description: "Semana de término de la Práctica Profesional (ej: semana del dd de MMMM yyyy)." },
  { key: "{{numero_semanas_profesional}}", description: "Número de semanas de la Práctica Profesional." },
  { key: "{{semana_inicio_pp}}", description: "Semana de inicio de otras Prácticas Pedagógicas (ej: semana del dd de MMMM)." },
  { key: "{{semana_termino_pp}}", description: "Semana de término de otras Prácticas Pedagógicas (ej: semana del dd de MMMM yyyy)." },
  { key: "{{numero_semanas_pp}}", description: "Número de semanas de otras Prácticas Pedagógicas." },
  { key: "{{practiceCalendarHTML}}", description: "Tabla HTML con el calendario de prácticas (P. Profesional y Otras Prácticas)." },
  { key: "{{studentTableHTML}}", description: "Tabla HTML con la lista de estudiantes asignados." },
  { key: "{{documentationListHTML}}", description: "Lista HTML de la documentación requerida." },
];

// Corrected student placeholders based on the OCR and user feedback
export const studentPlaceholders = [
  { key: "{{estudiante.nombre}}", description: "Nombre del estudiante." },
  { key: "{{estudiante.ap_paterno}}", description: "Apellido paterno del estudiante." },
  { key: "{{estudiante.ap_materno}}", description: "Apellido materno del estudiante." },
  { key: "{{nombre_establecimiento}}", description: "Nombre del establecimiento asignado." },
  { key: "{{nivel_practica}}", description: "Nivel de práctica del estudiante." },
  { key: "{{fecha_inicio}}", description: "Fecha de inicio de la práctica (ej: 'semana del dd de MMMM')." },
  { key: "{{fecha_termino}}", description: "Fecha de término de la práctica (ej: 'semana del dd de MMMM yyyy')." },
  { key: "{{directivo.nombre}}", description: "Nombre del directivo/contacto en la institución." },
  { key: "{{directivo.cargo}}", description: "Cargo del directivo/contacto en la institución." },
  { key: "{{directivo.email}}", description: "Correo electrónico del directivo/contacto en la institución." },
  // URLs are now directly in the template, no longer placeholders
];


export const DEFAULT_INSTITUTION_EMAIL_SUBJECT = "Información Estudiantes de Práctica";
export const DEFAULT_INSTITUTION_EMAIL_BODY_TEXT = `Estimado/a {{directivo.nombre}},

Reciba un cordial saludo en nombre de la Unidad de Práctica Pedagógica (UPP) de la Facultad de Educación de la Universidad Católica de la Santísima Concepción.
Nos ponemos en contacto con usted referente a su rol como {{directivo.cargo}} en la institución {{nombre_establecimiento}}.

A continuación, presentamos el calendario de prácticas UCSC para el primer semestre:
{{practiceCalendarHTML}}

Adjuntamos la lista de estudiantes propuestos para realizar su práctica en su establecimiento:
{{studentTableHTML}}

Es importante que cada estudiante, al iniciar su pasantía, entregue su carpeta de práctica que incluye la siguiente documentación esencial:
{{documentationListHTML}}

Agradecemos sinceramente el valioso espacio formativo que su comunidad educativa proporciona a nuestros futuros profesionales.

Atentamente,
Equipo Unidad de Prácticas Pedagógicas UCSC
Coordinación de Gestión de Centros de Práctica Pedagógica
Unidad de Práctica Pedagógica
Facultad de Educación
Universidad Católica de la Santísima Concepción
Alonso de Ribera 2850 - Concepción - Chile
Fono +56 412345859
www.ucsc.cl
`.trim();

// Updated DEFAULT_STUDENT_EMAIL_BODY_TEXT to use {{...}} placeholders
export const DEFAULT_STUDENT_EMAIL_SUBJECT = "Confirmación de Práctica Pedagógica UCSC";
export const DEFAULT_STUDENT_EMAIL_BODY_TEXT = `Estimado/a estudiante
{{estudiante.nombre}} {{estudiante.ap_paterno}} {{estudiante.ap_materno}}

Junto con saludar, se informa que, desde la coordinación de gestión de centros de Práctica de la UPP, ha sido adscrito/a a {{nombre_establecimiento}}, para desarrollar su {{nivel_practica}}, que inicia la {{fecha_inicio}} hasta la {{fecha_termino}}.

Los datos de contacto del establecimiento son:

Nombre directivo: {{directivo.nombre}}
Cargo: {{directivo.cargo}}
Correo electrónico: {{directivo.email}}

Posterior a este correo, deberá coordinar el inicio de su pasantía de acuerdo al calendario de prácticas UCSC y hacer entrega de su carpeta de práctica y documentación personal, que incluye:

Certificado de Antecedentes (https://www.chileatiende.gob.cl/fichas/3442-certificado-de-antecedentes)
Certificado de Inhabilidades para trabajar con menores de edad (https://inhabilidades.srcei.cl/ConsInhab/consultaInhabilidad.do)
Certificado de Inhabilidades por maltrato relevante (https://inhabilidades.srcei.cl/InhabilidadesRelevante/#/inicio)
Horario universitario
Otra documentación

Se informa, además, que el equipo directivo del establecimiento está en conocimiento de su adscripción y por tanto es importante que asista presencialmente al centro educativo.

Favor no responder a este correo. Para dudas y/o consultas, favor escribir a sus respectivas coordinadoras de prácticas.

Saludos cordiales,
Unidad de Prácticas Pedagógicas UCSC
`.trim();


export default function TemplatesPage() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="Gestión de Plantillas de Correo"
        description="Edite las plantillas utilizadas para las notificaciones por correo electrónico."
      />
      <Tabs defaultValue="institution" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="institution">Plantilla para Establecimientos</TabsTrigger>
          <TabsTrigger value="student">Plantilla para Alumnos</TabsTrigger>
        </TabsList>
        <TabsContent value="institution">
          <TemplateEditor
            templateTypeTitle="Plantilla para Establecimientos"
            templateKeySubject="TEMPLATE_INSTITUTION_SUBJECT"
            templateKeyBodyHtml="TEMPLATE_INSTITUTION_BODY_HTML"
            defaultSubject={DEFAULT_INSTITUTION_EMAIL_SUBJECT}
            defaultBodyHtml={DEFAULT_INSTITUTION_EMAIL_BODY_TEXT}
            placeholders={institutionPlaceholders}
          />
        </TabsContent>
        <TabsContent value="student">
          <TemplateEditor
            templateTypeTitle="Plantilla para Alumnos"
            templateKeySubject="TEMPLATE_STUDENT_SUBJECT"
            templateKeyBodyHtml="TEMPLATE_STUDENT_BODY_HTML"
            defaultSubject={DEFAULT_STUDENT_EMAIL_SUBJECT}
            defaultBodyHtml={DEFAULT_STUDENT_EMAIL_BODY_TEXT}
            placeholders={studentPlaceholders}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}