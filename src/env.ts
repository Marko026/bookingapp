import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
	SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
	RESEND_API_KEY: z.string().min(1),
	RESEND_FROM_EMAIL: z.string().email(),
	NEXT_PUBLIC_ADMIN_EMAIL_1: z.string().email(),
	NEXT_PUBLIC_ADMIN_EMAIL_2: z.string().email().optional(),
});

export const env = envSchema.parse(process.env);
