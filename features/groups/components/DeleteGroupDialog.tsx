"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteGroupById } from "@/features/groups/hooks/useDeleteGroupById";

interface DeleteGroupDialogProps {
  group: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
}

export function DeleteGroupDialog({
  group,
  open,
  onOpenChange,
}: DeleteGroupDialogProps) {
  const { mutate, isPending } = useDeleteGroupById();

  const handleDelete = () => {
    mutate({ id: group.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Grupo</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el grupo{" "}
            <span className="font-semibold">{group.name}</span>?
          </DialogDescription>
          <DialogDescription className="text-destructive">
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
