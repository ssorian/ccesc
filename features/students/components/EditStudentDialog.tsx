"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  updateStudentSchema,
  type UpdateStudentInput,
} from "@/features/students/types/schema";

import { StudentStatus } from "@/lib/types";
import { useUpdateStudent } from "@/features/students/hooks/useUpdateStudent";
import { useGetCareers } from "@/features/careers/hooks/useCareers";

interface EditStudentDialogProps {
  student: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStudentDialog({
  student,
  open,
  onOpenChange,
}: EditStudentDialogProps) {
  const { data: careersResult } = useGetCareers({ skip: 0, take: 100 }); // Fetch all careers for dropdown

  const careers = careersResult || [];

  const form = useForm<UpdateStudentInput>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: {
      id: student.id,
      name: student.user.name,
      lastName: student.user.lastName,
      email: student.user.email,
      matricula: student.matricula,
      curp: student.curp,
      birthDay: new Date(student.birthDay),
      status: student.status,
      careerId: student.careerId,
      currentSemester: student.currentSemester,
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        id: student.id,
        name: student.user.name,
        lastName: student.user.lastName,
        email: student.user.email,
        matricula: student.matricula,
        curp: student.curp,
        birthDay: new Date(student.birthDay),
        status: student.status,
        careerId: student.careerId,
        currentSemester: student.currentSemester,
      });
    }
  }, [student, form]);

  const { mutate, isPending } = useUpdateStudent();

  const onSubmit = (data: UpdateStudentInput) => {
    mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Alumno</DialogTitle>
          <DialogDescription>
            Modifica los datos del alumno. Los campos marcados con * son
            obligatorios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="py-4">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="name">Nombre *</FieldLabel>
                <Input
                  id="name"
                  placeholder="Juan"
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
                  placeholder="Pérez García"
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <FieldError>
                    {form.formState.errors.lastName.message}
                  </FieldError>
                )}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico *</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="alumno@correo.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <FieldError>{form.formState.errors.email.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="matricula">Matrícula *</FieldLabel>
                <Input
                  id="matricula"
                  placeholder="2024001"
                  {...form.register("matricula")}
                />
                {form.formState.errors.matricula && (
                  <FieldError>
                    {form.formState.errors.matricula.message}
                  </FieldError>
                )}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="curp">CURP *</FieldLabel>
                <Input
                  id="curp"
                  placeholder="XXXX000000XXXXXX00"
                  maxLength={18}
                  {...form.register("curp")}
                />
                {form.formState.errors.curp && (
                  <FieldError>{form.formState.errors.curp.message}</FieldError>
                )}
              </Field>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="currentSemester">
                  Semestre actual *
                </FieldLabel>
                <Select
                  value={form.watch("currentSemester")?.toString()}
                  onValueChange={(value) =>
                    form.setValue("currentSemester", parseInt(value))
                  }
                >
                  <SelectTrigger id="currentSemester">
                    <SelectValue placeholder="Selecciona semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        {sem}° Semestre
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.currentSemester && (
                  <FieldError>
                    {form.formState.errors.currentSemester.message}
                  </FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="status">Estado *</FieldLabel>
                <Select
                  value={form.watch("status") || StudentStatus.REGULAR}
                  onValueChange={(value) =>
                    form.setValue("status", value as StudentStatus)
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StudentStatus.REGULAR}>
                      Regular
                    </SelectItem>
                    <SelectItem value={StudentStatus.EXTRAORDINARIO}>
                      Extraordinario
                    </SelectItem>
                    <SelectItem value={StudentStatus.BAJA}>Baja</SelectItem>
                    <SelectItem value={StudentStatus.BAJA_TEMPORAL}>
                      Baja Temporal
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <FieldError>
                    {form.formState.errors.status.message}
                  </FieldError>
                )}
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="careerId">Carrera</FieldLabel>
              <Select
                value={form.watch("careerId") || ""}
                onValueChange={(value) =>
                  form.setValue("careerId", value || null)
                }
              >
                <SelectTrigger id="careerId">
                  <SelectValue placeholder="Selecciona una carrera" />
                </SelectTrigger>
                <SelectContent>
                  {careers.map((career: any) => (
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
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Actualizando..." : "Actualizar Alumno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
