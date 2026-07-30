import { z } from "zod";

export const loginSchema = z.object({
  user: z.string().trim().min(1, "Email or username is required."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  username: z.string().trim().min(2, "Username must be at least 2 characters.").max(50),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
