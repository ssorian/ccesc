"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import {
  createStudentSchema,
  type CreateStudentInput,
} from "@/features/students/types/schema";
import { useCreateStudent } from "@/features/students/hooks/useCreateStudent";
import { useGetCareers } from "@/features/careers/hooks/useCareers";
import { StudentStatus } from "@/prisma/generated";

// ... (imports se mantienen iguales)

export function CreateStudentDialog() {
  const [open, setOpen] = useState(false);
  const { data: careers, isLoading: isLoadingCareers } = useGetCareers({
    skip: 0,
    take: 100,
  });

  const form = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
      matricula: "",
      curp: "",
      currentSemester: 1,
      careerId: "",
      status: StudentStatus.REGULAR,
      birthDay: new Date(),
    },
  });

  const { mutate, isPending } = useCreateStudent();

  const onSubmit = (data: CreateStudentInput) => {
    mutate(data, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
        toast.success("Alumno creado correctamente");
      },
      onError: (error) => {
        toast.error(error.message || "Ocurrió un error al crear el alumno");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Alumno
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Alumno</DialogTitle>
          <DialogDescription>
            Ingresa los datos del nuevo alumno. Los campos con * son
            obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            {/* --- SECCIÓN AGREGADA: Nombre y Apellido --- */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="name">Nombre *</FieldLabel>
                <Input
                  id="name"
                  placeholder="Ej. Juan"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <FieldError>{form.formState.errors.name.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="lastName">Apellidos *</FieldLabel>
                <Input
                  id="lastName"
                  placeholder="Ej. Pérez"
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <FieldError>
                    {form.formState.errors.lastName.message}
                  </FieldError>
                )}
              </Field>
            </div>

            {/* --- SECCIÓN AGREGADA: Email y Password --- */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="email">Correo Electrónico *</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <FieldError>{form.formState.errors.email.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Contraseña *</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <FieldError>
                    {form.formState.errors.password.message}
                  </FieldError>
                )}
              </Field>
            </div>

            {/* --- SECCIÓN AGREGADA: Matrícula y CURP --- */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="matricula">Matrícula *</FieldLabel>
                <Input
                  id="matricula"
                  placeholder="Ej. 2023001"
                  {...form.register("matricula")}
                />
                {form.formState.errors.matricula && (
                  <FieldError>
                    {form.formState.errors.matricula.message}
                  </FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="curp">CURP *</FieldLabel>
                <Input
                  id="curp"
                  placeholder="AAAA000000..."
                  {...form.register("curp")}
                />
                {form.formState.errors.curp && (
                  <FieldError>{form.formState.errors.curp.message}</FieldError>
                )}
              </Field>
            </div>

            {/* --- Campos existentes --- */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="birthDay">
                  Fecha de nacimiento *
                </FieldLabel>
                <Input
                  id="birthDay"
                  type="date"
                  {...form.register("birthDay")}
                />
                {form.formState.errors.birthDay && (
                  <FieldError>
                    {form.formState.errors.birthDay.message}
                  </FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="currentSemester">
                  Semestre actual *
                </FieldLabel>
                <Select
                  value={form.watch("currentSemester").toString()}
                  onValueChange={(v) =>
                    form.setValue("currentSemester", parseInt(v))
                  }
                >
                  <SelectTrigger id="currentSemester">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        {sem}° Semestre
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="careerId">Carrera</FieldLabel>
              <Select
                value={form.watch("careerId") || ""}
                onValueChange={(value) => form.setValue("careerId", value)}
              >
                <SelectTrigger id="careerId">
                  <SelectValue
                    placeholder={
                      isLoadingCareers
                        ? "Cargando..."
                        : "Selecciona una carrera"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {careers?.map((career: any) => (
                    <SelectItem key={career.id} value={career.id}>
                      {career.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.careerId && (
                <FieldError>
                  {form.formState.errors.careerId.message}
                </FieldError>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear Alumno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
