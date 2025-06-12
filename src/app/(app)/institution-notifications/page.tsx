
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInstitutions, getStudents, getCommunes } from "@/lib/data";
import type { Institution, Student, Commune, DirectorContact } from "@/lib/definitions";
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
import { cn, textToHtmlWithPlaceholders } from "@/lib/utils";

const CONFIRMED_STUDENT_IDS_KEY = 'confirmedPracticumStudentIds';
const LAST_NOTIFIED_INSTITUTION_ID_KEY = 'lastNotifiedInstitutionId';
const LAST_NOTIFIED_INSTITUTION_NAME_KEY = 'lastNotifiedInstitutionName';
const LAST_NOTIFIED_INSTITUTION_CONTACT_ID_KEY = 'lastNotifiedInstitutionContactId';
const LAST_NOTIFIED_INSTITUTION_CONTACT_NAME_KEY = 'lastNotifiedInstitutionContactName';
const LAST_NOTIFIED_INSTITUTION_CONTACT_ROLE_KEY = 'lastNotifiedInstitutionContactRole';
const LAST_NOTIFIED_INSTITUTION_CONTACT_EMAIL_KEY = 'lastNotifiedInstitutionContactEmail';
const PRACTICUM_PROF_START_DATE_KEY = 'practicumProfStartDate';
const PRACTICUM_PROF_END_DATE_KEY = 'practicumProfEndDate';
const PRACTICUM_PROF_WEEKS_KEY = 'practicumProfWeeks';
const PRACTICUM_OTHER_START_DATE_KEY = 'practicumOtherStartDate';
const PRACTICUM_OTHER_END_DATE_KEY = 'practicumOtherEndDate';
const PRACTICUM_OTHER_WEEKS_KEY = 'practicumOtherWeeks';

const TEMPLATE_INSTITUTION_SUBJECT_KEY = "TEMPLATE_INSTITUTION_SUBJECT";
const TEMPLATE_INSTITUTION_BODY_HTML_KEY = "TEMPLATE_INSTITUTION_BODY_HTML"; 

const DEFAULT_INSTITUTION_SUBJECT = "Información Estudiantes de Práctica";
// DEFAULT_INSTITUTION_EMAIL_BODY_TEXT is now loaded from templates page default,
// which uses {{practiceCalendarHTML}} placeholder

const formatDateForEmail = (date: Date | undefined, type: 'inicio' | 'termino'): string => {
  if (!date) return `[Fecha ${type === 'inicio' ? 'Inicio' : 'Término'} Indefinida]`;
  const yearFormat = type === 'termino' ? " yyyy" : "";
  return `semana del ${format(date, `dd 'de' MMMM${yearFormat}`, { locale: es })}`;
};


const renderEmailBody = (
  templateBodyPlainText: string,
  contactName: string,
  contactRole: string,
  contactEmail: string,
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
      return `<tr><td>${fullName}</td><td>${student.rut}</td><td>${student.career}</td><td>${student.practicumLevel}</td></tr>`;
    }).join("");
  } else {
    studentTableRowsHTML = `<tr><td colspan="4" style="text-align: center;">(No hay estudiantes seleccionados para esta notificación)</td></tr>`;
  }
  
  const studentTableHTML = `
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 10px;">
      <thead>
        <tr>
          <th>NOMBRE COMPLETO</th>
          <th>RUT</th>
          <th>CARRERA</th>
          <th>NIVEL PRÁCTICA</th>
        </tr>
      </thead>
      <tbody>
        ${studentTableRowsHTML}
      </tbody>
    </table>`;

  const documentationListHTML = `
    <ul style="margin-top: 10px; margin-bottom: 10px; padding-left: 20px;">
      <li>Certificado de Antecedentes</li>
      <li>Certificado de Inhabilidades para trabajar con menores de edad</li>
      <li>Certificado de Inhabilidades por maltrato relevante</li>
      <li>Horario universitario</li>
      <li>Otra documentación</li>
    </ul>`;

  const practiceCalendarHTML = `
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
    </table>`;

  const htmlPlaceholders = {
    "{{practiceCalendarHTML}}": practiceCalendarHTML,
    "{{studentTableHTML}}": studentTableHTML,
    "{{documentationListHTML}}": documentationListHTML,
  };

  const textPlaceholders = {
    "{{directivo.nombre}}": contactName || '[Nombre Contacto]',
    "{{directivo.cargo}}": contactRole || '[Cargo Contacto]',
    "{{directivo.email}}": contactEmail || '[Email Contacto]',
    "{{nombre_establecimiento}}": institutionName || '[Nombre Institución]',
    "{{semana_inicio_profesional}}": formatDateForEmail(profStartDate, 'inicio'),
    "{{semana_termino_profesional}}": formatDateForEmail(profEndDate, 'termino'),
    "{{numero_semanas_profesional}}": profWeeks || '[Nº]',
    "{{semana_inicio_pp}}": formatDateForEmail(otherStartDate, 'inicio'),
    "{{semana_termino_pp}}": formatDateForEmail(otherEndDate, 'termino'),
    "{{numero_semanas_pp}}": otherWeeks || '[Nº]',
  };
  
  return textToHtmlWithPlaceholders(templateBodyPlainText, htmlPlaceholders, textPlaceholders);
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
  const [selectedContactId, setSelectedContactId] = React.useState<string>("");
  
  const [contactNameForDisplay, setContactNameForDisplay] = React.useState("");
  const [contactRoleForDisplay, setContactRoleForDisplay] = React.useState("");
  const [contactEmailForDisplay, setContactEmailForDisplay] = React.useState("");

  const [practiceStartDateProf, setPracticeStartDateProf] = React.useState<Date | undefined>();
  const [practiceEndDateProf, setPracticeEndDateProf] = React.useState<Date | undefined>();
  const [practiceWeeksProf, setPracticeWeeksProf] = React.useState<string>("15");
  const [practiceStartDateOther, setPracticeStartDateOther] = React.useState<Date | undefined>();
  const [practiceEndDateOther, setPracticeEndDateOther] = React.useState<Date | undefined>();
  const [practiceWeeksOther, setPracticeWeeksOther] = React.useState<string>("14");

  const [selectedStudentsMap, setSelectedStudentsMap] = React.useState<Record<string, boolean>>({});
  
  const [emailSubjectTemplate, setEmailSubjectTemplate] = React.useState(DEFAULT_INSTITUTION_SUBJECT);
  const [emailBodyPlainTextTemplate, setEmailBodyPlainTextTemplate] = React.useState(""); // Will be loaded from localStorage or a default
  const [currentRenderedEmailBody, setCurrentRenderedEmailBody] = React.useState("");
  
  const { toast } = useToast();
  const router = useRouter();
  const { advanceStage, maxAccessLevel, isLoadingProgress } = usePracticumProgress();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSubject = localStorage.getItem(TEMPLATE_INSTITUTION_SUBJECT_KEY);
      setEmailSubjectTemplate(storedSubject || DEFAULT_INSTITUTION_SUBJECT);
      
      const storedBody = localStorage.getItem(TEMPLATE_INSTITUTION_BODY_HTML_KEY);
      // A minimal default if nothing is in local storage or from templates page.
      const fallbackDefaultBody = `Estimado/a {{directivo.nombre}},\n\nConsulte los detalles:\n{{practiceCalendarHTML}}\n{{studentTableHTML}}\n{{documentationListHTML}}\n\nSaludos.`.trim();
      setEmailBodyPlainTextTemplate(storedBody || fallbackDefaultBody);
    }

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
      if (typeof window !== 'undefined') {
        try {
          const storedIds = localStorage.getItem(CONFIRMED_STUDENT_IDS_KEY);
          if (storedIds) {
            const parsedIds = JSON.parse(storedIds);
             if (Array.isArray(parsedIds)) {
              setConfirmedStage1StudentIds(parsedIds);
            } else {
              setConfirmedStage1StudentIds([]); 
            }
          } else {
             setConfirmedStage1StudentIds([]); 
          }
        } catch (error) {
          toast({
            title: "Error al leer selección previa",
            description: "No se pudieron cargar los estudiantes seleccionados de la etapa anterior.",
            variant: "destructive",
          });
          setConfirmedStage1StudentIds([]); 
        }
      }
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
      setSelectedContactId("");
    } else {
      setFilteredInstitutions([]);
      setSelectedInstitutionId("");
      setSelectedContactId("");
    }
  }, [selectedCommuneId, allInstitutions, communes]);

  const selectedInstitution = React.useMemo(() => {
    return allInstitutions.find(inst => inst.id === selectedInstitutionId);
  }, [selectedInstitutionId, allInstitutions]);

  React.useEffect(() => {
    if (selectedInstitution) {
      if (selectedInstitution.directorContacts && selectedInstitution.directorContacts.length > 0) {
        const lastContactId = typeof window !== 'undefined' ? localStorage.getItem(LAST_NOTIFIED_INSTITUTION_CONTACT_ID_KEY) : null;
        const defaultContact = selectedInstitution.directorContacts.find(c => c.id === lastContactId) || selectedInstitution.directorContacts[0];
        setSelectedContactId(defaultContact.id);
      } else {
        setSelectedContactId("");
        setContactNameForDisplay("");
        setContactRoleForDisplay("");
        setContactEmailForDisplay("");
      }
      setStudentsForInstitutionCheckboxes(studentsAvailableFromStage1);
      setSelectedStudentsMap({});
    } else {
      setSelectedContactId("");
      setContactNameForDisplay("");
      setContactRoleForDisplay("");
      setContactEmailForDisplay("");
      setStudentsForInstitutionCheckboxes([]);
      setSelectedStudentsMap({});
    }
  }, [selectedInstitution, studentsAvailableFromStage1]); 

  React.useEffect(() => {
    if (selectedInstitution && selectedContactId) {
        const contact = selectedInstitution.directorContacts?.find(c => c.id === selectedContactId);
        if (contact) {
            setContactNameForDisplay(contact.name);
            setContactRoleForDisplay(contact.role || "");
            setContactEmailForDisplay(contact.email);
        } else {
            setContactNameForDisplay("");
            setContactRoleForDisplay("");
            setContactEmailForDisplay("");
        }
    } else if (!selectedContactId) {
        setContactNameForDisplay("");
        setContactRoleForDisplay("");
        setContactEmailForDisplay("");
    }
  }, [selectedContactId, selectedInstitution]);


  React.useEffect(() => {
    const currentSelectedStudentsForEmail = studentsForInstitutionCheckboxes.filter(s => selectedStudentsMap[s.id]);
    const body = renderEmailBody(
      emailBodyPlainTextTemplate, 
      contactNameForDisplay,
      contactRoleForDisplay,
      contactEmailForDisplay,
      selectedInstitution?.name || "",
      currentSelectedStudentsForEmail,
      practiceStartDateProf,
      practiceEndDateProf,
      practiceWeeksProf,
      practiceStartDateOther,
      practiceEndDateOther,
      practiceWeeksOther
    );
    setCurrentRenderedEmailBody(body);
  }, [
      selectedInstitution, 
      contactNameForDisplay, 
      contactRoleForDisplay,
      contactEmailForDisplay, 
      selectedStudentsMap, 
      studentsForInstitutionCheckboxes,
      practiceStartDateProf,
      practiceEndDateProf,
      practiceWeeksProf,
      practiceStartDateOther,
      practiceEndDateOther,
      practiceWeeksOther,
      emailBodyPlainTextTemplate
    ]);


  const handleStudentSelect = (studentId: string, checked: boolean) => {
    setSelectedStudentsMap(prev => ({ ...prev, [studentId]: checked }));
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const numSelectedStudents = Object.values(selectedStudentsMap).filter(Boolean).length;
    const selectedContact = selectedInstitution?.directorContacts?.find(c => c.id === selectedContactId);

    if (!selectedInstitution || numSelectedStudents === 0) {
      toast({
        title: "Información faltante",
        description: "Por favor, seleccione una comuna, institución y al menos un estudiante.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedContact) {
        toast({
            title: "Contacto no seleccionado",
            description: "Por favor, seleccione un contacto de la institución.",
            variant: "destructive",
        });
        return;
    }
    if (!emailSubjectTemplate.trim() || !currentRenderedEmailBody.trim()) {
      toast({
        title: "Correo incompleto",
        description: "Por favor, complete el asunto y el cuerpo del mensaje (la plantilla podría estar vacía).",
        variant: "destructive",
      });
      return;
    }
    if (!contactNameForDisplay.trim() || !contactEmailForDisplay.trim()) {
        toast({
            title: "Detalles de contacto incompletos",
            description: "El contacto seleccionado no tiene nombre o correo electrónico.",
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
    const studentIdsToPass = studentsActuallySelected.map(s => s.id);

    if (typeof window !== 'undefined') {
        localStorage.setItem(CONFIRMED_STUDENT_IDS_KEY, JSON.stringify(studentIdsToPass));
        localStorage.setItem(LAST_NOTIFIED_INSTITUTION_ID_KEY, selectedInstitution.id);
        localStorage.setItem(LAST_NOTIFIED_INSTITUTION_NAME_KEY, selectedInstitution.name);
        localStorage.setItem(LAST_NOTIFIED_INSTITUTION_CONTACT_ID_KEY, selectedContact.id);
        localStorage.setItem(LAST_NOTIFIED_INSTITUTION_CONTACT_NAME_KEY, selectedContact.name);
        localStorage.setItem(LAST_NOTIFIED_INSTITUTION_CONTACT_ROLE_KEY, selectedContact.role || "");
        localStorage.setItem(LAST_NOTIFIED_INSTITUTION_CONTACT_EMAIL_KEY, selectedContact.email);
        if (practiceStartDateProf) localStorage.setItem(PRACTICUM_PROF_START_DATE_KEY, practiceStartDateProf.toISOString());
        if (practiceEndDateProf) localStorage.setItem(PRACTICUM_PROF_END_DATE_KEY, practiceEndDateProf.toISOString());
        if (practiceWeeksProf) localStorage.setItem(PRACTICUM_PROF_WEEKS_KEY, practiceWeeksProf);
        if (practiceStartDateOther) localStorage.setItem(PRACTICUM_OTHER_START_DATE_KEY, practiceStartDateOther.toISOString());
        if (practiceEndDateOther) localStorage.setItem(PRACTICUM_OTHER_END_DATE_KEY, practiceEndDateOther.toISOString());
        if (practiceWeeksOther) localStorage.setItem(PRACTICUM_OTHER_WEEKS_KEY, practiceWeeksOther);
    }

    console.log("Enviando correo a:", contactEmailForDisplay);
    console.log("Nombre Contacto:", contactNameForDisplay);
    console.log("Cargo Contacto:", contactRoleForDisplay);
    console.log("Institución:", selectedInstitution.name);
    console.log("Asunto:", emailSubjectTemplate); 
    console.log("Cuerpo del Correo (HTML Renderizado):", currentRenderedEmailBody); 
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
                           !emailSubjectTemplate.trim() || 
                           !currentRenderedEmailBody.trim() || 
                           isLoadingProgress || 
                           !selectedContactId ||
                           !contactEmailForDisplay.trim() || 
                           !contactNameForDisplay.trim() ||
                           !practiceStartDateProf || !practiceEndDateProf || !practiceWeeksProf.trim() ||
                           !practiceStartDateOther || !practiceEndDateOther || !practiceWeeksOther.trim();


  return (
    <div className="p-4 md:p-6"> 
      <PageHeader
        title="Notificación al centro de práctica"
        description="Envía un correo electrónico a las instituciones educativas con la lista de estudiantes seleccionados."
      />
      <form onSubmit={handleSendNotification} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Institución y Contacto</CardTitle>
            <CardDescription>Seleccione la comuna, la institución y el contacto. El cargo y correo se autocompletarán.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="commune-select">Comuna (de la Institución)</Label>
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
                  <Label htmlFor="contact-select">Contacto</Label>
                  <Select 
                    onValueChange={setSelectedContactId} 
                    value={selectedContactId} 
                    disabled={!selectedInstitution || !selectedInstitution.directorContacts || selectedInstitution.directorContacts.length === 0}
                  >
                    <SelectTrigger id="contact-select">
                      <SelectValue placeholder={selectedInstitution.directorContacts?.length > 0 ? "Seleccione un contacto" : "No hay contactos"} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedInstitution.directorContacts?.map((contact: DirectorContact) => (
                        <SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contact-role">Cargo del contacto</Label>
                  <Input id="contact-role" value={contactRoleForDisplay} placeholder="Cargo (autocompletado)" readOnly className="bg-muted/50"/>
                </div>
                <div>
                  <Label htmlFor="contact-email">Correo electrónico</Label>
                  <Input id="contact-email" type="email" value={contactEmailForDisplay} placeholder="Correo (autocompletado)" readOnly className="bg-muted/50"/>
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
                <CardTitle>Estudiantes a notificar para {selectedInstitution.name}</CardTitle>
                <CardDescription>
                  De la lista de estudiantes confirmados en la etapa anterior, seleccione aquellos que serán asignados a {selectedInstitution.name}. Estos son los estudiantes que se incluirán en esta notificación y estarán disponibles en la siguiente etapa.
                </CardDescription>
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
                          {student.firstName} {student.lastNamePaternal} ({student.career}, {student.practicumLevel}, vive en: {student.commune || 'N/A'})
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-2">
                      No hay estudiantes confirmados de la etapa anterior para asignar, o no se han cargado los datos. Asegúrese de haber confirmado estudiantes en el paso anterior.
                    </p>
                  )}
                </ScrollArea>
            </CardContent>
          </Card>
        )}

        {selectedInstitution && Object.values(selectedStudentsMap).filter(Boolean).length > 0 && selectedContactId && (
            <Card>
                <CardHeader>
                    <CardTitle>Previsualización del correo</CardTitle>
                    <CardDescription>Revise el contenido del correo. Este se basa en la plantilla de texto plano guardada (o la plantilla por defecto si no se ha personalizado) y se convierte a HTML.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="email-subject-preview">Asunto del correo (Vista Previa)</Label>
                        <Input 
                        id="email-subject-preview" 
                        value={emailSubjectTemplate} 
                        readOnly
                        className="bg-muted/50"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email-body-preview">Cuerpo del correo (Vista Previa Renderizada)</Label>
                        <div
                          id="email-body-preview"
                          className="min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm overflow-auto"
                          dangerouslySetInnerHTML={{ __html: currentRenderedEmailBody }}
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
          <Send className="mr-2 h-4 w-4" /> Enviar correo al centro y pasar a notificar estudiantes
        </Button>
      </form>
    </div>
  );
}

