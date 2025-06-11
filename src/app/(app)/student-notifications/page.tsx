
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
import { CalendarIcon, SendHorizonal } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getStudents, getAcademicLevels } from "@/lib/data";
import type { Student, AcademicLevel } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { usePracticumProgress, STAGES, STAGE_PATHS } from '@/hooks/usePracticumProgress';

export default function StudentNotificationsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [academicLevels, setAcademicLevels] = React.useState<AcademicLevel[]>([]);
  
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>("");
  const [selectedLevelId, setSelectedLevelId] = React.useState<string>("");
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailMessage, setEmailMessage] = React.useState("");
  const [scheduledDate, setScheduledDate] = React.useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = React.useState<string>("09:00");

  const { toast } = useToast();
  const router = useRouter(); // Not strictly needed for redirection TO this page if hook handles it
  const { maxAccessLevel, isLoadingProgress } = usePracticumProgress();


  React.useEffect(() => {
    if (!isLoadingProgress && maxAccessLevel < STAGES.STUDENT_NOTIFICATION) {
      // This will be handled by the hook's global redirect.
      // router.replace(STAGE_PATHS[STAGES.INSTITUTION_NOTIFICATION]); 
    }
  }, [maxAccessLevel, isLoadingProgress, router]);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [studentData, levelData] = await Promise.all([getStudents(), getAcademicLevels()]);
        setStudents(studentData);
        setAcademicLevels(levelData);
      } catch (error) {
         toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar estudiantes o niveles académicos.",
          variant: "destructive",
        });
      }
    }
    if (!isLoadingProgress && maxAccessLevel >= STAGES.STUDENT_NOTIFICATION) {
      loadData();
    }
  }, [toast, isLoadingProgress, maxAccessLevel]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedLevelId || !emailSubject || !emailMessage || !scheduledDate) {
       toast({
        title: "Información Faltante",
        description: "Por favor complete todos los campos requeridos incluyendo estudiante, nivel, mensaje y horario.",
        variant: "destructive",
      });
      return;
    }

    const scheduledDateTime = new Date(scheduledDate);
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes);
    
    const finalMessage = emailMessage.replace(/\[Nombre del Estudiante\]/g, selectedStudent.name);

    console.log("Enviando correo a:", selectedStudent.email);
    console.log("Asunto:", emailSubject);
    console.log("Mensaje:", finalMessage);
    console.log("Programado para:", scheduledDateTime.toLocaleString('es-CL'));

    toast({
      title: "Notificación Programada (Simulado)",
      description: `Correo para ${selectedStudent.name} programado para ${scheduledDateTime.toLocaleString('es-CL')}. Este es el último paso.`,
    });

    setSelectedStudentId("");
    setSelectedLevelId("");
    setEmailSubject("");
    setEmailMessage("");
    setScheduledDate(undefined);
    setScheduledTime("09:00");
    // No advanceStage or router.push needed here as it's the last step in this flow.
  };

  if (isLoadingProgress) {
    return <div className="flex justify-center items-center h-64"><p>Cargando notificaciones a estudiantes...</p></div>;
  }
  // The hook handles redirection if access is not granted.

  return (
    <>
      <PageHeader
        title="Notificaciones a Estudiantes"
        description="Personalizar y programar notificaciones por correo electrónico para estudiantes."
      />
      <form onSubmit={handleSendNotification}>
        <Card>
          <CardHeader>
            <CardTitle>Redactar y Programar Notificación</CardTitle>
            <CardDescription>Seleccione un estudiante, nivel académico, personalice el mensaje y establezca un horario de envío.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="student-select">Seleccionar Estudiante</Label>
                <Select onValueChange={setSelectedStudentId} value={selectedStudentId}>
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="Elija un estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>{student.firstName} {student.lastNamePaternal} ({student.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level-select">Seleccionar Nivel Académico</Label>
                <Select onValueChange={setSelectedLevelId} value={selectedLevelId}>
                  <SelectTrigger id="level-select">
                    <SelectValue placeholder="Elija un nivel académico" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicLevels.map(level => (
                      <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="email-subject-student">Asunto del Correo</Label>
              <Input 
                id="email-subject-student" 
                placeholder="Respecto a su Asignación de Práctica" 
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email-message-student">Personalizar Mensaje del Correo</Label>
              <Textarea
                id="email-message-student"
                placeholder="Estimado/a [Nombre del Estudiante],\n\nEste correo contiene información importante sobre su próxima práctica..."
                rows={8}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                required
              />
              {selectedStudent && <p className="text-xs text-muted-foreground mt-1">Marcador disponible: [Nombre del Estudiante] será reemplazado por "{selectedStudent.firstName} {selectedStudent.lastNamePaternal}".</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="schedule-date">Fecha de Programación</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="schedule-date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP", { locale: es }) : <span>Elija una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                      locale={es}
                      fromDate={new Date()} // Prevent selecting past dates
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="schedule-time">Hora de Programación</Label>
                <Input 
                  id="schedule-time" 
                  type="time" 
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <Button 
                type="submit" 
                className="w-full md:w-auto"
                disabled={!selectedStudent || !selectedLevelId || !emailSubject.trim() || !emailMessage.trim() || !scheduledDate || isLoadingProgress}
            >
              <SendHorizonal className="mr-2 h-4 w-4" /> Programar Notificación
            </Button>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
