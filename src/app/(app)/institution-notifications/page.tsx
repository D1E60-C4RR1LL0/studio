
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Textarea ya no se usa para el cuerpo del correo, pero podría ser necesario para otros campos si se reintroduce.
// import { Textarea } from "@/components/ui/textarea"; 
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

const formatDateForEmail = (date: Date | undefined, type: 'inicio' | 'termino'): string => {
  if (!date) return `Semana [Fecha ${type === 'inicio' ? 'Inicio' : 'Término'}]`;
  return `Semana ${format(date, "dd 'de' MMMM", { locale: es })}`;
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
  let studentTableRowsHTML = "";
  if (selectedStudentsForEmail.length > 0) {
    studentTableRowsHTML = selectedStudentsForEmail.map(student => {
      const fullName = `${student.firstName} ${student.lastNamePaternal} ${student.lastNameMaternal}`;
      return `<tr><td style="border: 1px solid #ddd; padding: 8px;">${fullName}</td><td style="border: 1px solid #ddd; padding: 8px;">${student.rut}</td><td style="border: 1px solid #ddd; padding: 8px;">${student.career}</td><td style="border: 1px solid #ddd; padding: 8px;">${student.practicumLevel}</td></tr>`;
    }).join("");
  } else {
    studentTableRowsHTML = `<tr><td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: center;">(No hay estudiantes seleccionados para esta notificación)</td></tr>`;
  }
  
  const studentListHTML = `
    <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; font-family: Arial, sans-serif; font-size: 10pt;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">NOMBRE COMPLETO</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">RUT</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">CARRERA</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">NIVEL PRÁCTICA</th>
        </tr>
      </thead>
      <tbody>
        ${studentTableRowsHTML}
      </tbody>
    </table>`;


  const profStartDateText = formatDateForEmail(profStartDate, 'inicio');
  const profEndDateText = formatDateForEmail(profEndDate, 'termino');
  const profWeeksText = profWeeks || "[Nº]";

  const otherStartDateText = formatDateForEmail(otherStartDate, 'inicio');
  const otherEndDateText = formatDateForEmail(otherEndDate, 'termino');
  const otherWeeksText = otherWeeks || "[Nº]";

  const practiceCalendarHTML = `
    <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; margin-bottom: 15px; font-family: Arial, sans-serif; font-size: 10pt;">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">NIVEL DE PRÁCTICA</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">FECHA INICIO</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">FECHA TÉRMINO</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Nº SEMANAS</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">P. PROFESIONAL</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${profStartDateText}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${profEndDateText}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${profWeeksText}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">PPV - PPIV - PPIII - PPII - PPI</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${otherStartDateText}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${otherEndDateText}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${otherWeeksText}</td>
        </tr>
      </tbody>
    </table>`;

  const documentationListHTML = `
    <p style="font-family: Arial, sans-serif; font-size: 10pt; margin-top: 15px;">Al iniciar su pasantía, cada estudiante deberá hacer entrega de su carpeta de práctica con documentación institucional y personal; la cual considera:</p>
    <ul style="font-family: Arial, sans-serif; font-size: 10pt;">
      <li>Certificado de Antecedentes</li>
      <li>Certificado de Inhabilidades para trabajar con menores de edad</li>
      <li>Certificado de Inhabilidades por maltrato relevante</li>
      <li>Horario universitario</li>
      <li>Otra documentación</li>
    </ul>`;
  
  let roleSalutation = "";
  if (contactRole && contactRole.trim() !== "") {
    roleSalutation = `en su calidad de ${contactRole} de `;
  }

  return `
    <div style="font-family: Arial, sans-serif; font-size: 10pt;">
      <p style="margin-bottom: 10px;">Estimado/a ${contactName || '[Nombre Contacto]'}${contactRole ? `, ${roleSalutation}${institutionName || '[Nombre Institución]'}` : (institutionName ? ` de ${institutionName || '[Nombre Institución]'}`: '')}.</p>
      <p style="margin-bottom: 15px;">Le saludo de manera cordial en nombre de la Unidad de Práctica Pedagógica (UPP) de la Facultad de Educación de la Universidad Católica de la Santísima Concepción, y presento a usted el inicio de las pasantías de estudiantes de Pedagogía de nuestra Facultad, de acuerdo con el siguiente calendario de prácticas UCSC primer semestre 2025:</p>
      ${practiceCalendarHTML}
      <p style="margin-top: 15px; margin-bottom: 5px;">Adjuntamos la lista de estudiantes propuestos para realizar su práctica en su establecimiento:</p>
      ${studentListHTML}
      ${documentationListHTML}
      <p style="margin-top: 20px;">Finalmente, como UPP agradecemos el espacio formativo otorgado por su comunidad educativa.</p>
      <p style="margin-top: 15px;">Se despide atentamente,<br />Equipo Unidad de Prácticas Pedagógicas UCSC</p>
    </div>
  `;
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
    const currentYear = new Date().getFullYear();
    try {
      const initialProfStart = parse(`10-03-${currentYear}`, 'dd-MM-yyyy', new Date());
      const initialProfEnd = parse(`16-06-${currentYear}`, 'dd-MM-yyyy', new Date());
      const initialOtherStart = parse(`17-03-${currentYear}`, 'dd-MM-yyyy', new Date());
      const initialOtherEnd = parse(`16-06-${currentYear}`, 'dd-MM-yyyy', new Date());

      setPracticeStartDateProf(initialProfStart);
      setPracticeEndDateProf(initialProfEnd);
      setPracticeStartDateOther(initialOtherStart);
      setPracticeEndDateOther(initialOtherEnd);

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
    setEmailBody(body); // This updates the state that will be used by dangerouslySetInnerHTML
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
    console.log("Cuerpo del Correo (HTML):", emailBody); 
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
                        {practiceStartDateProf ? format(practiceStartDateProf, "PPP", { locale: es }) : <span>Seleccione fecha</span>}
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
                        {practiceEndDateProf ? format(practiceEndDateProf, "PPP", { locale: es }) : <span>Seleccione fecha</span>}
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
                        {practiceStartDateOther ? format(practiceStartDateOther, "PPP", { locale: es }) : <span>Seleccione fecha</span>}
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
                        {practiceEndDateOther ? format(practiceEndDateOther, "PPP", { locale: es }) : <span>Seleccione fecha</span>}
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
                <CardDescription>Seleccione los estudiantes (previamente confirmados y asignados a la comuna de {selectedInstitution.location}) para incluir en esta notificación.</CardDescription>
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
                        <Label htmlFor="email-body-preview">Cuerpo del correo (Vista Previa)</Label>
                        <div
                          id="email-body-preview"
                          className="min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm overflow-auto"
                          dangerouslySetInnerHTML={{ __html: emailBody }}
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

    