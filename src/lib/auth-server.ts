import { createClient } from "@/lib/supabase-server";

export interface AuthResult {
	success: boolean;
	error?: string;
	user?: {
		id: string;
		email: string;
	};
}

/**
 * Provera usera na SERVER strani (za Server Actions)
 */
export async function getServerUser(): Promise<AuthResult> {
	try {
		const supabase = await createClient();

		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error || !user) {
			return {
				success: false,
				error: "Niste ulogovani.",
			};
		}

		// 1. Permanent Super Admin Check (Environment Variable)
		// This ensures the owner always has access, even if the database table is empty or missing.
		const superAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL_1;
		if (superAdminEmail && user.email === superAdminEmail) {
			return {
				success: true,
				user: { id: user.id, email: user.email || "" },
			};
		}

		// 2. Database Role Check
		const { data: adminRecord, error: adminError } = await supabase
			.from("admin_users")
			.select("role")
			.eq("user_id", user.id)
			.single();

		if (adminError || !adminRecord || adminRecord.role !== "admin") {
			// Secondary Fallback for other hardcoded admins
			const allowedEmails = [process.env.NEXT_PUBLIC_ADMIN_EMAIL_2].filter(
				Boolean,
			);

			if (!allowedEmails.includes(user.email)) {
				return {
					success: false,
					error: "Nemate administratorska prava.",
				};
			}
		}

		return {
			success: true,
			user: {
				id: user.id,
				email: user.email || "",
			},
		};
	} catch (error) {
		console.error("Get server user error:", error);
		return {
			success: false,
			error: "Greška prilikom provere sesije.",
		};
	}
}
