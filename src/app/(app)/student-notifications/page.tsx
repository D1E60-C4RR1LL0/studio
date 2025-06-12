
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Textarea no se usa para plantillas aquí, son globales
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarIcon, SendHorizonal, Info, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn, textToHtmlWithPlaceholders } from "@/lib/utils";
import { getStudents, getAcademicLevels } from "@/lib/data";
import type { Student, AcademicLevel } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { usePracticumProgress, STAGES } from '@/hooks/usePracticumProgress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DEFAULT_STUDENT_EMAIL_SUBJECT, DEFAULT_STUDENT_EMAIL_BODY_TEXT } from "@/app/(app)/admin/templates/page";
// RichTextEditor no se usa aquí para preview

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

const TEMPLATE_STUDENT_SUBJECT_KEY = "TEMPLATE_STUDENT_SUBJECT";
const TEMPLATE_STUDENT_BODY_HTML_KEY = "TEMPLATE_STUDENT_BODY_HTML"; // Stores plain text


interface LevelProgramming {
  scheduledDate?: Date | string;
  scheduledTime: string;
}

const formatDateForStudentEmail = (date: Date | undefined, type: 'start' | 'end'): string => {
  if (!date) return type === 'start' ? "[Fecha Inicio Practica indefinida]" : "[Fecha Termino Practica indefinida]";
  const yearFormat = type === 'end' ? " yyyy" : ""; 
  return format(date, `'semana del' dd 'de' MMMM${yearFormat}`, { locale: es });
};


const renderStudentEmail = (
  templateSubject: string,
  templateBodyPlainText: string, 
  student: Student,
  notifiedInstitutionName: string,
  institutionContactName: string,
  institutionContactRole: string,
  institutionContactEmail: string,
  practicumProfStartDate?: Date,
  practicumProfEndDate?: Date,
  practicumOtherStartDate?: Date,
  practicumOtherEndDate?: Date
): { subject: string; body: string } => {

  let startDateKeyToUse = "{{practicumStartDate}}";
  let endDateKeyToUse = "{{practicumEndDate}}";
  let startDate, endDate;

  // Determine which dates to use based on practicum level
  if (student.practicumLevel.toLowerCase().includes('profesional') || student.practicumLevel.toLowerCase().includes('pasantía')) { 
    startDate = practicumProfStartDate;
    endDate = practicumProfEndDate;
  } else { 
    startDate = practicumOtherStartDate;
    endDate = practicumOtherEndDate;
  }
  
  const textPlaceholders: Record<string, string> = {
    "{{estudiante.nombre}}": student.firstName,
    "{{estudiante.ap_paterno}}": student.lastNamePaternal,
    "{{estudiante.ap_materno}}": student.lastNameMaternal,
    "{{nombre_establecimiento}}": notifiedInstitutionName,
    "{{nivel_practica}}": student.practicumLevel,
    [startDateKeyToUse]: formatDateForStudentEmail(startDate, 'start'),
    [endDateKeyToUse]: formatDateForStudentEmail(endDate, 'end'),
    "{{directivo.nombre}}": institutionContactName,
    "{{directivo.cargo}}": institutionContactRole,
    "{{directivo.email}}": institutionContactEmail,
  };
  
  const htmlPlaceholders = {}; 

  const body = textToHtmlWithPlaceholders(templateBodyPlainText, htmlPlaceholders, textPlaceholders);

  let subject = templateSubject;
  for (const key in textPlaceholders) {
    if (Object.prototype.hasOwnProperty.call(textPlaceholders, key)) {
        const placeholderValue = textPlaceholders[key as keyof typeof textPlaceholders];
        subject = subject.replace(new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), placeholderValue);
    }
  }

  return { subject, body };
};


export default function StudentNotificationsPage() {
  const [allStudentsData, setAllStudentsData] = React.useState<Student[]>([]);
  const [confirmedStudentIdsFromPreviousStage, setConfirmedStudentIdsFromPreviousStage] = React.useState<string[]>([]);
  const [studentsReadyForNotification, setStudentsReadyForNotification] = React.useState<Student[]>([]);

  const [allAcademicLevelsFromData, setAllAcademicLevelsFromData] = React.useState<AcademicLevel[]>([]);
  const [displayableAcademicLevels, setDisplayableAcademicLevels] = React.useState<AcademicLevel[]>([]);

  const [notifiedInstitutionName, setNotifiedInstitutionName] = React.useState<string>("(Institución no especificada)");
  const [institutionContactName, setInstitutionContactName] = React.useState<string>("(Nombre de directivo no disponible)");
  const [institutionContactRole, setInstitutionContactRole] = React.useState<string>("(Cargo de directivo no disponible)");
  const [institutionContactEmail, setInstitutionContactEmail] = React.useState<string>("(Email de directivo no disponible)");
  
  const [practicumProfStartDate, setPracticumProfStartDate] = React.useState<Date | undefined>();
  const [practicumProfEndDate, setPracticumProfEndDate] = React.useState<Date | undefined>();
  const [practicumOtherStartDate, setPracticumOtherStartDate] = React.useState<Date | undefined>();
  const [practicumOtherEndDate, setPracticumOtherEndDate] = React.useState<Date | undefined>();

  const [selectedLevelId, setSelectedLevelId] = React.useState<string>("");
  const [studentsInSelectedLevelForPreview, setStudentsInSelectedLevelForPreview] = React.useState<Student[]>([]);
  const [selectedStudentForPreviewId, setSelectedStudentForPreviewId] = React.useState<string>("");

  const [programmingByLevel, setProgrammingByLevel] = React.useState<Record<string, LevelProgramming>>({});

  const [studentEmailSubjectTemplate, setStudentEmailSubjectTemplate] = React.useState(DEFAULT_STUDENT_EMAIL_SUBJECT);
  const [studentEmailBodyPlainTextTemplate, setStudentEmailBodyPlainTextTemplate] = React.useState(DEFAULT_STUDENT_EMAIL_BODY_TEXT);

  const [previewSubject, setPreviewSubject] = React.useState("");
  const [previewBodyHtml, setPreviewBodyHtml] = React.useState("");

  const [currentScheduledDate, setCurrentScheduledDate] = React.useState<Date | undefined>();
  const [currentScheduledTime, setCurrentScheduledTime] = React.useState<string>("09:00");


  const { toast } = useToast();
  const { maxAccessLevel, isLoadingProgress } = usePracticumProgress();

  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = React.useState(false);
  const [successDialogTitle, setSuccessDialogTitle] = React.useState("");
  const [successDialogMessage, setSuccessDialogMessage] = React.useState("");


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSubject = localStorage.getItem(TEMPLATE_STUDENT_SUBJECT_KEY);
      setStudentEmailSubjectTemplate(storedSubject || DEFAULT_STUDENT_EMAIL_SUBJECT);

      const storedBody = localStorage.getItem(TEMPLATE_STUDENT_BODY_HTML_KEY); 
      setStudentEmailBodyPlainTextTemplate(storedBody || DEFAULT_STUDENT_EMAIL_BODY_TEXT);
    }

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

          const instName = localStorage.getItem(LAST_NOTIFIED_INSTITUTION_NAME_KEY);
          setNotifiedInstitutionName(instName && instName.trim() !== "" ? instName : "(Institución no especificada)");
          
          const contactName = localStorage.getItem(LAST_NOTIFIED_INSTITUTION_CONTACT_NAME_KEY);
          setInstitutionContactName(contactName && contactName.trim() !== "" ? contactName : "(Nombre de directivo no disponible)");

          const contactRole = localStorage.getItem(LAST_NOTIFIED_INSTITUTION_CONTACT_ROLE_KEY);
          setInstitutionContactRole(contactRole && contactRole.trim() !== "" ? contactRole : "(Cargo de directivo no disponible)");

          const contactEmail = localStorage.getItem(LAST_NOTIFIED_INSTITUTION_CONTACT_EMAIL_KEY);
          setInstitutionContactEmail(contactEmail && contactEmail.trim() !== "" ? contactEmail : "(Email de directivo no disponible)");

          const profStartStr = localStorage.getItem(PRACTICUM_PROF_START_DATE_KEY);
          if (profStartStr) setPracticumProfStartDate(parseISO(profStartStr));
          const profEndStr = localStorage.getItem(PRACTICUM_PROF_END_DATE_KEY);
          if (profEndStr) setPracticumProfEndDate(parseISO(profEndStr));
          const otherStartStr = localStorage.getItem(PRACTICUM_OTHER_START_DATE_KEY);
          if (otherStartStr) setPracticumOtherStartDate(parseISO(otherStartStr));
          const otherEndStr = localStorage.getItem(PRACTICUM_OTHER_END_DATE_KEY);
          if (otherEndStr) setPracticumOtherEndDate(parseISO(otherEndStr));

          const storedProgramming = localStorage.getItem(STUDENT_NOTIFICATION_LEVEL_PROGRAMMING_KEY);
          if (storedProgramming) {
            const parsedProgramming = JSON.parse(storedProgramming) as Record<string, LevelProgramming>;
            Object.keys(parsedProgramming).forEach(levelIdKey => {
              if (parsedProgramming[levelIdKey].scheduledDate && typeof parsedProgramming[levelIdKey].scheduledDate === 'string') {
                parsedProgramming[levelIdKey].scheduledDate = parseISO(parsedProgramming[levelIdKey].scheduledDate as string);
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
        setSelectedLevelId(""); 
      }
    } else {
      setDisplayableAcademicLevels([]);
      setSelectedLevelId("");
    }
  }, [studentsReadyForNotification, allAcademicLevelsFromData, selectedLevelId]);


  React.useEffect(() => {
    if (selectedLevelId && programmingByLevel) {
      const programming = programmingByLevel[selectedLevelId];
      setCurrentScheduledDate(programming?.scheduledDate ? (programming.scheduledDate instanceof Date ? programming.scheduledDate : parseISO(programming.scheduledDate as string)) : undefined);
      setCurrentScheduledTime(programming?.scheduledTime || "09:00");

      const level = displayableAcademicLevels.find(l => l.id === selectedLevelId);
      if (level) {
          const filtered = studentsReadyForNotification.filter(s => s.practicumLevel === level.name);
          setStudentsInSelectedLevelForPreview(filtered);
          if (filtered.length > 0) {
            if (!selectedStudentForPreviewId || !filtered.find(s => s.id === selectedStudentForPreviewId)) {
                 setSelectedStudentForPreviewId(filtered[0].id);
            }
          } else {
            setSelectedStudentForPreviewId(""); 
          }
      } else {
        setStudentsInSelectedLevelForPreview([]);
        setSelectedStudentForPreviewId("");
      }
    } else { 
        setStudentsInSelectedLevelForPreview([]);
        setSelectedStudentForPreviewId("");
        setCurrentScheduledDate(undefined);
        setCurrentScheduledTime("09:00");
    }
  }, [selectedLevelId, programmingByLevel, displayableAcademicLevels, studentsReadyForNotification, selectedStudentForPreviewId]); 


  React.useEffect(() => {
    const studentToPreview = allStudentsData.find(s => s.id === selectedStudentForPreviewId);
    if (studentToPreview) {
      const { subject, body } = renderStudentEmail(
        studentEmailSubjectTemplate,
        studentEmailBodyPlainTextTemplate, 
        studentToPreview,
        notifiedInstitutionName,
        institutionContactName,
        institutionContactRole,
        institutionContactEmail,
        practicumProfStartDate,
        practicumProfEndDate,
        practicumOtherStartDate,
        practicumOtherEndDate
      );
      setPreviewSubject(subject);
      setPreviewBodyHtml(body);
    } else if (selectedLevelId && studentsInSelectedLevelForPreview.length > 0) {
      const genericStudent = studentsInSelectedLevelForPreview[0]; 
       const { subject, body } = renderStudentEmail(
        studentEmailSubjectTemplate,
        studentEmailBodyPlainTextTemplate,
        {...genericStudent, firstName: "{{estudiante.nombre}}", lastNamePaternal: "{{estudiante.ap_paterno}}", lastNameMaternal: "{{estudiante.ap_materno}}" }, 
        notifiedInstitutionName,
        institutionContactName,
        institutionContactRole,
        institutionContactEmail,
        practicumProfStartDate,
        practicumProfEndDate,
        practicumOtherStartDate,
        practicumOtherEndDate
      );
      setPreviewSubject(subject);
      setPreviewBodyHtml(body);
    }
     else {
      const tempStudentForGenericPreview : Student = { 
        id: 'generic', rut: '0', 
        firstName: '{{estudiante.nombre}}', 
        lastNamePaternal: '{{estudiante.ap_paterno}}', 
        lastNameMaternal: '{{estudiante.ap_materno}}', 
        email: '', career: '', 
        practicumLevel: displayableAcademicLevels.find(l=>l.id === selectedLevelId)?.name || "{{nivel_practica}}"
      };
      const {subject, body} = renderStudentEmail(
        studentEmailSubjectTemplate,
        studentEmailBodyPlainTextTemplate,
        tempStudentForGenericPreview,
        notifiedInstitutionName,
        institutionContactName,
        institutionContactRole,
        institutionContactEmail,
        practicumProfStartDate,
        practicumProfEndDate,
        practicumOtherStartDate,
        practicumOtherEndDate
      );
      setPreviewSubject(subject);
      setPreviewBodyHtml(body);
    }
  }, [
    selectedStudentForPreviewId, 
    allStudentsData, 
    studentEmailSubjectTemplate, 
    studentEmailBodyPlainTextTemplate, 
    notifiedInstitutionName, 
    institutionContactName, 
    institutionContactRole, 
    institutionContactEmail, 
    practicumProfStartDate, 
    practicumProfEndDate, 
    practicumOtherStartDate, 
    practicumOtherEndDate,
    selectedLevelId, 
    studentsInSelectedLevelForPreview,
    displayableAcademicLevels
  ]);


  const updateProgrammingForLevel = (levelId: string, newProgramming: Partial<LevelProgramming>) => {
    if (!levelId) return; 
    setProgrammingByLevel(prev => {
      const updatedLevelProg = {
        ...(prev[levelId] || { scheduledTime: "09:00" }), 
        ...newProgramming 
      };
      
      if (updatedLevelProg.scheduledDate && updatedLevelProg.scheduledDate instanceof Date) {
        // @ts-ignore
        updatedLevelProg.scheduledDate = updatedLevelProg.scheduledDate.toISOString();
      }
      
      const newState = { ...prev, [levelId]: updatedLevelProg };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STUDENT_NOTIFICATION_LEVEL_PROGRAMMING_KEY, JSON.stringify(newState));
      }
      const reactState = { ...newState };
      if (reactState[levelId]?.scheduledDate && typeof reactState[levelId].scheduledDate === 'string') {
        // @ts-ignore
        reactState[levelId].scheduledDate = parseISO(reactState[levelId].scheduledDate as string);
      }

      return reactState;
    });
  };

  const handleSendAllNotifications = (e: React.FormEvent) => {
    e.preventDefault();

    const configuredLevelsAndStudents: Array<{
      level: AcademicLevel;
      programming: LevelProgramming;
      students: Student[];
      scheduledDateTime: Date;
    }> = [];

    for (const levelIdKey in programmingByLevel) {
      const programming = programmingByLevel[levelIdKey];
      if (
        programming.scheduledDate &&
        programming.scheduledTime?.trim() &&
        studentEmailSubjectTemplate.trim() &&
        studentEmailBodyPlainTextTemplate.trim() 
      ) {
        const level = displayableAcademicLevels.find(l => l.id === levelIdKey);
        if (level) {
          const studentsForThisLevel = studentsReadyForNotification.filter(
            s => s.practicumLevel === level.name
          );

          if (studentsForThisLevel.length > 0) {
            const dateToParse = programming.scheduledDate instanceof Date 
                               ? programming.scheduledDate 
                               : parseISO(programming.scheduledDate as string);
            
            const scheduledDateTime = new Date(dateToParse);
            const [hours, minutes] = programming.scheduledTime.split(':').map(Number);
            scheduledDateTime.setHours(hours, minutes, 0, 0); 

            configuredLevelsAndStudents.push({
              level,
              programming,
              students: studentsForThisLevel,
              scheduledDateTime,
            });
          }
        }
      }
    }

    if (configuredLevelsAndStudents.length === 0) {
      toast({
        title: "No hay niveles completamente configurados",
        description: "Por favor, configure la fecha y hora para al menos un nivel de práctica con estudiantes asignados antes de programar. Asegúrese también de que las plantillas de correo no estén vacías.",
        variant: "destructive",
      });
      return;
    }

    let totalStudentsNotifiedCount = 0;
    configuredLevelsAndStudents.forEach(({ level, programming, students, scheduledDateTime }) => {
      console.log(`--- Programando notificaciones para nivel: ${level.name} ---`);
      console.log(`Fecha y hora programada: ${scheduledDateTime.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}`);
      
      students.forEach(student => {
        const { subject: finalSubject, body: finalBody } = renderStudentEmail(
          studentEmailSubjectTemplate,
          studentEmailBodyPlainTextTemplate, 
          student,
          notifiedInstitutionName,
          institutionContactName,
          institutionContactRole,
          institutionContactEmail,
          practicumProfStartDate,
          practicumProfEndDate,
          practicumOtherStartDate,
          practicumOtherEndDate
        );

        console.log(`   Para ${student.email} (Estudiante: ${student.firstName} ${student.lastNamePaternal})`);
        console.log(`   Asunto: ${finalSubject}`);
        totalStudentsNotifiedCount++;
      });
    });

    toast({
      title: "Notificaciones Programadas (Simulado)",
      description: `Correos para ${totalStudentsNotifiedCount} estudiante(s) en ${configuredLevelsAndStudents.length} nivel(es) han sido programados. Este es el último paso del flujo principal.`,
    });
    
    setSuccessDialogTitle("¡Notificaciones Programadas Exitosamente!");
    setSuccessDialogMessage(`Los correos para ${totalStudentsNotifiedCount} estudiante(s) en ${configuredLevelsAndStudents.length} nivel(es) han sido programados. Puede revisar la consola del navegador para ver los detalles de los correos simulados.`);
    setIsSuccessDialogOpen(true);
  };

  const fullyConfiguredLevelsCount = Object.values(programmingByLevel).filter(
    p => p.scheduledDate && p.scheduledTime?.trim()
  ).length;

  if (isLoadingProgress) {
    return <div className="flex justify-center items-center h-64"><p>Cargando notificaciones a estudiantes...</p></div>;
  }

  return (
    <>
      <PageHeader
        title="Notificación a estudiantes seleccionados"
        description="Configure y programe el envío de correos de confirmación a los alumnos asignados a la institución, agrupados por su nivel de práctica."
      />
      <form onSubmit={handleSendAllNotifications}>
        <Card>
          <CardHeader>
            <CardTitle>Programar Notificación por Nivel de Práctica</CardTitle>
            <CardDescription>
              Los estudiantes listados son aquellos confirmados en etapas anteriores.
              Seleccione un nivel de práctica para definir la fecha y hora de la notificación. 
              El asunto y cuerpo del correo se basan en las plantillas globales (editables en la sección 'Plantillas').
              Los cambios de fecha/hora se guardan automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="institution-name">Institución Asignada para esta Notificación</Label>
              <Input id="institution-name" value={notifiedInstitutionName} readOnly className="mt-1 bg-muted"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="level-select">Nivel de Práctica (para programar envío)</Label>
                <Select
                    onValueChange={(value) => setSelectedLevelId(value)}
                    value={selectedLevelId}
                    disabled={displayableAcademicLevels.length === 0}
                >
                  <SelectTrigger id="level-select">
                    <SelectValue placeholder={displayableAcademicLevels.length === 0 ? "No hay niveles con alumnos confirmados" : "Elija un nivel para programar"} />
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
                        Por favor, elija un nivel de práctica de la lista de arriba para definir su fecha y hora de envío.
                    </AlertDescription>
                </Alert>
            )}

            {selectedLevelId && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="schedule-date">Fecha de envío para {displayableAcademicLevels.find(l => l.id === selectedLevelId)?.name}</Label>
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
                          {currentScheduledDate ? format(currentScheduledDate instanceof Date ? currentScheduledDate : parseISO(currentScheduledDate as string), "PPP", { locale: es }) : <span>Elija una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={currentScheduledDate instanceof Date ? currentScheduledDate : (currentScheduledDate ? parseISO(currentScheduledDate as string) : undefined)}
                          onSelect={(date) => {
                            setCurrentScheduledDate(date); 
                            updateProgrammingForLevel(selectedLevelId, { scheduledDate: date });
                          }}
                          initialFocus
                          locale={es}
                          fromDate={new Date()} 
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="schedule-time">Horario de envío para {displayableAcademicLevels.find(l => l.id === selectedLevelId)?.name}</Label>
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
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Vista Previa del Correo para {selectedStudentForPreviewId ? studentsReadyForNotification.find(s=>s.id === selectedStudentForPreviewId)?.firstName : "Alumno Seleccionado"}</CardTitle>
                        <CardDescription>Así se verá el correo para el alumno seleccionado arriba, usando las plantillas de texto plano guardadas y convirtiéndolas a HTML.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Asunto (Vista Previa)</Label>
                            <Input value={previewSubject} readOnly className="mt-1 bg-muted/50" />
                        </div>
                        <div>
                            <Label>Cuerpo del Correo (Vista Previa Renderizada)</Label>
                            <div
                              className="mt-1 p-3 border rounded-md bg-muted min-h-[200px] text-sm overflow-auto"
                              dangerouslySetInnerHTML={{ __html: previewBodyHtml }} 
                            />
                        </div>
                    </CardContent>
                </Card>
              </>
            )}
            <div className="border-t pt-6">
              <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={fullyConfiguredLevelsCount === 0 || isLoadingProgress || !studentEmailSubjectTemplate.trim() || !studentEmailBodyPlainTextTemplate.trim()}
              >
                <SendHorizonal className="mr-2 h-4 w-4" /> Programar Todas las Notificaciones
              </Button>
              {fullyConfiguredLevelsCount === 0 && !isLoadingProgress && (
                <p className="text-sm text-muted-foreground mt-2">
                  No hay niveles de práctica con fecha/hora configuradas para enviar notificaciones. 
                  Por favor, seleccione un nivel y complete su programación.
                </p>
              )}
               {(!studentEmailSubjectTemplate.trim() || !studentEmailBodyPlainTextTemplate.trim()) && (
                    <p className="text-sm text-destructive mt-2">
                      Advertencia: La plantilla de asunto o cuerpo del correo para estudiantes está vacía. Por favor, configúrela en la sección 'Plantillas'.
                    </p>
                )}
            </div>
          </CardContent>
        </Card>
      </form>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle2 className="mr-2 h-6 w-6 text-green-500" />
              {successDialogTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">{successDialogMessage}</p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setIsSuccessDialogOpen(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
