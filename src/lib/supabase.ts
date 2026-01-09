import { createBrowserClient } from "@supabase/ssr";

/**
 * Create Supabase client for use in CLIENT COMPONENTS
 * Use this in 'use client' components like admin/page.tsx
 */
export const createClient = () => {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
};
