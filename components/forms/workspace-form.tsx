"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { workspaceSchema } from "@/lib/validation/workspace";
import type { WorkspaceFormValues } from "@/lib/validation/workspace";

type WorkspaceFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: WorkspaceFormValues, reset: () => void) => void;
};

export function WorkspaceForm({ isSubmitting, onSubmit }: WorkspaceFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values, reset))} className="flex gap-2 max-sm:flex-col">
      <div className="flex-1">
        <Input placeholder="New workspace name" maxLength={50} {...register("name")} className="w-full" />
        {errors.name?.message ? <p className="mt-1 text-xs text-[#cc2f4a]">{errors.name.message}</p> : null}
      </div>
      <Button disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create workspace"}
      </Button>
    </form>
  );
}
