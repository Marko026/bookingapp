import { createClient } from "@/lib/supabase";

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
	try {
		const supabase = createClient();

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error("Login error:", error);

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
		const allowedEmails = [
			process.env.NEXT_PUBLIC_ADMIN_EMAIL_1,
			process.env.NEXT_PUBLIC_ADMIN_EMAIL_2,
		].filter(Boolean);

		console.log("🔍 Debug - Allowed emails:", allowedEmails);
		console.log("🔍 Debug - User email:", data.user.email);

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
		console.error("Unexpected login error:", error);
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
	const supabase = createClient();
	await supabase.auth.signOut();
}

/**
 * Provera da li je user trenutno ulogovan
 */
/**
 * Provera da li je user trenutno ulogovan
 */
export async function getCurrentUser(): Promise<AuthResult> {
	try {
		const supabase = createClient();

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
			const allowedEmails = [
				process.env.NEXT_PUBLIC_ADMIN_EMAIL_1,
				process.env.NEXT_PUBLIC_ADMIN_EMAIL_2,
			].filter(Boolean);

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
		console.error("Get user error:", error);
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
		const supabase = createClient();

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset-password`,
		});

		if (error) {
			console.error("Password reset error:", error);
			return {
				success: false,
				error: "Greška pri slanju email-a. Pokušajte ponovo.",
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		console.error("Unexpected password reset error:", error);
		return {
			success: false,
			error: "Neočekivana greška. Pokušajte ponovo.",
		};
	}
}
