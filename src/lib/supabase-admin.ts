import { createClient } from "@supabase/supabase-js";

// Note: This client should ONLY be used in secure Server Actions or API routes.
// NEVER expose this client to the browser/client-side code.
export const createAdminClient = () => {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

	if (!serviceRoleKey) {
		throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
	}

	return createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
};
