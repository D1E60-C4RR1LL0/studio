
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
import { Send } from "lucide-react";
import { useRouter } from 'next/navigation';
import { usePracticumProgress, STAGES, STAGE_PATHS } from '@/hooks/usePracticumProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


const generateEmailBodyTemplate = (
  contactName: string,
  contactRole: string,
  institutionName: string,
  selectedStudents: Student[]
): string => {
  const studentListItems = selectedStudents.map(student => 
    `  - ${student.firstName} ${student.lastNamePaternal} ${student.lastNameMaternal} (RUT: ${student.rut}, Carrera: ${student.career}, Nivel: ${student.practicumLevel})`
  ).join("\n");

  // Placeholder for practice calendar - replace with actual data if available
  const practiceCalendar = `NIVEL DE PRÁCTICA      FECHA INICIO        FECHA TÉRMINO      Nº SEMANAS
P. PROFESIONAL        Semana 10 de marzo   Semana 16 de junio   15
PPV - PPIV - PPIII - PPII - PPI  Semana 17 de marzo   Semana 16 de junio   14`;

  const documentationList = `Al iniciar su pasantía, cada estudiante deberá hacer entrega de su carpeta de práctica con documentación institucional y personal; la cual considera:
* Certificado de Antecedentes
* Certificado de Inhabilidades para trabajar con menores de edad
* Certificado de Inhabilidades por maltrato relevante
* Horario universitario
* Otra documentación`;

  return `Estimado/a ${contactName || '[Nombre Contacto]'}${contactRole ? `, en su calidad de ${contactRole}` : ''} de ${institutionName || '[Nombre Institución]'}.

Le saludo de manera cordial en nombre de la Unidad de Práctica Pedagógica (UPP) de la Facultad de Educación de la Universidad Católica de la Santísima Concepción, y presento a usted el inicio de las pasantías de estudiantes de Pedagogía de nuestra Facultad, de acuerdo con el siguiente calendario de prácticas UCSC primer semestre 2025:

${practiceCalendar}

Adjuntamos la lista de estudiantes propuestos para realizar su práctica en su establecimiento:
${studentListItems.length > 0 ? studentListItems : " (No hay estudiantes seleccionados para esta notificación)"}

${documentationList}

Finalmente, como UPP agradecemos el espacio formativo otorgado por su comunidad educativa.

Se despide atentamente,
Equipo Unidad de Prácticas Pedagógicas UCSC`;
};


export default function InstitutionNotificationsPage() {
  const [allInstitutions, setAllInstitutions] = React.useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = React.useState<Institution[]>([]);
  const [allStudents, setAllStudents] = React.useState<Student[]>([]);
  const [studentsForInstitution, setStudentsForInstitution] = React.useState<Student[]>([]);
  const [communes, setCommunes] = React.useState<Commune[]>([]);
  
  const [selectedCommuneId, setSelectedCommuneId] = React.useState<string>("");
  const [selectedInstitutionId, setSelectedInstitutionId] = React.useState<string>("");
  
  const [editableContactName, setEditableContactName] = React.useState("");
  const [editableContactRole, setEditableContactRole] = React.useState("");
  const [editableContactEmail, setEditableContactEmail] = React.useState("");

  const [selectedStudentsMap, setSelectedStudentsMap] = React.useState<Record<string, boolean>>({});
  const [emailSubject, setEmailSubject] = React.useState("Información Estudiantes de Práctica");
  const [emailBody, setEmailBody] = React.useState("");
  
  const { toast } = useToast();
  const router = useRouter();
  const { advanceStage, maxAccessLevel, isLoadingProgress } = usePracticumProgress();

  React.useEffect(() => {
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

        if (communeData.length > 0) {
          // setSelectedCommuneId(communeData[0].id); // Optionally pre-select first commune
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
    if (selectedCommuneId) {
      const commune = communes.find(c => c.id === selectedCommuneId);
      setFilteredInstitutions(allInstitutions.filter(inst => inst.location === commune?.name));
      setSelectedInstitutionId(""); // Reset institution when commune changes
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
      setStudentsForInstitution(allStudents.filter(s => s.location === selectedInstitution.name));
      setSelectedStudentsMap({}); // Reset student selection
    } else {
      setEditableContactName("");
      setEditableContactRole("");
      setEditableContactEmail("");
      setStudentsForInstitution([]);
      setSelectedStudentsMap({});
    }
  }, [selectedInstitution, allStudents]);

  React.useEffect(() => {
    const currentSelectedStudents = studentsForInstitution.filter(s => selectedStudentsMap[s.id]);
    const body = generateEmailBodyTemplate(
      editableContactName,
      editableContactRole,
      selectedInstitution?.name || "",
      currentSelectedStudents
    );
    setEmailBody(body);
  }, [selectedInstitution, editableContactName, editableContactRole, selectedStudentsMap, studentsForInstitution]);


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

    console.log("Enviando correo a:", editableContactEmail);
    console.log("Nombre Contacto:", editableContactName);
    console.log("Cargo Contacto:", editableContactRole);
    console.log("Institución:", selectedInstitution.name);
    console.log("Asunto:", emailSubject);
    console.log("Cuerpo del Correo:", emailBody);
    
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
                  <Input id="contact-name" value={editableContactName} onChange={(e) => setEditableContactName(e.target.value)} placeholder="Nombre del contacto"/>
                </div>
                <div>
                  <Label htmlFor="contact-role">Cargo del contacto</Label>
                  <Input id="contact-role" value={editableContactRole} onChange={(e) => setEditableContactRole(e.target.value)} placeholder="Ej: Director Académico"/>
                </div>
                <div>
                  <Label htmlFor="contact-email">Correo electrónico</Label>
                  <Input id="contact-email" type="email" value={editableContactEmail} onChange={(e) => setEditableContactEmail(e.target.value)} placeholder="correo@ejemplo.com"/>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {selectedInstitution && (
          <Card>
            <CardHeader>
                <CardTitle>Lista de estudiantes seleccionados</CardTitle>
                <CardDescription>Seleccione los estudiantes de {selectedInstitution.name} para incluir en esta notificación.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48 rounded-md border p-2">
                  {studentsForInstitution.length > 0 ? (
                    studentsForInstitution.map(student => (
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
                      No hay estudiantes asignados actualmente a {selectedInstitution.name} o que coincidan con los filtros.
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
                    <CardDescription>Revise y edite el contenido del correo si es necesario.</CardDescription>
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
                        rows={15}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        required
                        />
                    </div>
                </CardContent>
            </Card>
        )}

        <Button 
            type="submit" 
            className="w-full md:w-auto" 
            disabled={!selectedInstitution || Object.values(selectedStudentsMap).filter(Boolean).length === 0 || !emailSubject.trim() || !emailBody.trim() || isLoadingProgress || !editableContactEmail.trim() || !editableContactName.trim()}
        >
          <Send className="mr-2 h-4 w-4" /> Enviar correo al centro
        </Button>
      </form>
    </>
  );
}
