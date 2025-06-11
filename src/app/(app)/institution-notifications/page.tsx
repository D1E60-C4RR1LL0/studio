
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInstitutions, getStudents, getCommunes } from "@/lib/data";
import type { Institution, Student, Commune } from "@/lib/definitions";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, CalendarIcon } from "lucide-react";
import { useRouter } from 'next/navigation';
import { usePracticumProgress, STAGES, STAGE_PATHS } from '@/hooks/usePracticumProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const CONFIRMED_STUDENT_IDS_KEY = 'confirmedPracticumStudentIds';

const formatDateForEmail = (date: Date | undefined): string => {
  if (!date) return '[Fecha no especificada]';
  // Format to "10 de marzo" style for the email body
  return format(date, "dd 'de' MMMM", { locale: es });
};

const generateEmailBodyTemplate = (
  contactName: string,
  contactRole: string,
  institutionName: string,
  selectedStudentsForEmail: Student[],
  profStartDate?: Date,
  profEndDate?: Date,
  profWeeks?: string,
  otherStartDate?: Date,
  otherEndDate?: Date,
  otherWeeks?: string
): string => {
  const studentListItems = selectedStudentsForEmail.map(student => {
    const fullName = `${student.firstName} ${student.lastNamePaternal} ${student.lastNameMaternal}`;
    return `${student.rut.padEnd(18)} ${fullName.padEnd(40)} ${student.career.padEnd(30)} ${student.practicumLevel.padEnd(20)}`;
  }).join("\n");
  
  const studentListHeader = `${"RUT".padEnd(18)} ${"NOMBRE COMPLETO".padEnd(40)} ${"CARRERA".padEnd(30)} ${"NIVEL PRÁCTICA".padEnd(20)}`;
  const studentListSeparator = "-".repeat(studentListHeader.length > 0 ? studentListHeader.split('\n')[0].length : 100);


  const calendarHeader = `${"NIVEL DE PRÁCTICA".padEnd(30)} ${"FECHA INICIO".padEnd(25)} ${"FECHA TÉRMINO".padEnd(25)} ${"Nº SEMANAS"}`;
  const calendarSeparator = "-".repeat(calendarHeader.length);

  const profStartDateText = profStartDate ? `Semana ${formatDateForEmail(profStartDate)}` : "Semana [Fecha Inicio]";
  const profEndDateText = profEndDate ? `Semana ${formatDateForEmail(profEndDate)}` : "Semana [Fecha Término]";
  const profWeeksText = profWeeks || "[Nº]";

  const otherStartDateText = otherStartDate ? `Semana ${formatDateForEmail(otherStartDate)}` : "Semana [Fecha Inicio]";
  const otherEndDateText = otherEndDate ? `Semana ${formatDateForEmail(otherEndDate)}` : "Semana [Fecha Término]";
  const otherWeeksText = otherWeeks || "[Nº]";

  const practiceCalendar = `
${calendarHeader}
${calendarSeparator}
${"P. PROFESIONAL".padEnd(30)} ${profStartDateText.padEnd(25)} ${profEndDateText.padEnd(25)} ${profWeeksText}
${"PPV - PPIV - PPIII - PPII - PPI".padEnd(30)} ${otherStartDateText.padEnd(25)} ${otherEndDateText.padEnd(25)} ${otherWeeksText}
  `.trim();

  const documentationList = `Al iniciar su pasantía, cada estudiante deberá hacer entrega de su carpeta de práctica con documentación institucional y personal; la cual considera:
* Certificado de Antecedentes
* Certificado de Inhabilidades para trabajar con menores de edad
* Certificado de Inhabilidades por maltrato relevante
* Horario universitario
* Otra documentación`;
  
  let roleSalutation = "";
  if (contactRole && contactRole.trim() !== "") {
    roleSalutation = `en su calidad de ${contactRole} de `;
  }

  return `Estimado/a ${contactName || '[Nombre Contacto]'}${contactRole ? `, ${roleSalutation}${institutionName || '[Nombre Institución]'}` : (institutionName ? ` de ${institutionName || '[Nombre Institución]'}`: '')}.

Le saludo de manera cordial en nombre de la Unidad de Práctica Pedagógica (UPP) de la Facultad de Educación de la Universidad Católica de la Santísima Concepción, y presento a usted el inicio de las pasantías de estudiantes de Pedagogía de nuestra Facultad, de acuerdo con el siguiente calendario de prácticas UCSC primer semestre 2025:

${practiceCalendar}

Adjuntamos la lista de estudiantes propuestos para realizar su práctica en su establecimiento:
${studentListItems.length > 0 ? `${studentListHeader}\n${studentListSeparator}\n${studentListItems}` : " (No hay estudiantes seleccionados para esta notificación)"}

${documentationList}

Finalmente, como UPP agradecemos el espacio formativo otorgado por su comunidad educativa.

Se despide atentamente,
Equipo Unidad de Prácticas Pedagógicas UCSC`;
};


export default function InstitutionNotificationsPage() {
  const [allInstitutions, setAllInstitutions] = React.useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = React.useState<Institution[]>([]);
  
  const [allStudents, setAllStudents] = React.useState<Student[]>([]);
  const [confirmedStage1StudentIds, setConfirmedStage1StudentIds] = React.useState<string[]>([]);
  const [studentsAvailableFromStage1, setStudentsAvailableFromStage1] = React.useState<Student[]>([]);
  const [studentsForInstitutionCheckboxes, setStudentsForInstitutionCheckboxes] = React.useState<Student[]>([]);
  
  const [communes, setCommunes] = React.useState<Commune[]>([]);
  
  const [selectedCommuneId, setSelectedCommuneId] = React.useState<string>("");
  const [selectedInstitutionId, setSelectedInstitutionId] = React.useState<string>("");
  
  const [editableContactName, setEditableContactName] = React.useState("");
  const [editableContactRole, setEditableContactRole] = React.useState("");
  const [editableContactEmail, setEditableContactEmail] = React.useState("");

  // State for practice calendar details
  const [practiceStartDateProf, setPracticeStartDateProf] = React.useState<Date | undefined>();
  const [practiceEndDateProf, setPracticeEndDateProf] = React.useState<Date | undefined>();
  const [practiceWeeksProf, setPracticeWeeksProf] = React.useState<string>("15");
  const [practiceStartDateOther, setPracticeStartDateOther] = React.useState<Date | undefined>();
  const [practiceEndDateOther, setPracticeEndDateOther] = React.useState<Date | undefined>();
  const [practiceWeeksOther, setPracticeWeeksOther] = React.useState<string>("14");


  const [selectedStudentsMap, setSelectedStudentsMap] = React.useState<Record<string, boolean>>({});
  const [emailSubject, setEmailSubject] = React.useState("Información Estudiantes de Práctica");
  const [emailBody, setEmailBody] = React.useState("");
  
  const { toast } = useToast();
  const router = useRouter();
  const { advanceStage, maxAccessLevel, isLoadingProgress } = usePracticumProgress();

  React.useEffect(() => {
    // Try to set initial dates based on "Semana 10 de marzo" logic, assuming current year for simplicity
    // This is a rough approximation for placeholders
    const currentYear = new Date().getFullYear();
    try {
      setPracticeStartDateProf(parse(`10-03-${currentYear}`, 'dd-MM-yyyy', new Date()));
      setPracticeEndDateProf(parse(`16-06-${currentYear}`, 'dd-MM-yyyy', new Date()));
      setPracticeStartDateOther(parse(`17-03-${currentYear}`, 'dd-MM-yyyy', new Date()));
      setPracticeEndDateOther(parse(`16-06-${currentYear}`, 'dd-MM-yyyy', new Date()));
    } catch (error) {
      console.warn("Could not parse initial dates for practice calendar.", error)
    }

    async function loadInitialData() {
      try {
        const [communeData, instData, studentData] = await Promise.all([
          getCommunes(),
          getInstitutions(),
          getStudents()
        ]);
        setCommunes(communeData);
        setAllInstitutions(instData);
        setAllStudents(studentData);

        if (typeof window !== 'undefined') {
            const storedIds = localStorage.getItem(CONFIRMED_STUDENT_IDS_KEY);
            if (storedIds) {
                setConfirmedStage1StudentIds(JSON.parse(storedIds));
            }
        }
      } catch (error) {
        toast({
          title: "Error al cargar datos iniciales",
          description: "No se pudieron cargar comunas, instituciones o estudiantes.",
          variant: "destructive",
        });
      }
    }
    if (!isLoadingProgress && maxAccessLevel >= STAGES.INSTITUTION_NOTIFICATION) {
      loadInitialData();
    }
  }, [toast, isLoadingProgress, maxAccessLevel]);

  React.useEffect(() => {
    if (allStudents.length > 0 && confirmedStage1StudentIds.length > 0) {
        const confirmedSet = new Set(confirmedStage1StudentIds);
        setStudentsAvailableFromStage1(allStudents.filter(s => confirmedSet.has(s.id)));
    } else if (allStudents.length > 0 && confirmedStage1StudentIds.length === 0) {
        setStudentsAvailableFromStage1([]);
    }
  }, [allStudents, confirmedStage1StudentIds]);


  React.useEffect(() => {
    if (selectedCommuneId) {
      const commune = communes.find(c => c.id === selectedCommuneId);
      setFilteredInstitutions(allInstitutions.filter(inst => inst.location === commune?.name));
      setSelectedInstitutionId(""); 
    } else {
      setFilteredInstitutions([]);
      setSelectedInstitutionId("");
    }
  }, [selectedCommuneId, allInstitutions, communes]);

  const selectedInstitution = React.useMemo(() => {
    return allInstitutions.find(inst => inst.id === selectedInstitutionId);
  }, [selectedInstitutionId, allInstitutions]);

  React.useEffect(() => {
    if (selectedInstitution) {
      setEditableContactName(selectedInstitution.contactName || "");
      setEditableContactRole(selectedInstitution.contactRole || "");
      setEditableContactEmail(selectedInstitution.contactEmail || "");
      setStudentsForInstitutionCheckboxes(studentsAvailableFromStage1.filter(s => s.location === selectedInstitution.location));
      setSelectedStudentsMap({});
    } else {
      setEditableContactName("");
      setEditableContactRole("");
      setEditableContactEmail("");
      setStudentsForInstitutionCheckboxes([]);
      setSelectedStudentsMap({});
    }
  }, [selectedInstitution, studentsAvailableFromStage1]);

  React.useEffect(() => {
    const currentSelectedStudentsForEmail = studentsForInstitutionCheckboxes.filter(s => selectedStudentsMap[s.id]);
    const body = generateEmailBodyTemplate(
      editableContactName,
      editableContactRole,
      selectedInstitution?.name || "",
      currentSelectedStudentsForEmail,
      practiceStartDateProf,
      practiceEndDateProf,
      practiceWeeksProf,
      practiceStartDateOther,
      practiceEndDateOther,
      practiceWeeksOther
    );
    setEmailBody(body);
  }, [
      selectedInstitution, 
      editableContactName, 
      editableContactRole, 
      selectedStudentsMap, 
      studentsForInstitutionCheckboxes,
      practiceStartDateProf,
      practiceEndDateProf,
      practiceWeeksProf,
      practiceStartDateOther,
      practiceEndDateOther,
      practiceWeeksOther
    ]);


  const handleStudentSelect = (studentId: string, checked: boolean) => {
    setSelectedStudentsMap(prev => ({ ...prev, [studentId]: checked }));
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const numSelectedStudents = Object.values(selectedStudentsMap).filter(Boolean).length;

    if (!selectedInstitution || numSelectedStudents === 0) {
      toast({
        title: "Información faltante",
        description: "Por favor, seleccione una comuna, institución y al menos un estudiante.",
        variant: "destructive",
      });
      return;
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: "Correo incompleto",
        description: "Por favor, complete el asunto y el cuerpo del mensaje.",
        variant: "destructive",
      });
      return;
    }
    if (!editableContactName.trim() || !editableContactEmail.trim()) {
        toast({
            title: "Detalles de contacto incompletos",
            description: "Por favor, complete el nombre y correo del contacto.",
            variant: "destructive",
        });
        return;
    }
    if (!practiceStartDateProf || !practiceEndDateProf || !practiceWeeksProf.trim() ||
        !practiceStartDateOther || !practiceEndDateOther || !practiceWeeksOther.trim()) {
      toast({
        title: "Detalles del calendario incompletos",
        description: "Por favor, complete todos los campos del calendario de práctica.",
        variant: "destructive",
      });
      return;
    }


    const studentsActuallySelected = studentsForInstitutionCheckboxes.filter(s => selectedStudentsMap[s.id]);

    console.log("Enviando correo a:", editableContactEmail);
    console.log("Nombre Contacto:", editableContactName);
    console.log("Cargo Contacto:", editableContactRole);
    console.log("Institución:", selectedInstitution.name);
    console.log("Asunto:", emailSubject);
    console.log("Cuerpo del Correo:", emailBody);
    console.log("Estudiantes seleccionados para este correo:", studentsActuallySelected.map(s => s.firstName));
    
    toast({
      title: "Notificación Enviada (Simulado)",
      description: `Correo preparado para ${selectedInstitution.name}. Avanzando al siguiente paso.`,
    });
    
    advanceStage(STAGES.STUDENT_NOTIFICATION);
    router.push(STAGE_PATHS[STAGES.STUDENT_NOTIFICATION]);
  };

  if (isLoadingProgress) {
    return <div className="flex justify-center items-center h-64"><p>Cargando notificaciones a instituciones...</p></div>;
  }

  const isSubmitDisabled = !selectedInstitution || 
                           Object.values(selectedStudentsMap).filter(Boolean).length === 0 || 
                           !emailSubject.trim() || 
                           !emailBody.trim() || 
                           isLoadingProgress || 
                           !editableContactEmail.trim() || 
                           !editableContactName.trim() ||
                           !practiceStartDateProf || !practiceEndDateProf || !practiceWeeksProf.trim() ||
                           !practiceStartDateOther || !practiceEndDateOther || !practiceWeeksOther.trim();


  return (
    <>
      <PageHeader
        title="Notificación al centro de práctica"
        description="Envía un correo electrónico a las instituciones educativas con la lista de estudiantes seleccionados."
      />
      <form onSubmit={handleSendNotification} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Institución y Contacto</CardTitle>
            <CardDescription>Seleccione la comuna y la institución. Puede editar los detalles del contacto si es necesario.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commune-select">Comuna</Label>
                <Select onValueChange={setSelectedCommuneId} value={selectedCommuneId}>
                  <SelectTrigger id="commune-select">
                    <SelectValue placeholder="Seleccione una comuna" />
                  </SelectTrigger>
                  <SelectContent>
                    {communes.map(com => (
                      <SelectItem key={com.id} value={com.id}>{com.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="institution-select">Institución</Label>
                <Select onValueChange={setSelectedInstitutionId} value={selectedInstitutionId} disabled={!selectedCommuneId || filteredInstitutions.length === 0}>
                  <SelectTrigger id="institution-select">
                    <SelectValue placeholder={!selectedCommuneId ? "Seleccione una comuna primero" : "Seleccione una institución"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredInstitutions.map(inst => (
                      <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedInstitution && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div>
                  <Label htmlFor="contact-name">Contacto</Label>
                  <Input id="contact-name" value={editableContactName} onChange={(e) => setEditableContactName(e.target.value)} placeholder="Nombre del contacto" required/>
                </div>
                <div>
                  <Label htmlFor="contact-role">Cargo del contacto</Label>
                  <Input id="contact-role" value={editableContactRole} onChange={(e) => setEditableContactRole(e.target.value)} placeholder="Ej: Director Académico"/>
                </div>
                <div>
                  <Label htmlFor="contact-email">Correo electrónico</Label>
                  <Input id="contact-email" type="email" value={editableContactEmail} onChange={(e) => setEditableContactEmail(e.target.value)} placeholder="correo@ejemplo.com" required/>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del Calendario de Práctica</CardTitle>
            <CardDescription>Define las fechas y duración de los periodos de práctica. Estos valores se reflejarán en la plantilla de correo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2 text-sm">Práctica Profesional</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prof-start-date">Fecha Inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="prof-start-date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !practiceStartDateProf && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {practiceStartDateProf ? format(practiceStartDateProf, "PPP", { locale: es }) : <span>Semana 10 de marzo</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={practiceStartDateProf} onSelect={setPracticeStartDateProf} initialFocus locale={es} /></PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="prof-end-date">Fecha Término</Label>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button id="prof-end-date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !practiceEndDateProf && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {practiceEndDateProf ? format(practiceEndDateProf, "PPP", { locale: es }) : <span>Semana 16 de junio</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={practiceEndDateProf} onSelect={setPracticeEndDateProf} initialFocus locale={es} fromDate={practiceStartDateProf} /></PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="prof-weeks">Nº Semanas</Label>
                  <Input id="prof-weeks" type="number" value={practiceWeeksProf} onChange={e => setPracticeWeeksProf(e.target.value)} placeholder="Ej: 15" required/>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-sm">Otros Niveles (PPV - PPIV - PPIII - PPII - PPI)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="other-start-date">Fecha Inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="other-start-date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !practiceStartDateOther && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {practiceStartDateOther ? format(practiceStartDateOther, "PPP", { locale: es }) : <span>Semana 17 de marzo</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={practiceStartDateOther} onSelect={setPracticeStartDateOther} initialFocus locale={es} /></PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="other-end-date">Fecha Término</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="other-end-date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !practiceEndDateOther && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {practiceEndDateOther ? format(practiceEndDateOther, "PPP", { locale: es }) : <span>Semana 16 de junio</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={practiceEndDateOther} onSelect={setPracticeEndDateOther} initialFocus locale={es} fromDate={practiceStartDateOther} /></PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="other-weeks">Nº Semanas</Label>
                  <Input id="other-weeks" type="number" value={practiceWeeksOther} onChange={e => setPracticeWeeksOther(e.target.value)} placeholder="Ej: 14" required/>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {selectedInstitution && (
          <Card>
            <CardHeader>
                <CardTitle>Lista de estudiantes seleccionados para {selectedInstitution.name}</CardTitle>
                <CardDescription>Seleccione los estudiantes (previamente confirmados y asignados a esta ubicación) para incluir en esta notificación.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48 rounded-md border p-2">
                  {studentsForInstitutionCheckboxes.length > 0 ? (
                    studentsForInstitutionCheckboxes.map(student => (
                      <div key={student.id} className="flex items-center space-x-2 p-1.5">
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={selectedStudentsMap[student.id] || false}
                          onCheckedChange={(checked) => handleStudentSelect(student.id, Boolean(checked))}
                        />
                        <label
                          htmlFor={`student-${student.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {student.firstName} {student.lastNamePaternal} ({student.career}, {student.practicumLevel})
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-2">
                      No hay estudiantes confirmados de la etapa anterior asignados a la comuna de {selectedInstitution.location}, o no se han cargado los datos.
                    </p>
                  )}
                </ScrollArea>
            </CardContent>
          </Card>
        )}

        {selectedInstitution && Object.values(selectedStudentsMap).filter(Boolean).length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Plantilla de correo editable</CardTitle>
                    <CardDescription>Revise y edite el contenido del correo si es necesario. La información del calendario y estudiantes se actualizará automáticamente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="email-subject">Asunto del correo</Label>
                        <Input 
                        id="email-subject" 
                        placeholder="Información Estudiantes de Práctica" 
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        required
                        />
                    </div>
                    <div>
                        <Label htmlFor="email-body">Cuerpo del correo</Label>
                        <Textarea
                        id="email-body"
                        rows={25}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="font-mono text-xs whitespace-pre-wrap" // Suggest monospace for table alignment
                        required
                        />
                    </div>
                </CardContent>
            </Card>
        )}

        <Button 
            type="submit" 
            className="w-full md:w-auto" 
            disabled={isSubmitDisabled}
        >
          <Send className="mr-2 h-4 w-4" /> Enviar correo al centro
        </Button>
      </form>
    </>
  );
}

