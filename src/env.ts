import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z
		.string()
		.url()
		.transform((url) => {
			// Auto-fix for common Supabase Pooler typo (.co instead of .com)
			if (
				url.includes(".pooler.supabase.co") &&
				!url.includes(".pooler.supabase.com")
			) {
				return url.replace(".pooler.supabase.co", ".pooler.supabase.com");
			}
			return url;
		}),
	NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
	SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
	RESEND_API_KEY: z.string().min(1),
	RESEND_FROM_EMAIL: z.string().email(),
	ADMIN_EMAIL_1: z.string().email(),
	ADMIN_EMAIL_2: z.string().email().optional(),
	CRON_SECRET: z.string().min(1, "Morate dodati CRON_SECRET u .env.local fajl"),
});

export const env = envSchema.parse(process.env);
