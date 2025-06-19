
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Institution, DirectorContact, Cupo, AcademicLevel } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InstitutionFormFields, institutionFormSchema, type InstitutionFormData } from "./institution-form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInstitutionsFromAPI } from "@/lib/api/institutions";
import { getCupos, saveCupo } from "@/lib/api/cupos";
import { useToast } from "@/hooks/use-toast";
import { Save, Search, XCircle } from "lucide-react";
import { getAcademicLevels } from '@/lib/api/academic-levels';

interface EditInstitutionFormProps {
  onSave: (institution: Institution) => Promise<void>;
  onCancel: () => void;
}

export function EditInstitutionForm({ onSave, onCancel }: EditInstitutionFormProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentInstitution, setCurrentInstitution] = React.useState<Institution | null>(null);
  const [isLoadingInstitution, setIsLoadingInstitution] = React.useState(false);
  const [institutionNotFound, setInstitutionNotFound] = React.useState(false);
  const [nivelesPractica, getAcademicLevels] = React.useState<AcademicLevel[]>();
  const [cupos, setCupos] = React.useState<Cupo[]>([]);
  const [cantidad, setCantidad] = React.useState(0);
  const [nivelPracticaId, setNivelPracticaId] = React.useState<AcademicLevel | null>(null);

  const { toast } = useToast();
  const form = useForm<InstitutionFormData>({ resolver: zodResolver(institutionFormSchema) });

  const fetchFilteredCupos = async (institutionId: string) => {
    try {
      const all = await getCupos();
      const filtered = all.filter(c => c.establecimiento_id === institutionId);
      setCupos(filtered);
    } catch (error) {
      toast({ title: "Error al cargar cupos", description: "No se pudieron obtener los cupos.", variant: "destructive" });
    }
  };

  const handleSaveCupo = async () => {
    if (!currentInstitution || !nivelPracticaId || cantidad <= 0) {
      toast({ title: "Datos incompletos", description: "Complete todos los campos para guardar.", variant: "destructive" });
      return;
    }
    try {
      await saveCupo({
        establecimiento_id: currentInstitution.id!,
        nivel_practica_id: nivelPracticaId.id,
        carrera_id: nivelPracticaId.carrera_id, // <-- Agregado
        cantidad,
      }); await fetchFilteredCupos(currentInstitution.id!);
      setCantidad(0);
      toast({ title: "Cupo asignado correctamente." });
    } catch {
      toast({ title: "Error al guardar", description: "No se pudo guardar el cupo.", variant: "destructive" });
    }
  };

  const handleSearchInstitution = async () => {
    if (!searchTerm.trim()) {
      toast({ title: "Ingrese un RBD o nombre para buscar.", variant: "destructive" });
      return;
    }
    setIsLoadingInstitution(true);
    setCurrentInstitution(null);
    form.reset();

    try {
      const allInstitutions = await getInstitutionsFromAPI();
      const term = searchTerm.toLowerCase().trim();
      const found = allInstitutions.find(i => i.rbd.toLowerCase() === term || i.nombre.toLowerCase().includes(term));

      if (found) {
        setCurrentInstitution(found);
        form.reset({
          rbd: found.rbd,
          name: found.nombre,
          dependency: found.dependencia,
          comuna_id: found.comuna_id.toString(),
          directorContacts: found.directivos || [],
        });
        fetchFilteredCupos(found.id!);
        setInstitutionNotFound(false);
      } else {
        setInstitutionNotFound(true);
      }
    } catch {
      toast({ title: "Error", description: "No se pudo buscar la institución.", variant: "destructive" });
    } finally {
      setIsLoadingInstitution(false);
    }
  };

  const onSubmit = async (data: InstitutionFormData) => {
    if (!currentInstitution) return;
    console.log(data);
    const institutionToSave: Institution = {
      ...currentInstitution,
      rbd: data.rbd,
      nombre: data.name,
      dependencia: data.dependency,
      comuna_id: data.comuna_id,
      directivos: data.directorContacts.map(c => ({
        id: c.id || `new-${Date.now()}`,
        nombre: c.name,
        email: c.email,
        telefono: c.phone,
        cargo: c.contactRole,
      })),
    };
    await onSave(institutionToSave);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Editar Establecimiento</CardTitle>
        <CardDescription>Busque por RBD o nombre para editar.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
          <Label>Buscar Establecimiento</Label>
          <div className="flex gap-2">
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Button onClick={handleSearchInstitution}><Search className="mr-2 h-4 w-4" />Buscar</Button>
          </div>
        </div>

        {institutionNotFound && <p className="text-sm text-red-500">Institución no encontrada</p>}

        {currentInstitution && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <InstitutionFormFields form={form} />

              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-semibold mb-2">Asignar Cupos</h4>
                <div className="flex gap-4 items-end mb-4">
                  <div className="flex flex-col gap-1">
                    <Label>Nivel Práctica</Label>
                    <select
                      value={nivelPracticaId ? nivelPracticaId.id : ""}
                      onChange={(e) => {
                        const selected = nivelesPractica?.find(n => n.id === e.target.value) || null;
                        setNivelPracticaId(selected);
                      }}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Seleccione nivel</option>
                      {nivelesPractica?.map(nivel => (
                        <option key={nivel.id} value={nivel.id}>{nivel.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Cantidad</Label>
                    <Input type="number" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value))} />
                  </div>
                  <Button onClick={handleSaveCupo}>Asignar</Button>
                </div>
                <table className="w-full text-sm border">
                  <thead><tr><th className="text-left p-2">Nivel</th><th className="text-left p-2">Cantidad</th></tr></thead>
                  <tbody>
                    {cupos.map(cupo => (
                      <tr key={cupo.id} className="border-t">
                        <td className="p-2">{cupo.nivel_practica?.nombre || `#${cupo.nivel_practica_id}`}</td>
                        <td className="p-2">{cupo.cantidad}</td>
                      </tr>
                    ))}
                    {cupos.length === 0 && <tr><td colSpan={2} className="italic p-2 text-muted-foreground">Sin cupos asignados</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-green-500 text-white"><Save className="mr-2 h-4 w-4" />Guardar</Button>
                <Button type="button" variant="outline" onClick={onCancel}><XCircle className="mr-2 h-4 w-4" />Cancelar</Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
