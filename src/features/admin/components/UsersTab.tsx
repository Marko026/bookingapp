"use client";

import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/shared/AdminPageHeader";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import {
	getRegisteredUsers,
	inviteUser,
	toggleAdminStatus,
	type UserWithRole,
} from "@/features/admin/actions";
import { toast } from "@/lib/toast";
import { InviteUserDialog } from "./InviteUserDialog";
import { UserTable } from "./UserTable";

export function UsersTab() {
	const t = useTranslations("Admin.users");
	const [users, setUsers] = useState<UserWithRole[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [isUpdating, setIsUpdating] = useState<string | null>(null);

	// Invite state
	const [isInviteOpen, setIsInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [isInviting, setIsInviting] = useState(false);

	// Admin toggle confirmation
	const [confirmToggleUser, setConfirmToggleUser] =
		useState<UserWithRole | null>(null);

	const fetchUsers = async () => {
		setIsLoading(true);
		try {
			const result = await getRegisteredUsers();
			if (result.success && result.users) {
				setUsers(result.users);
			} else {
				toast.error(t("toast.loadError"), {
					description: result.error || "Unknown error",
				});
			}
		} catch (error) {
			console.error(error);
			toast.error(t("toast.loadError"));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleToggleAdmin = async (user: UserWithRole) => {
		const isPromoting = user.role !== "admin";

		if (!user.email) {
			toast.error(t("toast.noEmail"));
			return;
		}

		setIsUpdating(user.id);
		try {
			const result = await toggleAdminStatus(user.id, user.email, isPromoting);
			if (result.success) {
				toast.success(isPromoting ? t("toast.promoted") : t("toast.demoted"));
				setUsers((prev) =>
					prev.map((u) =>
						u.id === user.id
							? { ...u, role: isPromoting ? "admin" : "user" }
							: u,
					),
				);
			} else {
				toast.error(t("toast.actionFailed"), { description: result.error });
			}
		} catch (err) {
			toast.error(t("toast.unexpectedError"));
		} finally {
			setIsUpdating(null);
			setConfirmToggleUser(null);
		}
	};

	const handleInvite = async () => {
		if (!inviteEmail) return;
		setIsInviting(true);
		try {
			const result = await inviteUser(inviteEmail);
			if (result.success) {
				toast.success(t("toast.inviteSent"));
				setInviteEmail("");
				setIsInviteOpen(false);
			} else {
				toast.error(t("toast.inviteError"), { description: result.error });
			}
		} catch (error) {
			toast.error(t("toast.unexpectedError"));
		} finally {
			setIsInviting(false);
		}
	};

	const filteredUsers = users.filter((user) =>
		user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title={t("title")}
				action={
					<>
						<SearchInput
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder={t("searchPlaceholder")}
						/>
						<Button
							onClick={() => setIsInviteOpen(true)}
							className="bg-black text-white hover:bg-gray-800 rounded-xl"
						>
							<UserPlus className="h-4 w-4 mr-2" /> {t("inviteUser")}
						</Button>
					</>
				}
			/>

			<UserTable
				users={filteredUsers}
				isLoading={isLoading}
				isUpdating={isUpdating}
				onToggleAdmin={(user) => {
					if (user.role === "admin") {
						setConfirmToggleUser(user);
					} else {
						handleToggleAdmin(user);
					}
				}}
			/>

			<InviteUserDialog
				open={isInviteOpen}
				onOpenChange={setIsInviteOpen}
				onInvite={handleInvite}
				email={inviteEmail}
				setEmail={setInviteEmail}
				isInviting={isInviting}
			/>

			<ConfirmDeleteDialog
				open={!!confirmToggleUser}
				onOpenChange={(open) => !open && setConfirmToggleUser(null)}
				onConfirm={() =>
					confirmToggleUser && handleToggleAdmin(confirmToggleUser)
				}
				title={t("dialogs.demote.title")}
				description={t("dialogs.demote.description")}
				isLoading={!!isUpdating}
			/>
		</div>
	);
}
