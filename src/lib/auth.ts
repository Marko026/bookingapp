"use server";

import { env } from "@/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { logError } from "@/lib/logger";

export interface AuthResult {
	success: boolean;
	error?: string;
	user?: {
		id: string;
		email: string;
	};
}

/**
 * Login admin user sa email i password
 */
export async function loginAdmin(
	email: string,
	password: string,
): Promise<AuthResult> {
	const rateLimit = checkRateLimit(`login:${email}`, {
		maxRequests: 5,
		windowMs: 300_000,
	});
	if (!rateLimit.allowed) {
		return {
			success: false,
			error: "Previše pokušaja. Pokušajte ponovo za nekoliko minuta.",
		};
	}

	try {
		const supabase = await createServerClient();

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			logError(error, { action: "loginAdmin", path: "/admin/login", userId: email });

			// User-friendly error messages u srpskom
			if (error.message.includes("Invalid login credentials")) {
				return {
					success: false,
					error: "Pogrešan email ili lozinka. Pokušajte ponovo.",
				};
			}

			if (error.message.includes("Email not confirmed")) {
				return {
					success: false,
					error: "Email adresa nije potvrđena. Proverite inbox.",
				};
			}

			return {
				success: false,
				error: "Greška pri logovanju. Pokušajte kasnije.",
			};
		}

		if (!data.user) {
			return {
				success: false,
				error: "Greška pri logovanju. Pokušajte ponovo.",
			};
		}

		// Provera da li je email među dozvoljenim admin email-ovima
		const allowedEmails = [env.ADMIN_EMAIL_1, env.ADMIN_EMAIL_2].filter(
			Boolean,
		);

		if (!allowedEmails.includes(data.user.email)) {
			await supabase.auth.signOut();
			return {
				success: false,
				error: "Nemate administratorska prava.",
			};
		}

		return {
			success: true,
			user: {
				id: data.user.id,
				email: data.user.email || "",
			},
		};
	} catch (error) {
		logError(error, { action: "loginAdmin", path: "/admin/login", userId: email });
		return {
			success: false,
			error: "Neočekivana greška. Pokušajte ponovo.",
		};
	}
}

/**
 * Logout admin user
 */
export async function logoutAdmin(): Promise<void> {
	const supabase = await createServerClient();
	await supabase.auth.signOut();
}

/**
 * Provera da li je user trenutno ulogovan
 */
export async function getCurrentUser(): Promise<AuthResult> {
	try {
		const supabase = await createServerClient();

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

		// Provera admin prava preko baze
		const { data: adminRecord, error: adminError } = await supabase
			.from("admin_users")
			.select("role")
			.eq("user_id", user.id)
			.single();

		if (adminError || !adminRecord || adminRecord.role !== "admin") {
			// Fallback za stare hardkodovane admine dok se ne završi migracija
			const allowedEmails = [env.ADMIN_EMAIL_1, env.ADMIN_EMAIL_2].filter(
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
		logError(error, { action: "getCurrentUser", path: "/admin" });
		return {
			success: false,
			error: "Greška prilikom provere sesije.",
		};
	}
}

/**
 * Reset password - šalje email sa reset linkom
 */
export async function sendPasswordResetEmail(
	email: string,
): Promise<AuthResult> {
	try {
		const supabase = await createServerClient();

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset-password`,
		});

		if (error) {
			logError(error, { action: "sendPasswordResetEmail", path: "/admin/forgot-password", userId: email });
			return {
				success: false,
				error: "Greška pri slanju email-a. Pokušajte ponovo.",
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		logError(error, { action: "sendPasswordResetEmail", path: "/admin/forgot-password", userId: email });
		return {
			success: false,
			error: "Neočekivana greška. Pokušajte ponovo.",
		};
	}
}
