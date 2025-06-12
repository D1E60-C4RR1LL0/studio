
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateEditor } from "./components/template-editor";

const institutionPlaceholders = [
  { key: "{{contactName}}", description: "Nombre del contacto en la institución." },
  { key: "{{contactRole}}", description: "Cargo del contacto en la institución." },
  { key: "{{institutionName}}", description: "Nombre de la institución." },
  { key: "{{studentTableHTML}}", description: "Tabla HTML con la lista de estudiantes asignados." },
  { key: "{{practiceCalendarHTML}}", description: "Tabla HTML con el calendario de prácticas." },
  { key: "{{documentationListHTML}}", description: "Lista HTML de la documentación requerida." },
];

const studentPlaceholders = [
  { key: "{{studentFullName}}", description: "Nombre completo del estudiante." },
  { key: "{{institutionName}}", description: "Nombre de la institución asignada." },
  { key: "{{practicumLevel}}", description: "Nivel de práctica del estudiante." },
  { key: "{{practicumStartDate}}", description: "Fecha de inicio de la práctica (formateada)." },
  { key: "{{practicumEndDate}}", description: "Fecha de término de la práctica (formateada)." },
  { key: "{{institutionContactName}}", description: "Nombre del directivo/contacto en la institución." },
  { key: "{{institutionContactRole}}", description: "Cargo del directivo/contacto." },
  { key: "{{institutionContactEmail}}", description: "Correo electrónico del directivo/contacto." },
];

const DEFAULT_INSTITUTION_EMAIL_SUBJECT = "Información Estudiantes de Práctica";
const DEFAULT_INSTITUTION_EMAIL_BODY_HTML = `
<div style="font-family: Arial, sans-serif; font-size: 10pt;">
  <p style="margin-bottom: 10px;">Estimado/a {{contactName}}{{contactRole ? ', en su calidad de ' + contactRole + ' de ' : ''}} {{institutionName}}.</p>
  <p style="margin-bottom: 15px;">Le saludo de manera cordial en nombre de la Unidad de Práctica Pedagógica (UPP) de la Facultad de Educación de la Universidad Católica de la Santísima Concepción, y presento a usted el inicio de las pasantías de estudiantes de Pedagogía de nuestra Facultad, de acuerdo con el siguiente calendario de prácticas UCSC primer semestre 2025:</p>
  {{practiceCalendarHTML}}
  <p style="margin-top: 15px; margin-bottom: 5px;">Adjuntamos la lista de estudiantes propuestos para realizar su práctica en su establecimiento:</p>
  {{studentTableHTML}}
  {{documentationListHTML}}
  <p style="margin-top: 20px;">Finalmente, como UPP agradecemos el espacio formativo otorgado por su comunidad educativa.</p>
  <p style="margin-top: 15px;">Se despide atentamente,<br />Equipo Unidad de Prácticas Pedagógicas UCSC</p>
</div>
`.trim();

const DEFAULT_STUDENT_EMAIL_SUBJECT = "Confirmación de Práctica Pedagógica";
const DEFAULT_STUDENT_EMAIL_BODY_HTML = `
Estimado/a estudiante {{studentFullName}}

Junto con saludar, se informa que, desde la coordinación de gestión de centros de Práctica de la UPP, ha sido adscrito/a a {{institutionName}}, para desarrollar su {{practicumLevel}}, que inicia la {{practicumStartDate}} hasta la {{practicumEndDate}}.

Los datos de contacto del establecimiento son:
- Nombre directivo: {{institutionContactName}}
- Cargo: {{institutionContactRole}}
- Correo electrónico: {{institutionContactEmail}}

Posterior a este correo, deberá coordinar el inicio de su pasantía de acuerdo calendario de prácticas UCSC y hacer entrega de su carpeta de práctica y documentación personal, que incluye:
- Certificado de Antecedentes (Link de descarga: https://www.chileatiende.gob.cl/fichas/3442-certificado-de-antecedentes)
- Certificado de Inhabilidades para trabajar con menores de edad (Link de descarga: https://inhabilidades.srcei.cl/ConsInhab/consultaInhabilidad.do)
- Certificado de Inhabilidades por maltrato relevante (Link de descarga: https://inhabilidades.srcei.cl/InhabilidadesRelevante/#/inicio)
- Horario universitario
- Otra documentación

Se informa, además, que el equipo directivo del establecimiento está en conocimiento de su adscripción y por tanto es importante que asista presencialmente al centro educativo.

Favor no responder a este correo. Para dudas y/o consulta favor escribir a sus respectivas coordinadoras de prácticas.

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
            defaultBodyHtml={DEFAULT_INSTITUTION_EMAIL_BODY_HTML}
            placeholders={institutionPlaceholders}
          />
        </TabsContent>
        <TabsContent value="student">
          <TemplateEditor
            templateTypeTitle="Plantilla para Alumnos"
            templateKeySubject="TEMPLATE_STUDENT_SUBJECT"
            templateKeyBodyHtml="TEMPLATE_STUDENT_BODY_HTML"
            defaultSubject={DEFAULT_STUDENT_EMAIL_SUBJECT}
            defaultBodyHtml={DEFAULT_STUDENT_EMAIL_BODY_HTML}
            placeholders={studentPlaceholders}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
