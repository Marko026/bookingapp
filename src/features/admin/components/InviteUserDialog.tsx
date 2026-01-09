"use client";

import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormInput } from "@/components/shared/FormInput";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface InviteUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onInvite: () => void;
	email: string;
	setEmail: (email: string) => void;
	isInviting: boolean;
}

export function InviteUserDialog({
	open,
	onOpenChange,
	onInvite,
	email,
	setEmail,
	isInviting,
}: InviteUserDialogProps) {
	const t = useTranslations("Admin.users.dialogs.invite");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-2xl">
				<DialogHeader>
					<DialogTitle>{t("title")}</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<p className="text-sm text-gray-500">{t("description")}</p>
					<div className="relative">
						<FormInput
							label={t("emailLabel")}
							placeholder="colleague@example.com"
							className="pl-10"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Mail className="absolute left-3 top-[38px] h-4 w-4 text-gray-400" />
					</div>
					<Button
						className="w-full bg-black text-white rounded-xl"
						onClick={onInvite}
						disabled={isInviting || !email}
					>
						{isInviting ? t("sending") : t("send")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
