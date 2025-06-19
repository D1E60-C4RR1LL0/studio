"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCommunes, updateCommune } from "@/lib/api/communes";
import { Commune } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { CommuneFormFields, communeFormSchema, type CommuneFormData } from "./commune-form-fields";
import { Search, Save, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function EditCommuneForm({ onCancel, onSave }: { onCancel: () => void; onSave: (commune: Commune) => void }) {
  const [communes, setCommunes] = React.useState<Commune[]>([]);
  const [searchInput, setSearchInput] = React.useState("");
  const [selectedCommune, setSelectedCommune] = React.useState<Commune | null>(null);
  const { toast } = useToast();

  const form = useForm<CommuneFormData>({
    resolver: zodResolver(communeFormSchema),
    defaultValues: {
      name: "",
    },
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCommunes();
        setCommunes(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las comunas.",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [toast]);

  const handleSearch = () => {
    const lowerSearchTerm = searchInput.toLowerCase();
    const foundCommune = communes.find(
      (c) => c.nombre.toLowerCase().includes(lowerSearchTerm)
    );
    if (foundCommune) {
      setSelectedCommune(foundCommune);
      form.reset({ name: foundCommune.nombre });
    } else {
      toast({
        title: "No encontrado",
        description: "No se encontró ninguna comuna con ese nombre.",
      });
    }
  };

  const handleSubmit = async (data: CommuneFormData) => {
    if (!selectedCommune) {
      toast({
        title: "Seleccione una comuna",
        description: "Busque y seleccione una comuna para editar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedCommune: Commune = {
        ...selectedCommune,
        nombre: data.name,
      };
    await updateCommune(updatedCommune.id, { nombre: data.name });
      toast({
        title: "Comuna actualizada",
        description: `${updatedCommune.nombre} ha sido actualizada.`,
      });
      onSave(updatedCommune);
      setSelectedCommune(null);
      setSearchInput("");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la comuna.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Editar comuna existente</CardTitle>
        <CardDescription>Busque una comuna por nombre, edítela y guarde los cambios.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Buscar comuna por nombre..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button type="button" onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" /> Buscar
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <CommuneFormFields form={form} />
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" /> Guardar cambios
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                <XCircle className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}