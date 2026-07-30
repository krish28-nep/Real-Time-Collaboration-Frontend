"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { registerUser } from "@/lib/api/users";
import { getApiErrorMessage } from "@/lib/axios";
import { registerSchema } from "@/lib/validation/auth";
import type { RegisterFormValues } from "@/lib/validation/auth";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Account created", { description: "You can login now." });
      router.push("/login");
    },
    onError: (error) => {
      toast.error("Registration failed", { description: getApiErrorMessage(error) });
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => registerMutation.mutate(values))} className="space-y-4">
      <FieldError message={errors.username?.message}>
        <Input placeholder="Username" {...register("username")} className="w-full" />
      </FieldError>
      <FieldError message={errors.email?.message}>
        <Input type="email" placeholder="Email" {...register("email")} className="w-full" />
      </FieldError>
      <FieldError message={errors.password?.message}>
        <PasswordInput placeholder="Password" {...register("password")} />
      </FieldError>
      <Button disabled={registerMutation.isPending} className="w-full">
        {registerMutation.isPending ? "Creating..." : "Register"}
      </Button>
    </form>
  );
}

function FieldError({ children, message }: { children: React.ReactNode; message?: string }) {
  return (
    <div>
      {children}
      {message ? <p className="mt-1 text-xs text-[#cc2f4a]">{message}</p> : null}
    </div>
  );
}
