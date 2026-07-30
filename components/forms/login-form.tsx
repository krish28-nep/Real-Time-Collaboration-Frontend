"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { loginUser } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/axios";
import { saveToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/auth";
import type { LoginFormValues } from "@/lib/validation/auth";

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      user: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (result) => {
      saveToken(result.token);
      toast.success("Logged in", { description: "Welcome back." });
      router.push("/workspaces");
    },
    onError: (error) => {
      toast.error("Login failed", { description: getApiErrorMessage(error) });
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => loginMutation.mutate(values))} className="space-y-4">
      <FieldError message={errors.user?.message}>
        <Input placeholder="Email or username" {...register("user")} className="w-full" />
      </FieldError>
      <FieldError message={errors.password?.message}>
        <PasswordInput placeholder="Password" {...register("password")} />
      </FieldError>
      <Button disabled={loginMutation.isPending} className="w-full">
        {loginMutation.isPending ? "Logging in..." : "Login"}
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
