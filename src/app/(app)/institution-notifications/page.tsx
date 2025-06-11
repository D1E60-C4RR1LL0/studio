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
          setSelectedInstitution(instData[0]); // Select first institution by default
        }
      } catch (error) {
        toast({
          title: "Error loading data",
          description: "Could not load institutions or students.",
          variant: "destructive",
        });
      }
    }
    loadData();
  }, [toast]);

  const handleInstitutionChange = (institutionId: string) => {
    const inst = institutions.find(i => i.id === institutionId);
    setSelectedInstitution(inst || null);
  };

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    setSelectedStudents(prev => ({ ...prev, [studentId]: checked }));
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitution || Object.values(selectedStudents).filter(Boolean).length === 0) {
      toast({
        title: "Missing information",
        description: "Please select an institution and at least one student.",
        variant: "destructive",
      });
      return;
    }

    const studentsForEmail = students
      .filter(s => selectedStudents[s.id])
      .map(s => `- ${s.name} (${s.career}, ${s.practicumLevel})`)
      .join("\n");

    const finalEmailBody = `Dear ${selectedInstitution.contactName},\n\n${emailBody}\n\nPlease find below the list of students for the practicum:\n${studentsForEmail}\n\nSincerely,\nPracticum Management Team`;
    
    console.log("Sending email to:", selectedInstitution.contactEmail);
    console.log("Subject:", emailSubject);
    console.log("Body:", finalEmailBody);

    toast({
      title: "Notification Sent (Simulated)",
      description: `Email prepared for ${selectedInstitution.name}.`,
    });
    // Reset form or parts of it
    setSelectedStudents({});
    setEmailSubject("");
    setEmailBody("");
  };


  return (
    <>
      <PageHeader
        title="Institution Notifications"
        description="Compose and send notifications to practicum institutions."
      />
      <form onSubmit={handleSendNotification}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Institution & Contact</CardTitle>
              <CardDescription>Select an institution and verify contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="institution-select">Institution</Label>
                <Select onValueChange={handleInstitutionChange} value={selectedInstitution?.id || ""}>
                  <SelectTrigger id="institution-select">
                    <SelectValue placeholder="Select an institution" />
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
                    <Label htmlFor="contact-name">Contact Name</Label>
                    <Input id="contact-name" value={selectedInstitution.contactName} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input id="contact-email" type="email" value={selectedInstitution.contactEmail} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="contact-phone">Contact Phone (Optional)</Label>
                    <Input id="contact-phone" value={selectedInstitution.contactPhone || ""} readOnly />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
              <CardDescription>Select students and write your message.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email-subject">Subject</Label>
                <Input 
                  id="email-subject" 
                  placeholder="Practicum Student Information" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email-body">Message Body</Label>
                <Textarea
                  id="email-body"
                  placeholder="Enter your main message here. The student list will be appended automatically."
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Select Students for this Institution ({selectedInstitution?.name || 'N/A'})</Label>
                <ScrollArea className="h-48 rounded-md border p-2 mt-1">
                  {students.filter(s => s.location === selectedInstitution?.name).length > 0 ? (
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
                    <p className="text-sm text-muted-foreground p-2">No students currently assigned to {selectedInstitution?.name || 'the selected institution'}.</p>
                  )}
                </ScrollArea>
              </div>
              <Button type="submit" className="w-full md:w-auto" disabled={!selectedInstitution}>
                <Send className="mr-2 h-4 w-4" /> Send Notification
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
}
