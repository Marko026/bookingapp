"use server";

import { revalidatePath } from "next/cache";
import { getRegisteredUsers as getRegisteredUsersDal } from "@/dal/users";
import { getServerUser } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase-admin";

// Type definitions needed for the actions
export interface UserWithRole {
	id: string;
	email: string | undefined;
	created_at: string;
	last_sign_in_at: string | undefined;
	role: "admin" | "user";
}

export async function getRegisteredUsers() {
	return await getRegisteredUsersDal();
}

export async function toggleAdminStatus(
	targetUserId: string,
	targetEmail: string,
	shouldBeAdmin: boolean,
): Promise<{ success: boolean; error?: string }> {
	try {
		// 1. Security Check
		const currentUser = await getServerUser();
		if (!currentUser.success) {
			return { success: false, error: currentUser.error || "Unauthorized" };
		}

		// Prevent self-demotion
		if (!shouldBeAdmin && currentUser.user?.id === targetUserId) {
			return {
				success: false,
				error: "Ne možete sami sebi ukinuti admin prava.",
			};
		}

		const supabase = createAdminClient();

		if (shouldBeAdmin) {
			const { error } = await supabase.from("admin_users").insert({
				user_id: targetUserId,
				email: targetEmail,
				role: "admin",
			});

			if (error) {
				if (error.code === "23505") return { success: true };
				console.error("Error promoting user:", error);
				return { success: false, error: "Failed to promote user" };
			}
		} else {
			const { error } = await supabase
				.from("admin_users")
				.delete()
				.eq("user_id", targetUserId);

			if (error) {
				console.error("Error demoting user:", error);
				return { success: false, error: "Failed to demote user" };
			}
		}

		revalidatePath("/admin/dashboard");
		return { success: true };
	} catch (error) {
		console.error("Unexpected error toggling admin status:", error);
		return { success: false, error: "An unexpected error occurred" };
	}
}

export async function inviteUser(
	email: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		// 1. Security Check
		const currentUser = await getServerUser();
		if (!currentUser.success) {
			return { success: false, error: currentUser.error || "Unauthorized" };
		}

		const supabase = createAdminClient();

		// 2. Invite user by email
		const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

		if (error) {
			console.error("Error inviting user:", error);
			return { success: false, error: error.message };
		}

		revalidatePath("/admin/dashboard");
		return { success: true };
	} catch (error) {
		console.error("Unexpected error inviting user:", error);
		return { success: false, error: "An unexpected error occurred" };
	}
}
