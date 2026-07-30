"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { channelSchema } from "@/lib/validation/channel";
import type { ChannelFormValues } from "@/lib/validation/channel";

type ChannelFormProps = {
  defaultName?: string;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (values: ChannelFormValues, reset: () => void) => void;
};

export function ChannelForm({
  defaultName = "",
  isSubmitting,
  submitLabel,
  onCancel,
  onSubmit,
}: ChannelFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: defaultName,
    },
  });

  useEffect(() => {
    reset({ name: defaultName });
  }, [defaultName, reset]);

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values, reset))} className="space-y-3">
      <div>
        <Input placeholder="Channel name" maxLength={50} {...register("name")} className="w-full" />
        {errors.name?.message ? <p className="mt-1 text-xs text-[#cc2f4a]">{errors.name.message}</p> : null}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button disabled={isSubmitting}>{isSubmitting ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}
