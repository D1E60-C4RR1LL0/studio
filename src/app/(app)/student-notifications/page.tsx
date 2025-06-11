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
import { cn } from "@/lib/utils";
import { getStudents, getAcademicLevels } from "@/lib/data";
import type { Student, AcademicLevel } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";

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

  React.useEffect(() => {
    async function loadData() {
      try {
        const [studentData, levelData] = await Promise.all([getStudents(), getAcademicLevels()]);
        setStudents(studentData);
        setAcademicLevels(levelData);
      } catch (error) {
         toast({
          title: "Error loading data",
          description: "Could not load students or academic levels.",
          variant: "destructive",
        });
      }
    }
    loadData();
  }, [toast]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedLevelId || !emailSubject || !emailMessage || !scheduledDate) {
       toast({
        title: "Missing Information",
        description: "Please fill all required fields including student, level, message, and schedule.",
        variant: "destructive",
      });
      return;
    }

    const scheduledDateTime = new Date(scheduledDate);
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes);
    
    console.log("Sending email to:", selectedStudent.email);
    console.log("Subject:", emailSubject);
    console.log("Message:", emailMessage);
    console.log("Scheduled for:", scheduledDateTime.toLocaleString());

    toast({
      title: "Notification Scheduled (Simulated)",
      description: `Email for ${selectedStudent.name} scheduled for ${scheduledDateTime.toLocaleString()}.`,
    });

    // Reset form
    setSelectedStudentId("");
    setSelectedLevelId("");
    setEmailSubject("");
    setEmailMessage("");
    setScheduledDate(undefined);
    setScheduledTime("09:00");
  };

  return (
    <>
      <PageHeader
        title="Student Notifications"
        description="Customize and schedule email notifications for students."
      />
      <form onSubmit={handleSendNotification}>
        <Card>
          <CardHeader>
            <CardTitle>Compose & Schedule Notification</CardTitle>
            <CardDescription>Select a student, academic level, customize the message, and set a sending schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="student-select">Select Student</Label>
                <Select onValueChange={setSelectedStudentId} value={selectedStudentId}>
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>{student.name} ({student.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level-select">Select Academic Level</Label>
                <Select onValueChange={setSelectedLevelId} value={selectedLevelId}>
                  <SelectTrigger id="level-select">
                    <SelectValue placeholder="Choose an academic level" />
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
              <Label htmlFor="email-subject-student">Email Subject</Label>
              <Input 
                id="email-subject-student" 
                placeholder="Regarding your Practicum Assignment" 
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email-message-student">Customize Email Message</Label>
              <Textarea
                id="email-message-student"
                placeholder="Dear [Student Name],\n\nThis email contains important information about your upcoming practicum..."
                rows={8}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                required
              />
              {selectedStudent && <p className="text-xs text-muted-foreground mt-1">Available placeholder: [Student Name] will be replaced with "{selectedStudent.name}".</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="schedule-date">Schedule Date</Label>
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
                      {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="schedule-time">Schedule Time</Label>
                <Input 
                  id="schedule-time" 
                  type="time" 
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full md:w-auto">
              <SendHorizonal className="mr-2 h-4 w-4" /> Schedule Notification
            </Button>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
