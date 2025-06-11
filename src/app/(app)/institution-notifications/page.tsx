
"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInstitutions, getStudents } from "@/lib/data";
import type { Institution, Student } from "@/lib/definitions";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export default function InstitutionNotificationsPage() {
  const [institutions, setInstitutions] = React.useState<Institution[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedInstitution, setSelectedInstitution] = React.useState<Institution | null>(null);
  const [selectedStudents, setSelectedStudents] = React.useState<Record<string, boolean>>({});
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailBody, setEmailBody] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    async function loadData() {
      try {
        const [instData, studentData] = await Promise.all([getInstitutions(), getStudents()]);
        setInstitutions(instData);
        setStudents(studentData);
        if (instData.length > 0) {
          setSelectedInstitution(instData[0]); 
        }
      } catch (error) {
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar las instituciones o estudiantes.",
          variant: "destructive",
        });
      }
    }
    loadData();
  }, [toast]);

  const handleInstitutionChange = (institutionId: string) => {
    const inst = institutions.find(i => i.id === institutionId);
    setSelectedInstitution(inst || null);
    setSelectedStudents({}); // Reset student selection when institution changes
  };

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    setSelectedStudents(prev => ({ ...prev, [studentId]: checked }));
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitution || Object.values(selectedStudents).filter(Boolean).length === 0) {
      toast({
        title: "Información faltante",
        description: "Por favor, seleccione una institución y al menos un estudiante.",
        variant: "destructive",
      });
      return;
    }

    const studentsForEmail = students
      .filter(s => selectedStudents[s.id])
      .map(s => `- ${s.name} (${s.career}, ${s.practicumLevel})`)
      .join("\n");

    const finalEmailBody = `Estimado/a ${selectedInstitution.contactName},\n\n${emailBody}\n\nA continuación, la lista de estudiantes para la práctica:\n${studentsForEmail}\n\nAtentamente,\nEquipo de Gestión de Prácticas`;
    
    console.log("Enviando correo a:", selectedInstitution.contactEmail);
    console.log("Asunto:", emailSubject);
    console.log("Cuerpo:", finalEmailBody);

    toast({
      title: "Notificación Enviada (Simulado)",
      description: `Correo preparado para ${selectedInstitution.name}.`,
    });
    // Reset form or parts of it
    setSelectedStudents({});
    setEmailSubject("");
    setEmailBody("");
  };


  return (
    <>
      <PageHeader
        title="Notificaciones a Instituciones"
        description="Redactar y enviar notificaciones a las instituciones de práctica."
      />
      <form onSubmit={handleSendNotification}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Institución y Contacto</CardTitle>
              <CardDescription>Seleccione una institución y verifique los detalles de contacto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="institution-select">Institución</Label>
                <Select onValueChange={handleInstitutionChange} value={selectedInstitution?.id || ""}>
                  <SelectTrigger id="institution-select">
                    <SelectValue placeholder="Seleccione una institución" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map(inst => (
                      <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedInstitution && (
                <>
                  <div>
                    <Label htmlFor="contact-name">Nombre de Contacto</Label>
                    <Input id="contact-name" value={selectedInstitution.contactName} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Correo de Contacto</Label>
                    <Input id="contact-email" type="email" value={selectedInstitution.contactEmail} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="contact-phone">Teléfono de Contacto (Opcional)</Label>
                    <Input id="contact-phone" value={selectedInstitution.contactPhone || ""} readOnly />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Redactar Correo</CardTitle>
              <CardDescription>Seleccione estudiantes y escriba su mensaje.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email-subject">Asunto</Label>
                <Input 
                  id="email-subject" 
                  placeholder="Información Estudiantes de Práctica" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email-body">Cuerpo del Mensaje</Label>
                <Textarea
                  id="email-body"
                  placeholder="Ingrese su mensaje principal aquí. La lista de estudiantes se adjuntará automáticamente."
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Seleccionar Estudiantes para esta Institución ({selectedInstitution?.name || 'N/A'})</Label>
                <ScrollArea className="h-48 rounded-md border p-2 mt-1">
                  {selectedInstitution && students.filter(s => s.location === selectedInstitution?.name).length > 0 ? (
                    students.filter(s => s.location === selectedInstitution?.name).map(student => (
                      <div key={student.id} className="flex items-center space-x-2 p-1.5">
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={selectedStudents[student.id] || false}
                          onCheckedChange={(checked) => handleStudentSelect(student.id, Boolean(checked))}
                        />
                        <label
                          htmlFor={`student-${student.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {student.name} ({student.career})
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-2">No hay estudiantes asignados actualmente a {selectedInstitution?.name || 'la institución seleccionada'}.</p>
                  )}
                </ScrollArea>
              </div>
              <Button type="submit" className="w-full md:w-auto" disabled={!selectedInstitution}>
                <Send className="mr-2 h-4 w-4" /> Enviar Notificación
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
}
