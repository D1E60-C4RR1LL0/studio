
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/rich-text-editor"; 
import { useToast } from "@/hooks/use-toast";
import { Save, ListChecks } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Placeholder {
  key: string;
  description: string;
}

interface TemplateEditorProps {
  templateTypeTitle: string;
  templateKeySubject: string;
  templateKeyBodyHtml: string;
  defaultSubject: string;
  defaultBodyHtml: string;
  placeholders: Placeholder[];
}

export function TemplateEditor({
  templateTypeTitle,
  templateKeySubject,
  templateKeyBodyHtml,
  defaultSubject,
  defaultBodyHtml,
  placeholders,
}: TemplateEditorProps) {
  const [subject, setSubject] = React.useState(defaultSubject);
  const [bodyHtml, setBodyHtml] = React.useState(defaultBodyHtml);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSubject = localStorage.getItem(templateKeySubject);
      const storedBody = localStorage.getItem(templateKeyBodyHtml);
      if (storedSubject !== null) setSubject(storedSubject);
      if (storedBody !== null) setBodyHtml(storedBody);
    }
    setIsLoading(false);
  }, [templateKeySubject, templateKeyBodyHtml]);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(templateKeySubject, subject);
      localStorage.setItem(templateKeyBodyHtml, bodyHtml);
      toast({
        title: "Plantilla Guardada",
        description: `La ${templateTypeTitle.toLowerCase()} ha sido guardada exitosamente.`,
      });
    }
  };
  
  if (isLoading) {
      return (
        <Card className="shadow-lg mt-4">
          <CardHeader>
            <CardTitle>{templateTypeTitle}</CardTitle>
            <CardDescription>Cargando editor de plantilla...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <p>Cargando...</p>
            </div>
          </CardContent>
        </Card>
      )
  }

  return (
    <Card className="shadow-lg mt-4">
      <CardHeader>
        <CardTitle>{templateTypeTitle}</CardTitle>
        <CardDescription>
          Modifique el asunto y el cuerpo del correo. Los cambios se guardarán localmente en su navegador.
          Utilice los placeholders listados abajo para insertar datos dinámicos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor={`subject-${templateKeySubject}`}>Asunto del Correo</Label>
          <Input
            id={`subject-${templateKeySubject}`}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={`body-${templateKeyBodyHtml}`}>Cuerpo del Correo (HTML)</Label>
          <RichTextEditor
            value={bodyHtml}
            onChange={setBodyHtml}
            className="mt-1 min-h-[300px]"
          />
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center">
                    <ListChecks className="mr-2 h-5 w-5" />
                    Placeholders Disponibles
                </CardTitle>
                <CardDescription>Estos textos se reemplazarán con datos reales al enviar el correo.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-40">
                    <ul className="space-y-2 text-sm">
                        {placeholders.map(p => (
                            <li key={p.key}>
                                <code className="font-mono bg-muted px-1 py-0.5 rounded text-primary">{p.key}</code>: {p.description}
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </CardContent>
        </Card>

        <div className="flex justify-start pt-2">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Guardar Plantilla
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
