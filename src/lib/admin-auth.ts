import { createClient } from "@/lib/supabase";

/**
 * Checks if the current user is an admin by querying the admin_users table.
 * @param userId - The ID of the user to check (optional, defaults to current session user)
 * @returns boolean indicating if the user is an admin
 */
export async function isAdminUser(userId?: string): Promise<boolean> {
	const supabase = createClient();

	let targetUserId = userId;

	if (!targetUserId) {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return false;
		targetUserId = user.id;
	}

	try {
		const { data, error } = await supabase
			.from("admin_users")
			.select("role")
			.eq("user_id", targetUserId)
			.single();

		if (error || !data) {
			return false;
		}

		return data.role === "admin";
	} catch (err) {
		console.error("Error checking admin status:", err);
		return false;
	}
}

/**
 * Server-side helper to require admin access.
 * Returns the user object if admin, null otherwise.
 */
export async function getAdminUser() {
	const supabase = createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		return null;
	}

	const isAdmin = await isAdminUser(user.id);
	if (!isAdmin) {
		return null;
	}

	return user;
}
