
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
import { getStudents, getAcademicLevels, getInstitutions } from "@/lib/data"; // Added getInstitutions
import type { Student, AcademicLevel, Institution } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { usePracticumProgress, STAGES } from '@/hooks/usePracticumProgress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CONFIRMED_STUDENT_IDS_KEY = 'confirmedPracticumStudentIds';
const LAST_NOTIFIED_INSTITUTION_ID_KEY = 'lastNotifiedInstitutionId';
const LAST_NOTIFIED_INSTITUTION_NAME_KEY = 'lastNotifiedInstitutionName';
const STUDENT_NOTIFICATION_LEVEL_PROGRAMMING_KEY = 'studentNotificationLevelProgramming';

interface LevelProgramming {
  scheduledDate?: Date | string; // Store as ISO string in localStorage
  scheduledTime: string;
  emailSubject: string;
  emailMessageTemplate: string;
}

const DEFAULT_EMAIL_SUBJECT = "Confirmación de Práctica Pedagógica";
const DEFAULT_EMAIL_MESSAGE_TEMPLATE = "Estimado/a [Nombre del Estudiante],\n\nLe informamos que ha sido asignado/a para realizar su práctica en [Nombre Institucion].\n\nPronto recibirá más detalles.\n\nSaludos cordiales,\nUnidad de Prácticas Pedagógicas.";

export default function StudentNotificationsPage() {
  const [allStudents, setAllStudents] = React.useState<Student[]>([]);
  const [confirmedStudentIds, setConfirmedStudentIds] = React.useState<string[]>([]);
  const [studentsForNotification, setStudentsForNotification] = React.useState<Student[]>([]);
  
  const [academicLevels, setAcademicLevels] = React.useState<AcademicLevel[]>([]);
  const [institutions, setInstitutions] = React.useState<Institution[]>([]); // For getting institution details

  const [notifiedInstitutionId, setNotifiedInstitutionId] = React.useState<string | null>(null);
  const [notifiedInstitutionName, setNotifiedInstitutionName] = React.useState<string>("Cargando institución...");

  const [selectedLevelId, setSelectedLevelId] = React.useState<string>("");
  const [studentsInSelectedLevel, setStudentsInSelectedLevel] = React.useState<Student[]>([]);
  const [selectedStudentForPreviewId, setSelectedStudentForPreviewId] = React.useState<string>("");

  const [programmingByLevel, setProgrammingByLevel] = React.useState<Record<string, LevelProgramming>>({});
  
  // Form fields bound to the selectedLevelId's programming
  const [currentScheduledDate, setCurrentScheduledDate] = React.useState<Date | undefined>();
  const [currentScheduledTime, setCurrentScheduledTime] = React.useState<string>("09:00");
  const [currentEmailSubject, setCurrentEmailSubject] = React.useState<string>(DEFAULT_EMAIL_SUBJECT);
  const [currentEmailMessageTemplate, setCurrentEmailMessageTemplate] = React.useState<string>(DEFAULT_EMAIL_MESSAGE_TEMPLATE);

  const { toast } = useToast();
  const { maxAccessLevel, isLoadingProgress } = usePracticumProgress();

  // Load initial data and stored states from localStorage
  React.useEffect(() => {
    async function loadData() {
      try {
        const [studentData, levelData, institutionData] = await Promise.all([
          getStudents(), 
          getAcademicLevels(),
          getInstitutions()
        ]);
        setAllStudents(studentData);
        setAcademicLevels(levelData);
        setInstitutions(institutionData);

        if (typeof window !== 'undefined') {
          const storedStudentIds = localStorage.getItem(CONFIRMED_STUDENT_IDS_KEY);
          setConfirmedStudentIds(storedStudentIds ? JSON.parse(storedStudentIds) : []);

          const storedInstId = localStorage.getItem(LAST_NOTIFIED_INSTITUTION_ID_KEY);
          setNotifiedInstitutionId(storedInstId);
          const storedInstName = localStorage.getItem(LAST_NOTIFIED_INSTITUTION_NAME_KEY);
          setNotifiedInstitutionName(storedInstName || "Institución no especificada");
          
          const storedProgramming = localStorage.getItem(STUDENT_NOTIFICATION_LEVEL_PROGRAMMING_KEY);
          if (storedProgramming) {
            const parsedProgramming = JSON.parse(storedProgramming) as Record<string, LevelProgramming>;
            // Convert date strings back to Date objects
            Object.keys(parsedProgramming).forEach(levelId => {
              if (parsedProgramming[levelId].scheduledDate) {
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

  // Filter students based on confirmed IDs
  React.useEffect(() => {
    if (allStudents.length > 0 && confirmedStudentIds.length > 0) {
      const confirmedSet = new Set(confirmedStudentIds);
      setStudentsForNotification(allStudents.filter(s => confirmedSet.has(s.id)));
    } else {
      setStudentsForNotification([]);
    }
  }, [allStudents, confirmedStudentIds]);

  // Update form fields when selectedLevelId changes or programmingByLevel is loaded
  React.useEffect(() => {
    if (selectedLevelId && programmingByLevel) {
      const programming = programmingByLevel[selectedLevelId];
      setCurrentScheduledDate(programming?.scheduledDate ? (programming.scheduledDate instanceof Date ? programming.scheduledDate : new Date(programming.scheduledDate)) : undefined);
      setCurrentScheduledTime(programming?.scheduledTime || "09:00");
      setCurrentEmailSubject(programming?.emailSubject || DEFAULT_EMAIL_SUBJECT);
      setCurrentEmailMessageTemplate(programming?.emailMessageTemplate || DEFAULT_EMAIL_MESSAGE_TEMPLATE.replace("[Nombre Institucion]", notifiedInstitutionName || "la institución asignada"));
      
      const level = academicLevels.find(l => l.id === selectedLevelId);
      if (level) {
          const filtered = studentsForNotification.filter(s => s.practicumLevel === level.name);
          setStudentsInSelectedLevel(filtered);
          if (filtered.length > 0 && !selectedStudentForPreviewId) {
            setSelectedStudentForPreviewId(filtered[0].id);
          } else if (filtered.length === 0) {
            setSelectedStudentForPreviewId("");
          }
      } else {
        setStudentsInSelectedLevel([]);
        setSelectedStudentForPreviewId("");
      }
    } else { // Reset if no level selected
        setStudentsInSelectedLevel([]);
        setSelectedStudentForPreviewId("");
        setCurrentScheduledDate(undefined);
        setCurrentScheduledTime("09:00");
        setCurrentEmailSubject(DEFAULT_EMAIL_SUBJECT);
        setCurrentEmailMessageTemplate(DEFAULT_EMAIL_MESSAGE_TEMPLATE.replace("[Nombre Institucion]", notifiedInstitutionName || "la institución asignada"));
    }
  }, [selectedLevelId, programmingByLevel, academicLevels, studentsForNotification, notifiedInstitutionName]);

  // Persist changes to programmingByLevel in localStorage
  const updateProgrammingForLevel = (levelId: string, newProgramming: Partial<LevelProgramming>) => {
    if (!levelId) return;
    setProgrammingByLevel(prev => {
      const updatedLevelProg = { ...(prev[levelId] || {}), ...newProgramming };
      const newState = { ...prev, [levelId]: updatedLevelProg };
      
      // Store dates as ISO strings
      const storableState = JSON.parse(JSON.stringify(newState)); // Deep clone
      Object.keys(storableState).forEach(lId => {
        if (storableState[lId].scheduledDate && storableState[lId].scheduledDate instanceof Date) {
          storableState[lId].scheduledDate = (storableState[lId].scheduledDate as Date).toISOString();
        }
      });
      localStorage.setItem(STUDENT_NOTIFICATION_LEVEL_PROGRAMMING_KEY, JSON.stringify(storableState));
      return newState;
    });
  };
  
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLevelId || studentsInSelectedLevel.length === 0) {
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
    
    console.log(`Programando notificaciones para nivel: ${academicLevels.find(l=>l.id === selectedLevelId)?.name}`);
    console.log(`Fecha y hora programada: ${scheduledDateTime.toLocaleString('es-CL')}`);
    console.log(`Asunto: ${currentEmailSubject}`);

    studentsInSelectedLevel.forEach(student => {
      const studentFullName = `${student.firstName} ${student.lastNamePaternal} ${student.lastNameMaternal}`;
      const finalMessage = currentEmailMessageTemplate
        .replace(/\[Nombre del Estudiante\]/g, studentFullName)
        .replace(/\[Nombre Institucion\]/g, notifiedInstitutionName || "la institución asignada");
      console.log(`--- Para ${student.email} ---`);
      console.log(`Mensaje: ${finalMessage}`);
    });

    toast({
      title: "Notificaciones Programadas (Simulado)",
      description: `Correos para estudiantes de ${academicLevels.find(l=>l.id === selectedLevelId)?.name} programados para ${scheduledDateTime.toLocaleString('es-CL')}. Este es el último paso del flujo principal.`,
    });
  };

  const selectedStudentForPreview = allStudents.find(s => s.id === selectedStudentForPreviewId);
  const emailPreview = selectedStudentForPreview 
    ? currentEmailMessageTemplate
        .replace(/\[Nombre del Estudiante\]/g, `${selectedStudentForPreview.firstName} ${selectedStudentForPreview.lastNamePaternal}`)
        .replace(/\[Nombre Institucion\]/g, notifiedInstitutionName || "la institución asignada")
    : currentEmailMessageTemplate
        .replace(/\[Nombre del Estudiante\]/g, "(Nombre del Estudiante)")
        .replace(/\[Nombre Institucion\]/g, notifiedInstitutionName || "la institución asignada");


  if (isLoadingProgress) {
    return <div className="flex justify-center items-center h-64"><p>Cargando notificaciones a estudiantes...</p></div>;
  }
  
  return (
    <>
      <PageHeader
        title="Notificación a estudiantes seleccionados"
        description="Envía la confirmación a los alumnos que fueron asignados a la institución."
      />
      <form onSubmit={handleSendNotification}>
        <Card>
          <CardHeader>
            <CardTitle>Redactar y Programar Notificación por Nivel de Práctica</CardTitle>
            <CardDescription>
              Configure la fecha, hora y mensaje para todos los estudiantes de un nivel de práctica.
              Los estudiantes listados son aquellos confirmados en la etapa anterior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="institution-name">Institución Asignada</Label>
              <Input id="institution-name" value={notifiedInstitutionName} readOnly className="mt-1 bg-muted"/>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="level-select">Nivel de Práctica a Notificar</Label>
                <Select 
                    onValueChange={(value) => {
                        setSelectedLevelId(value);
                        // Reset preview student if level changes
                        setSelectedStudentForPreviewId(studentsInSelectedLevel.length > 0 ? studentsInSelectedLevel[0].id : ""); 
                    }} 
                    value={selectedLevelId}
                >
                  <SelectTrigger id="level-select">
                    <SelectValue placeholder="Elija un nivel de práctica" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicLevels.map(level => (
                      <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="student-preview-select">Alumno (para vista previa del correo)</Label>
                <Select 
                    onValueChange={setSelectedStudentForPreviewId} 
                    value={selectedStudentForPreviewId}
                    disabled={!selectedLevelId || studentsInSelectedLevel.length === 0}
                >
                  <SelectTrigger id="student-preview-select">
                    <SelectValue placeholder={studentsInSelectedLevel.length === 0 && selectedLevelId ? "No hay alumnos en este nivel" : "Elija un alumno para previsualizar"} />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsInSelectedLevel.map(student => (
                      <SelectItem key={student.id} value={student.id}>{student.firstName} {student.lastNamePaternal}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {!selectedLevelId && (
                 <Alert variant="default" className="bg-accent/10 border-accent/30">
                    <Info className="h-4 w-4 text-accent" />
                    <AlertTitle className="text-accent">Seleccione un Nivel de Práctica</AlertTitle>
                    <AlertDescription>
                        Por favor, elija un nivel de práctica para configurar su notificación.
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
                          fromDate={new Date()}
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
                        setCurrentScheduledTime(e.target.value);
                        updateProgrammingForLevel(selectedLevelId, { scheduledTime: e.target.value });
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
                        setCurrentEmailSubject(e.target.value);
                        updateProgrammingForLevel(selectedLevelId, { emailSubject: e.target.value });
                    }}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email-message-student">Plantilla de correo editable</Label>
                  <Textarea
                    id="email-message-student"
                    placeholder={DEFAULT_EMAIL_MESSAGE_TEMPLATE.replace("[Nombre Institucion]", notifiedInstitutionName || "la institución asignada")}
                    rows={8}
                    value={currentEmailMessageTemplate}
                    onChange={(e) => {
                        setCurrentEmailMessageTemplate(e.target.value);
                        updateProgrammingForLevel(selectedLevelId, { emailMessageTemplate: e.target.value });
                    }}
                    className="mt-1"
                    required
                  />
                   <p className="text-xs text-muted-foreground mt-1">
                    Marcadores disponibles: [Nombre del Estudiante], [Nombre Institucion].
                    {selectedStudentForPreview && ` Vista previa para: ${selectedStudentForPreview.firstName} ${selectedStudentForPreview.lastNamePaternal}.`}
                   </p>
                </div>
                <div>
                    <Label>Vista Previa del Mensaje (para {selectedStudentForPreview ? `${selectedStudentForPreview.firstName} ${selectedStudentForPreview.lastNamePaternal}`: "alumno seleccionado"})</Label>
                    <div className="mt-1 p-3 border rounded-md bg-muted min-h-[100px] text-sm whitespace-pre-wrap">
                        {emailPreview}
                    </div>
                </div>
              </>
            )}
            
            <Button 
                type="submit" 
                className="w-full md:w-auto"
                disabled={!selectedLevelId || studentsInSelectedLevel.length === 0 || !currentScheduledDate || isLoadingProgress}
            >
              <SendHorizonal className="mr-2 h-4 w-4" /> Programar Notificaciones para este Nivel
            </Button>
          </CardContent>
        </Card>
      </form>
    </>
  );
}

