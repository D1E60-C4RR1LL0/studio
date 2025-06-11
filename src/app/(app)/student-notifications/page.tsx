
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, SendHorizonal, Info } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getStudents, getAcademicLevels } from "@/lib/data";
import type { Student, AcademicLevel } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { usePracticumProgress, STAGES } from '@/hooks/usePracticumProgress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CONFIRMED_STUDENT_IDS_KEY = 'confirmedPracticumStudentIds';
const LAST_NOTIFIED_INSTITUTION_NAME_KEY = 'lastNotifiedInstitutionName';
const LAST_NOTIFIED_INSTITUTION_CONTACT_NAME_KEY = 'lastNotifiedInstitutionContactName';
const LAST_NOTIFIED_INSTITUTION_CONTACT_ROLE_KEY = 'lastNotifiedInstitutionContactRole';
const LAST_NOTIFIED_INSTITUTION_CONTACT_EMAIL_KEY = 'lastNotifiedInstitutionContactEmail';
const PRACTICUM_PROF_START_DATE_KEY = 'practicumProfStartDate';
const PRACTICUM_PROF_END_DATE_KEY = 'practicumProfEndDate';
const PRACTICUM_OTHER_START_DATE_KEY = 'practicumOtherStartDate';
const PRACTICUM_OTHER_END_DATE_KEY = 'practicumOtherEndDate';
const STUDENT_NOTIFICATION_LEVEL_PROGRAMMING_KEY = 'studentNotificationLevelProgramming';

interface LevelProgramming {
  scheduledDate?: Date | string; // Store as ISO string in localStorage, convert to Date on load
  scheduledTime: string;
  emailSubject: string;
  emailMessageTemplate: string;
}

const DEFAULT_EMAIL_SUBJECT = "Confirmación de Práctica Pedagógica";
const DEFAULT_EMAIL_MESSAGE_TEMPLATE = `Estimado/a estudiante [Nombre del Estudiante]

Junto con saludar, se informa que, desde la coordinación de gestión de centros de Práctica de la UPP, ha sido adscrito/a a [Nombre Institucion], para desarrollar su [Nivel de Practica], que inicia la [Fecha Inicio Practica] hasta la [Fecha Termino Practica].

Los datos de contacto del establecimiento son:

Nombre directivo: [Nombre Directivo]
Cargo: [Cargo Directivo]
Correo electrónico: [Correo Electronico Directivo]

Posterior a este correo, deberá coordinar el inicio de su pasantía de acuerdo calendario de prácticas UCSC y hacer entrega de su carpeta de práctica y documentación personal, que incluye:

<ul>
    <li>Certificado de Antecedentes <a href="https://www.chileatiende.gob.cl/fichas/3442-certificado-de-antecedentes" target="_blank" rel="noopener noreferrer">Link de descarga</a></li>
    <li>Certificado de Inhabilidades para trabajar con menores de edad <a href="https://inhabilidades.srcei.cl/ConsInhab/consultaInhabilidad.do" target="_blank" rel="noopener noreferrer">Link de descarga</a></li>
    <li>Certificado de Inhabilidades por maltrato relevante <a href="https://inhabilidades.srcei.cl/InhabilidadesRelevante/#/inicio" target="_blank" rel="noopener noreferrer">Link de descarga</a></li>
    <li>Horario universitario</li>
    <li>Otra documentación</li>
</ul>

Se informa, además, que el equipo directivo del establecimiento está en conocimiento de su adscripción y por tanto es importante que asista presencialmente al centro educativo.

Favor no responder a este correo. Para dudas y/o consulta favor escribir a sus respectivas coordinadoras de prácticas.

Saludos cordiales,

Unidad de Prácticas Pedagógicas UCSC`;


// Helper function to format dates for student emails
const formatDateForStudentEmail = (date: Date | undefined, type: 'start' | 'end'): string => {
  if (!date) return type === 'start' ? "[Fecha Inicio Practica]" : "[Fecha Termino Practica]";
  if (type === 'start') {
    return format(date, "'semana del' dd 'de' MMMM", { locale: es });
  }
  return format(date, "'semana del' dd 'de' MMMM yyyy", { locale: es });
};


export default function StudentNotificationsPage() {
  const [allStudentsData, setAllStudentsData] = React.useState<Student[]>([]);
  const [confirmedStudentIdsFromPreviousStage, setConfirmedStudentIdsFromPreviousStage] = React.useState<string[]>([]);
  const [studentsReadyForNotification, setStudentsReadyForNotification] = React.useState<Student[]>([]);
  
  const [allAcademicLevelsFromData, setAllAcademicLevelsFromData] = React.useState<AcademicLevel[]>([]);
  const [displayableAcademicLevels, setDisplayableAcademicLevels] = React.useState<AcademicLevel[]>([]);

  // Institution and Practicum details from previous stage
  const [notifiedInstitutionName, setNotifiedInstitutionName] = React.useState<string>("");
  const [institutionContactName, setInstitutionContactName] = React.useState<string>("");
  const [institutionContactRole, setInstitutionContactRole] = React.useState<string>("");
  const [institutionContactEmail, setInstitutionContactEmail] = React.useState<string>("");
  const [practicumProfStartDate, setPracticumProfStartDate] = React.useState<Date | undefined>();
  const [practicumProfEndDate, setPracticumProfEndDate] = React.useState<Date | undefined>();
  const [practicumOtherStartDate, setPracticumOtherStartDate] = React.useState<Date | undefined>();
  const [practicumOtherEndDate, setPracticumOtherEndDate] = React.useState<Date | undefined>();

  const [selectedLevelId, setSelectedLevelId] = React.useState<string>("");
  const [studentsInSelectedLevelForPreview, setStudentsInSelectedLevelForPreview] = React.useState<Student[]>([]);
  const [selectedStudentForPreviewId, setSelectedStudentForPreviewId] = React.useState<string>("");

  const [programmingByLevel, setProgrammingByLevel] = React.useState<Record<string, LevelProgramming>>({});
  
  const [currentScheduledDate, setCurrentScheduledDate] = React.useState<Date | undefined>();
  const [currentScheduledTime, setCurrentScheduledTime] = React.useState<string>("09:00");
  const [currentEmailSubject, setCurrentEmailSubject] = React.useState<string>(DEFAULT_EMAIL_SUBJECT);
  const [currentEmailMessageTemplate, setCurrentEmailMessageTemplate] = React.useState<string>(DEFAULT_EMAIL_MESSAGE_TEMPLATE);

  const { toast } = useToast();
  const { maxAccessLevel, isLoadingProgress } = usePracticumProgress();

  React.useEffect(() => {
    async function loadData() {
      try {
        const [studentData, levelData] = await Promise.all([
          getStudents(), 
          getAcademicLevels(),
        ]);
        setAllStudentsData(studentData);
        setAllAcademicLevelsFromData(levelData);

        if (typeof window !== 'undefined') {
          const storedStudentIds = localStorage.getItem(CONFIRMED_STUDENT_IDS_KEY);
          setConfirmedStudentIdsFromPreviousStage(storedStudentIds ? JSON.parse(storedStudentIds) : []);
          
          setNotifiedInstitutionName(localStorage.getItem(LAST_NOTIFIED_INSTITUTION_NAME_KEY) || "Institución no especificada");
          setInstitutionContactName(localStorage.getItem(LAST_NOTIFIED_INSTITUTION_CONTACT_NAME_KEY) || "[Nombre Directivo]");
          setInstitutionContactRole(localStorage.getItem(LAST_NOTIFIED_INSTITUTION_CONTACT_ROLE_KEY) || "[Cargo Directivo]");
          setInstitutionContactEmail(localStorage.getItem(LAST_NOTIFIED_INSTITUTION_CONTACT_EMAIL_KEY) || "[Correo Electronico Directivo]");

          const profStart = localStorage.getItem(PRACTICUM_PROF_START_DATE_KEY);
          if (profStart) setPracticumProfStartDate(new Date(profStart));
          const profEnd = localStorage.getItem(PRACTICUM_PROF_END_DATE_KEY);
          if (profEnd) setPracticumProfEndDate(new Date(profEnd));
          const otherStart = localStorage.getItem(PRACTICUM_OTHER_START_DATE_KEY);
          if (otherStart) setPracticumOtherStartDate(new Date(otherStart));
          const otherEnd = localStorage.getItem(PRACTICUM_OTHER_END_DATE_KEY);
          if (otherEnd) setPracticumOtherEndDate(new Date(otherEnd));
          
          const storedProgramming = localStorage.getItem(STUDENT_NOTIFICATION_LEVEL_PROGRAMMING_KEY);
          if (storedProgramming) {
            const parsedProgramming = JSON.parse(storedProgramming) as Record<string, LevelProgramming>;
            Object.keys(parsedProgramming).forEach(levelId => {
              if (parsedProgramming[levelId].scheduledDate && typeof parsedProgramming[levelId].scheduledDate === 'string') {
                parsedProgramming[levelId].scheduledDate = new Date(parsedProgramming[levelId].scheduledDate as string);
              }
            });
            setProgrammingByLevel(parsedProgramming);
          }
        }
      } catch (error) {
         toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar datos iniciales o de localStorage.",
          variant: "destructive",
        });
      }
    }
    if (!isLoadingProgress && maxAccessLevel >= STAGES.STUDENT_NOTIFICATION) {
      loadData();
    }
  }, [toast, isLoadingProgress, maxAccessLevel]);

  React.useEffect(() => {
    if (allStudentsData.length > 0 && confirmedStudentIdsFromPreviousStage.length > 0) {
      const confirmedSet = new Set(confirmedStudentIdsFromPreviousStage);
      setStudentsReadyForNotification(allStudentsData.filter(s => confirmedSet.has(s.id)));
    } else {
      setStudentsReadyForNotification([]);
    }
  }, [allStudentsData, confirmedStudentIdsFromPreviousStage]);

  React.useEffect(() => {
    if (studentsReadyForNotification.length > 0 && allAcademicLevelsFromData.length > 0) {
      const activePracticumLevelNames = new Set(studentsReadyForNotification.map(student => student.practicumLevel));
      const filteredLevels = allAcademicLevelsFromData.filter(level => activePracticumLevelNames.has(level.name));
      setDisplayableAcademicLevels(filteredLevels);

      if (selectedLevelId && !filteredLevels.find(l => l.id === selectedLevelId)) {
        setSelectedLevelId(""); // Reset if current selection is no longer valid
      }
    } else {
      setDisplayableAcademicLevels([]);
      setSelectedLevelId("");
    }
  }, [studentsReadyForNotification, allAcademicLevelsFromData, selectedLevelId]);


  React.useEffect(() => {
    // This effect populates the form fields when a level is selected
    if (selectedLevelId && programmingByLevel) {
      const programming = programmingByLevel[selectedLevelId];
      setCurrentScheduledDate(programming?.scheduledDate ? (programming.scheduledDate instanceof Date ? programming.scheduledDate : new Date(programming.scheduledDate)) : undefined);
      setCurrentScheduledTime(programming?.scheduledTime || "09:00");
      setCurrentEmailSubject(programming?.emailSubject || DEFAULT_EMAIL_SUBJECT);
      setCurrentEmailMessageTemplate(programming?.emailMessageTemplate || DEFAULT_EMAIL_MESSAGE_TEMPLATE);
      
      const level = displayableAcademicLevels.find(l => l.id === selectedLevelId);
      if (level) {
          const filtered = studentsReadyForNotification.filter(s => s.practicumLevel === level.name);
          setStudentsInSelectedLevelForPreview(filtered);
          if (filtered.length > 0) {
            if (!selectedStudentForPreviewId || !filtered.find(s => s.id === selectedStudentForPreviewId)) {
                 setSelectedStudentForPreviewId(filtered[0].id); // Auto-select first for preview
            }
          } else {
            setSelectedStudentForPreviewId("");
          }
      } else {
        setStudentsInSelectedLevelForPreview([]);
        setSelectedStudentForPreviewId("");
      }
    } else { 
        // Reset form fields if no level is selected
        setStudentsInSelectedLevelForPreview([]);
        setSelectedStudentForPreviewId("");
        setCurrentScheduledDate(undefined);
        setCurrentScheduledTime("09:00");
        setCurrentEmailSubject(DEFAULT_EMAIL_SUBJECT);
        setCurrentEmailMessageTemplate(DEFAULT_EMAIL_MESSAGE_TEMPLATE);
    }
  }, [selectedLevelId, programmingByLevel, displayableAcademicLevels, studentsReadyForNotification]);

  const updateProgrammingForLevel = (levelId: string, newProgramming: Partial<LevelProgramming>) => {
    if (!levelId) return;
    setProgrammingByLevel(prev => {
      const updatedLevelProg = { 
        ...(prev[levelId] || { 
            scheduledTime: "09:00", 
            emailSubject: DEFAULT_EMAIL_SUBJECT, 
            emailMessageTemplate: DEFAULT_EMAIL_MESSAGE_TEMPLATE 
        }), 
        ...newProgramming 
      };
      const newState = { ...prev, [levelId]: updatedLevelProg };
      
      // Create a storable version with date as ISO string
      const storableState = JSON.parse(JSON.stringify(newState)); 
      Object.keys(storableState).forEach(lId => {
        if (storableState[lId].scheduledDate && storableState[lId].scheduledDate instanceof Date) {
          storableState[lId].scheduledDate = (storableState[lId].scheduledDate as Date).toISOString();
        } else if (typeof storableState[lId].scheduledDate === 'string') {
           // Ensure it's a valid ISO string if it came from localStorage directly
           try {
            storableState[lId].scheduledDate = new Date(storableState[lId].scheduledDate).toISOString();
           } catch (e) { /* ignore if not a valid date string */ }
        }
      });
      localStorage.setItem(STUDENT_NOTIFICATION_LEVEL_PROGRAMMING_KEY, JSON.stringify(storableState));
      return newState;
    });
  };
  
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLevelId || studentsInSelectedLevelForPreview.length === 0) {
       toast({
        title: "Información Faltante",
        description: "Seleccione un nivel de práctica con estudiantes asignados.",
        variant: "destructive",
      });
      return;
    }
    if (!currentScheduledDate || !currentScheduledTime.trim() || !currentEmailSubject.trim() || !currentEmailMessageTemplate.trim()) {
        toast({
         title: "Configuración Incompleta",
         description: "Complete todos los campos de programación (fecha, hora, asunto y mensaje) para el nivel seleccionado.",
         variant: "destructive",
       });
       return;
     }

    const scheduledDateTime = new Date(currentScheduledDate);
    const [hours, minutes] = currentScheduledTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes);
    
    const levelName = displayableAcademicLevels.find(l=>l.id === selectedLevelId)?.name;
    console.log(`Programando notificaciones para nivel: ${levelName}`);
    console.log(`Fecha y hora programada: ${scheduledDateTime.toLocaleString('es-CL')}`);
    console.log(`Asunto: ${currentEmailSubject}`);

    const actualStudentsToSend = studentsReadyForNotification.filter(s => s.practicumLevel === levelName);

    actualStudentsToSend.forEach(student => {
      const studentFullName = `${student.firstName} ${student.lastNamePaternal} ${student.lastNameMaternal}`;
      
      let startDate, endDate;
      if (student.practicumLevel.toLowerCase().includes('profesional')) {
          startDate = practicumProfStartDate;
          endDate = practicumProfEndDate;
      } else {
          startDate = practicumOtherStartDate;
          endDate = practicumOtherEndDate;
      }

      const finalMessage = currentEmailMessageTemplate
        .replace(/\[Nombre del Estudiante\]/g, studentFullName)
        .replace(/\[Nombre Institucion\]/g, notifiedInstitutionName || "la institución asignada")
        .replace(/\[Nivel de Practica\]/g, student.practicumLevel)
        .replace(/\[Fecha Inicio Practica\]/g, formatDateForStudentEmail(startDate, 'start'))
        .replace(/\[Fecha Termino Practica\]/g, formatDateForStudentEmail(endDate, 'end'))
        .replace(/\[Nombre Directivo\]/g, institutionContactName)
        .replace(/\[Cargo Directivo\]/g, institutionContactRole)
        .replace(/\[Correo Electronico Directivo\]/g, institutionContactEmail);

      console.log(`--- Para ${student.email} (Estudiante: ${studentFullName}) ---`);
      console.log(`Mensaje: ${finalMessage}`);
    });

    toast({
      title: "Notificaciones Programadas (Simulado)",
      description: `Correos para ${actualStudentsToSend.length} estudiante(s) de ${levelName} programados para ${scheduledDateTime.toLocaleString('es-CL')}. Este es el último paso del flujo principal.`,
    });
  };

  const selectedStudentDetailsForPreview = allStudentsData.find(s => s.id === selectedStudentForPreviewId);
  let emailPreview = DEFAULT_EMAIL_MESSAGE_TEMPLATE; // Default before replacements

  if (selectedStudentDetailsForPreview) {
      let startDate, endDate;
      if (selectedStudentDetailsForPreview.practicumLevel.toLowerCase().includes('profesional')) {
          startDate = practicumProfStartDate;
          endDate = practicumProfEndDate;
      } else {
          startDate = practicumOtherStartDate;
          endDate = practicumOtherEndDate;
      }
      emailPreview = currentEmailMessageTemplate
        .replace(/\[Nombre del Estudiante\]/g, `${selectedStudentDetailsForPreview.firstName} ${selectedStudentDetailsForPreview.lastNamePaternal} ${selectedStudentDetailsForPreview.lastNameMaternal}`)
        .replace(/\[Nombre Institucion\]/g, notifiedInstitutionName || "la institución asignada")
        .replace(/\[Nivel de Practica\]/g, selectedStudentDetailsForPreview.practicumLevel)
        .replace(/\[Fecha Inicio Practica\]/g, formatDateForStudentEmail(startDate, 'start'))
        .replace(/\[Fecha Termino Practica\]/g, formatDateForStudentEmail(endDate, 'end'))
        .replace(/\[Nombre Directivo\]/g, institutionContactName)
        .replace(/\[Cargo Directivo\]/g, institutionContactRole)
        .replace(/\[Correo Electronico Directivo\]/g, institutionContactEmail);
  } else {
     emailPreview = currentEmailMessageTemplate
        .replace(/\[Nombre del Estudiante\]/g, "(Nombre del Estudiante)")
        .replace(/\[Nombre Institucion\]/g, notifiedInstitutionName || "la institución asignada")
        .replace(/\[Nivel de Practica\]/g, "[Nivel de Practica]")
        .replace(/\[Fecha Inicio Practica\]/g, formatDateForStudentEmail(undefined, 'start'))
        .replace(/\[Fecha Termino Practica\]/g, formatDateForStudentEmail(undefined, 'end'))
        .replace(/\[Nombre Directivo\]/g, institutionContactName || "[Nombre Directivo]")
        .replace(/\[Cargo Directivo\]/g, institutionContactRole || "[Cargo Directivo]")
        .replace(/\[Correo Electronico Directivo\]/g, institutionContactEmail || "[Correo Electronico Directivo]");
  }


  if (isLoadingProgress) {
    return <div className="flex justify-center items-center h-64"><p>Cargando notificaciones a estudiantes...</p></div>;
  }
  
  return (
    <>
      <PageHeader
        title="Notificación a estudiantes seleccionados"
        description="Configure y programe el envío de correos de confirmación a los alumnos asignados a la institución, agrupados por su nivel de práctica."
      />
      <form onSubmit={handleSendNotification}>
        <Card>
          <CardHeader>
            <CardTitle>Redactar y Programar Notificación por Nivel de Práctica</CardTitle>
            <CardDescription>
              Los estudiantes listados son aquellos confirmados en etapas anteriores.
              Seleccione un nivel de práctica para definir la fecha, hora y mensaje de la notificación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="institution-name">Institución Asignada para esta Notificación</Label>
              <Input id="institution-name" value={notifiedInstitutionName} readOnly className="mt-1 bg-muted"/>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="level-select">Nivel de Práctica a Notificar</Label>
                <Select 
                    onValueChange={(value) => {
                        setSelectedLevelId(value);
                        setSelectedStudentForPreviewId(""); 
                    }} 
                    value={selectedLevelId}
                    disabled={displayableAcademicLevels.length === 0}
                >
                  <SelectTrigger id="level-select">
                    <SelectValue placeholder={displayableAcademicLevels.length === 0 ? "No hay niveles con alumnos confirmados" : "Elija un nivel de práctica"} />
                  </SelectTrigger>
                  <SelectContent>
                    {displayableAcademicLevels.map(level => (
                      <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 {displayableAcademicLevels.length === 0 && studentsReadyForNotification.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Asegúrese de que los estudiantes confirmados tengan un nivel de práctica asignado y que los niveles existan.</p>
                )}
                 {studentsReadyForNotification.length === 0 && !isLoadingProgress && (
                     <p className="text-xs text-muted-foreground mt-1">No hay estudiantes confirmados de la etapa anterior para notificar.</p>
                 )}
              </div>
              <div>
                <Label htmlFor="student-preview-select">Alumno (para vista previa del correo)</Label>
                <Select 
                    onValueChange={setSelectedStudentForPreviewId} 
                    value={selectedStudentForPreviewId}
                    disabled={!selectedLevelId || studentsInSelectedLevelForPreview.length === 0}
                >
                  <SelectTrigger id="student-preview-select">
                    <SelectValue placeholder={studentsInSelectedLevelForPreview.length === 0 && selectedLevelId ? "No hay alumnos en este nivel" : (selectedLevelId ? "Elija un alumno para previsualizar" : "Seleccione un nivel primero")} />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsInSelectedLevelForPreview.map(student => (
                      <SelectItem key={student.id} value={student.id}>{student.firstName} {student.lastNamePaternal} ({student.rut})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {!selectedLevelId && displayableAcademicLevels.length > 0 && (
                 <Alert variant="default" className="bg-accent/10 border-accent/30">
                    <Info className="h-4 w-4 text-accent" />
                    <AlertTitle className="text-accent">Seleccione un Nivel de Práctica</AlertTitle>
                    <AlertDescription>
                        Por favor, elija un nivel de práctica de la lista para configurar su notificación.
                    </AlertDescription>
                </Alert>
            )}

            {selectedLevelId && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="schedule-date">Fecha de envío del correo</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="schedule-date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !currentScheduledDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentScheduledDate ? format(currentScheduledDate, "PPP", { locale: es }) : <span>Elija una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={currentScheduledDate}
                          onSelect={(date) => {
                            setCurrentScheduledDate(date);
                            updateProgrammingForLevel(selectedLevelId, { scheduledDate: date });
                          }}
                          initialFocus
                          locale={es}
                          fromDate={new Date()} // Emails can only be scheduled for future dates
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="schedule-time">Horario de envío del correo</Label>
                    <Input 
                      id="schedule-time" 
                      type="time" 
                      value={currentScheduledTime}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        setCurrentScheduledTime(newTime);
                        updateProgrammingForLevel(selectedLevelId, { scheduledTime: newTime });
                      }}
                      className="mt-1"
                      required 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email-subject-student">Asunto del Correo</Label>
                  <Input 
                    id="email-subject-student" 
                    placeholder={DEFAULT_EMAIL_SUBJECT}
                    value={currentEmailSubject}
                    onChange={(e) => {
                        const newSubject = e.target.value;
                        setCurrentEmailSubject(newSubject);
                        updateProgrammingForLevel(selectedLevelId, { emailSubject: newSubject });
                    }}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email-message-student">Plantilla de correo editable</Label>
                  <Textarea
                    id="email-message-student"
                    placeholder={DEFAULT_EMAIL_MESSAGE_TEMPLATE}
                    rows={12} // Increased rows for better visibility of the template
                    value={currentEmailMessageTemplate}
                    onChange={(e) => {
                        const newTemplate = e.target.value;
                        setCurrentEmailMessageTemplate(newTemplate);
                        updateProgrammingForLevel(selectedLevelId, { emailMessageTemplate: newTemplate });
                    }}
                    className="mt-1"
                    required
                  />
                   <p className="text-xs text-muted-foreground mt-1">
                    Marcadores disponibles: [Nombre del Estudiante], [Nombre Institucion], [Nivel de Practica], [Fecha Inicio Practica], [Fecha Termino Practica], [Nombre Directivo], [Cargo Directivo], [Correo Electronico Directivo].
                    {selectedStudentDetailsForPreview && ` Vista previa usando datos de: ${selectedStudentDetailsForPreview.firstName} ${selectedStudentDetailsForPreview.lastNamePaternal}.`}
                   </p>
                </div>
                <div>
                    <Label>Vista Previa del Mensaje (para {selectedStudentDetailsForPreview ? `${selectedStudentDetailsForPreview.firstName} ${selectedStudentDetailsForPreview.lastNamePaternal}`: "alumno seleccionado"})</Label>
                    <div className="mt-1 p-3 border rounded-md bg-muted min-h-[200px] text-sm whitespace-pre-wrap overflow-auto">
                        {emailPreview}
                    </div>
                </div>
              </>
            )}
            
            <Button 
                type="submit" 
                className="w-full md:w-auto"
                disabled={!selectedLevelId || studentsInSelectedLevelForPreview.length === 0 || !currentScheduledDate || isLoadingProgress}
            >
              <SendHorizonal className="mr-2 h-4 w-4" /> Programar Notificaciones para este Nivel
            </Button>
          </CardContent>
        </Card>
      </form>
    </>
  );
}

