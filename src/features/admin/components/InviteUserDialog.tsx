"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/shared/FormInput";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const inviteSchema = z.object({
	email: z.string().email(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onInvite: (email: string) => Promise<void>;
	isInviting: boolean;
}

export function InviteUserDialog({
	open,
	onOpenChange,
	onInvite,
	isInviting,
}: InviteUserDialogProps) {
	const t = useTranslations("Admin.users.dialogs.invite");

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid },
	} = useForm<InviteFormValues>({
		resolver: zodResolver(inviteSchema),
		defaultValues: {
			email: "",
		},
		mode: "onChange",
	});

	const onSubmit = async (data: InviteFormValues) => {
		await onInvite(data.email);
		reset();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(val) => {
				onOpenChange(val);
				if (!val) reset();
			}}
		>
			<DialogContent className="rounded-2xl">
				<DialogHeader>
					<DialogTitle>{t("title")}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
					<p className="text-sm text-gray-500">{t("description")}</p>
					<div className="relative">
						<FormInput
							label={t("emailLabel")}
							placeholder="colleague@example.com"
							className="pl-10"
							error={errors.email ? t("invalidEmail") : undefined}
							{...register("email")}
						/>
						<Mail className="absolute left-3 top-[38px] h-4 w-4 text-gray-400" />
					</div>
					<Button
						type="submit"
						className="w-full bg-black text-white rounded-xl"
						disabled={isInviting || !isValid}
					>
						{isInviting ? t("sending") : t("send")}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
