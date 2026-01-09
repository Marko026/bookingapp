import { getServerUser } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase-admin";
import "server-only";

export interface UserWithRole {
	id: string;
	email: string | undefined;
	created_at: string;
	last_sign_in_at: string | undefined;
	role: "admin" | "user";
}

export async function getRegisteredUsers(): Promise<{
	success: boolean;
	users?: UserWithRole[];
	error?: string;
}> {
	try {
		// 1. Check if current requester is an admin (Use Server Side Auth)
		const currentUser = await getServerUser();
		if (!currentUser.success) {
			return { success: false, error: currentUser.error || "Unauthorized" };
		}

		const supabase = createAdminClient();

		// 2. Fetch all users from auth.users
		const {
			data: { users },
			error: usersError,
		} = await supabase.auth.admin.listUsers();

		if (usersError) {
			console.error("DEBUG - listUsers error:", usersError);
			return { success: false, error: `Auth Error: ${usersError.message}` };
		}

		// 3. Fetch all admin records using same admin client (bypasses RLS)
		const { data: adminRecords, error: adminError } = await supabase
			.from("admin_users")
			.select("user_id, role");

		if (adminError) {
			console.error("DEBUG - admin_users fetch error:", adminError);
			// If table doesn't exist, we'll return an empty list of admins instead of failing completely,
			// but we should still log it.
			if (adminError.code === "42P01") {
				return {
					success: false,
					error: "Tabela 'admin_users' ne postoji. Pokrenite SQL migraciju.",
				};
			}
			return { success: false, error: `Database Error: ${adminError.message}` };
		}

		// 4. Map and merge data
		const adminUserIds = new Set(adminRecords?.map((r) => r.user_id));

		const mappedUsers: UserWithRole[] = users.map((u) => ({
			id: u.id,
			email: u.email,
			created_at: u.created_at,
			last_sign_in_at: u.last_sign_in_at,
			role: adminUserIds.has(u.id) ? "admin" : "user",
		}));

		// Sort: Admins first, then by email
		mappedUsers.sort((a, b) => {
			if (a.role === b.role)
				return (a.email || "").localeCompare(b.email || "");
			return a.role === "admin" ? -1 : 1;
		});

		return {
			success: true,
			users: mappedUsers,
		};
	} catch (error) {
		console.error("Unexpected error getting users:", error);
		return { success: false, error: "An unexpected error occurred" };
	}
}
