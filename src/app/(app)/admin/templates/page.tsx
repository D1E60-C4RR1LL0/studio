
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateEditor } from "./components/template-editor";

const institutionPlaceholders = [
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
  { key: "{{studentTableHTML}}", description: "Tabla HTML con la lista de estudiantes asignados." },
  { key: "{{documentationListHTML}}", description: "Lista HTML de la documentación requerida." },
];

const studentPlaceholders = [
  { key: "[Nombre del Estudiante]", description: "Nombre completo del estudiante (ej: Ana Pérez García)." },
  { key: "[Nombre Institucion]", description: "Nombre del establecimiento asignado." },
  { key: "[Nivel de Practica]", description: "Nivel de práctica del estudiante." },
  { key: "[Fecha Inicio Practica]", description: "Fecha de inicio de la práctica (ej: 'semana del dd de MMMM')." },
  { key: "[Fecha Termino Practica]", description: "Fecha de término de la práctica (ej: 'semana del dd de MMMM yyyy')." },
  { key: "[Nombre Directivo]", description: "Nombre del directivo/contacto en la institución." },
  { key: "[Cargo Directivo]", description: "Cargo del directivo/contacto en la institución." },
  { key: "[Correo Electronico Directivo]", description: "Correo electrónico del directivo/contacto en la institución." },
  // Placeholders for certificate links are no longer explicitly listed as separate placeholders for HTML links,
  // as URLs are now part of the main template text.
];

const DEFAULT_INSTITUTION_EMAIL_SUBJECT = "Información Estudiantes de Práctica";
const DEFAULT_INSTITUTION_EMAIL_BODY_TEXT = `Estimado/a {{directivo.nombre}},

Reciba un cordial saludo en nombre de la Unidad de Práctica Pedagógica (UPP) de la Facultad de Educación de la Universidad Católica de la Santísima Concepción.
Nos ponemos en contacto con usted referente a su rol como {{directivo.cargo}} en la institución {{nombre_establecimiento}}.

A continuación, presentamos el calendario de prácticas UCSC para el primer semestre:
<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 10px;">
  <thead>
    <tr>
      <th>NIVEL DE PRÁCTICA</th>
      <th>FECHA INICIO</th>
      <th>FECHA TÉRMINO</th>
      <th>Nº SEMANAS</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>P. PROFESIONAL</td>
      <td>{{semana_inicio_profesional}}</td>
      <td>{{semana_termino_profesional}}</td>
      <td>{{numero_semanas_profesional}}</td>
    </tr>
    <tr>
      <td>PPV - PPIV - PPIII - PPII - PPI</td>
      <td>{{semana_inicio_pp}}</td>
      <td>{{semana_termino_pp}}</td>
      <td>{{numero_semanas_pp}}</td>
    </tr>
  </tbody>
</table>

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

const DEFAULT_STUDENT_EMAIL_SUBJECT = "Confirmación de Práctica Pedagógica UCSC";
const DEFAULT_STUDENT_EMAIL_BODY_TEXT = `Estimado/a estudiante [Nombre del Estudiante]

Junto con saludar, se informa que, desde la coordinación de gestión de centros de Práctica de la UPP, ha sido adscrito/a a [Nombre Institucion], para desarrollar su [Nivel de Practica], que inicia la [Fecha Inicio Practica] hasta la [Fecha Termino Practica].

Los datos de contacto del establecimiento son:

Nombre directivo: [Nombre Directivo]
Cargo: [Cargo Directivo]
Correo electrónico: [Correo Electronico Directivo]

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
            templateKeyBodyHtml="TEMPLATE_INSTITUTION_BODY_HTML" // Stores plain text
            defaultSubject={DEFAULT_INSTITUTION_EMAIL_SUBJECT}
            defaultBodyHtml={DEFAULT_INSTITUTION_EMAIL_BODY_TEXT} // Default body as plain text
            placeholders={institutionPlaceholders}
          />
        </TabsContent>
        <TabsContent value="student">
          <TemplateEditor
            templateTypeTitle="Plantilla para Alumnos"
            templateKeySubject="TEMPLATE_STUDENT_SUBJECT"
            templateKeyBodyHtml="TEMPLATE_STUDENT_BODY_HTML" // Stores plain text
            defaultSubject={DEFAULT_STUDENT_EMAIL_SUBJECT}
            defaultBodyHtml={DEFAULT_STUDENT_EMAIL_BODY_TEXT} // Default body as plain text
            placeholders={studentPlaceholders}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

    