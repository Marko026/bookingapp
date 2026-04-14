"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createBooking } from "../actions";

interface BookingFormProps {
	apartmentId: string;
	apartmentName: string;
	apartmentImage: string;
	checkIn: Date;
	checkOut: Date;
	totalPrice: number;
	onClose: () => void;
	onSuccess: () => void;
}

export function BookingForm({
	apartmentId,
	apartmentName,
	apartmentImage,
	checkIn,
	checkOut,
	totalPrice,
	onClose,
	onSuccess,
}: BookingFormProps) {
	const t = useTranslations("Booking");
	const [state, formAction, isPending] = useActionState(createBooking, {
		message: "",
		success: false,
	});

	useEffect(() => {
		if (state.success) {
			onSuccess();
		} else if (state.message && !state.success) {
			toast.error(t("toast.errorTitle") || "Greška pri rezervaciji", {
				description: state.message || t("toast.errorDesc"),
				className: "bg-red-50 text-red-900 border-red-100 rounded-2xl p-4",
			});
		}
	}, [state.success, state.message, onSuccess, t]);

	return (
		<motion.div
			initial={{ scale: 0.95, opacity: 0, y: 20 }}
			animate={{ scale: 1, opacity: 1, y: 0 }}
			exit={{ scale: 0.95, opacity: 0, y: 20 }}
			className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
		>
			<div className="flex justify-between items-center mb-6 md:mb-8">
				<h3 className="text-2xl md:text-3xl font-serif font-medium">
					{t("form.title")}
				</h3>
				<button
					onClick={onClose}
					className="p-2 hover:bg-gray-100 rounded-full transition-colors"
					type="button"
				>
					<X size={24} />
				</button>
			</div>

			<form action={formAction} className="space-y-4">
				<input type="hidden" name="apartmentId" value={apartmentId} />
				<input type="hidden" name="apartmentName" value={apartmentName} />
				<input type="hidden" name="apartmentImage" value={apartmentImage} />
				<input
					type="hidden"
					name="checkIn"
					value={checkIn.toLocaleDateString("en-CA")}
				/>
				<input
					type="hidden"
					name="checkOut"
					value={checkOut.toLocaleDateString("en-CA")}
				/>
				<input type="hidden" name="totalPrice" value={totalPrice} />

				{[
					{ label: t("form.name"), name: "guestName", type: "text" },
					{ label: t("form.email"), name: "guestEmail", type: "email" },
					{ label: t("form.phone"), name: "phone", type: "tel" },
				].map(({ label, name, type }) => (
					<div key={name}>
						<label
							htmlFor={name}
							className="block text-[10px] md:text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest"
						>
							{label}
						</label>
						<input
							id={name}
							required={name !== "phone"}
							name={name}
							type={type}
							className={cn(
								"w-full px-4 py-3 md:px-5 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 focus:bg-white border border-transparent focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none font-medium transition-all text-base",
								state?.errors?.[name] && "border-red-500 bg-red-50/10",
							)}
							placeholder={label}
						/>
						<FormError message={state?.errors?.[name]?.[0]} />
					</div>
				))}

				<div>
					<label
						htmlFor="question"
						className="block text-[10px] md:text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest"
					>
						{t("form.message")}
					</label>
					<Textarea
						id="question"
						name="question"
						placeholder={t("form.messagePlaceholder")}
						className="w-full px-4 py-3 md:px-5 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 focus:bg-white border border-transparent focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none font-medium transition-all text-base min-h-[100px] resize-none"
					/>
				</div>

				<div className="pt-4">
					<Button
						type="submit"
						disabled={isPending}
						className="w-full !py-5 md:!py-6 text-base md:text-lg shadow-xl bg-amber-600 text-white hover:bg-amber-700 rounded-xl transition-all disabled:opacity-50"
					>
						{isPending ? t("form.submitting") : t("form.submit")}
					</Button>
				</div>
			</form>
		</motion.div>
	);
}
