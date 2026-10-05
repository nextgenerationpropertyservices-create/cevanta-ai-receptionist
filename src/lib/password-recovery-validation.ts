import { z } from "zod";

export const recoveryEmailSchema = z.object({ email: z.string().trim().pipe(z.email().max(254)) });
// Supabase enforces its configured password policy; preserve whitespace semantics.
export const recoveredPasswordSchema = z.object({
  password: z.string().min(1).max(256),
  confirmPassword: z.string().min(1).max(256),
}).refine(value => value.password === value.confirmPassword, "Passwords must match.");
