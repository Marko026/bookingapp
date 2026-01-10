"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ImageUpload } from "@/components/ImageUpload";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createApartment } from "@/features/listings/actions";
import { toast } from "@/lib/toast";
import { type ApartmentFormValues, apartmentFormSchema } from "../schemas";

// Dynamically import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("@/components/admin/MapPicker"), {
	ssr: false,
	loading: () => (
		<div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg" />
	),
});

export function ApartmentForm() {
	const t = useTranslations("Admin.apartments");
	const router = useRouter();

	// Use useActionState for form submission state management
	const [state, formAction, isPending] = useActionState(createApartment, {
		success: false,
	});

	const form = useForm({
		resolver: zodResolver(apartmentFormSchema),
		defaultValues: {
			name: "",
			nameEn: "",
			description: "",
			descriptionEn: "",
			pricePerNight: 0,
			capacity: 2,
			latitude: null,
			longitude: null,
			images: [],
		},
	});

	// Handle side effects (Toast & Navigation) based on Action State
	useEffect(() => {
		if (state.success && state.data) {
			toast.success(t("toast.success"), {
				description: t("toast.successDesc"),
			});
			router.push("/admin");
		} else if (state.success === false && state.message) {
			toast.error(t("toast.error"), {
				description: state.message || t("toast.defaultError"),
			});
		}
	}, [state, router, t]);

	const onSubmit = (values: ApartmentFormValues) => {
		const formDataToSend = new FormData();
		formDataToSend.append("name", values.name);
		formDataToSend.append("nameEn", values.nameEn || "");
		formDataToSend.append("description", values.description || "");
		formDataToSend.append("descriptionEn", values.descriptionEn || "");
		formDataToSend.append("pricePerNight", values.pricePerNight.toString());
		formDataToSend.append("capacity", values.capacity.toString());

		if (values.images.length > 0) {
			formDataToSend.append("imageUrl", values.images[0].url);
		}
		if (values.latitude)
			formDataToSend.append("latitude", values.latitude.toString());
		if (values.longitude)
			formDataToSend.append("longitude", values.longitude.toString());

		// Prepare images array for server action
		const imagesData = values.images.map((img, index) => ({
			imageUrl: img.url,
			altText: t("imageAlt", { name: values.name, number: index + 1 }),
			displayOrder: index,
			isCover: index === 0,
			width: img.width,
			height: img.height,
		}));

		formDataToSend.append("images", JSON.stringify(imagesData));

		// Dispatch action wrapped in transition
		startTransition(() => {
			formAction(formDataToSend);
		});
	};

	return (
		<div className="container max-w-4xl mx-auto py-12 px-4">
			<Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden">
				<CardHeader className="pt-10 px-10">
					<CardTitle className="text-3xl font-serif font-bold">
						{t("title")}
					</CardTitle>
					<CardDescription>{t("description")}</CardDescription>
				</CardHeader>
				<CardContent className="p-10">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<div className="space-y-6">
								<div className="grid grid-cols-2 gap-6">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>{t("labels.nameSr")}</FormLabel>
												<FormControl>
													<Input
														placeholder={t("placeholders.nameSr")}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="pricePerNight"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("labels.price")}</FormLabel>
													<FormControl>
														<Input
															type="number"
															placeholder={t("placeholders.price")}
															{...field}
															value={field.value as number}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="capacity"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{t("labels.capacity")}</FormLabel>
													<FormControl>
														<Input
															type="number"
															placeholder={t("placeholders.capacity")}
															{...field}
															value={field.value as number}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("labels.descSr")}</FormLabel>
											<FormControl>
												<RichTextEditor
													id="description"
													label=""
													value={field.value || ""}
													onChange={field.onChange}
													placeholder={t("placeholders.descSr")}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Location Picker */}
							<div className="space-y-2">
								<FormLabel>{t("labels.location")}</FormLabel>
								<p className="text-sm text-muted-foreground mb-4">
									{t("locationHelp")}
								</p>
								<MapPicker
									onLocationSelect={(lat, lng) => {
										form.setValue("latitude", lat);
										form.setValue("longitude", lng);
									}}
								/>
								{form.watch("latitude") && form.watch("longitude") && (
									<p className="text-xs text-green-600 font-medium">
										{t("locationSet")} {form.watch("latitude")?.toFixed(6)},{" "}
										{form.watch("longitude")?.toFixed(6)}
									</p>
								)}
							</div>

							{/* Image Upload */}
							<div className="space-y-2">
								<FormLabel>{t("labels.images")}</FormLabel>
								<p className="text-sm text-muted-foreground mb-4">
									{t("imagesHelp")}
								</p>
								<ImageUpload
									onUploadComplete={(images) => form.setValue("images", images)}
									maxFiles={10}
									existingImages={form.getValues("images")}
								/>
								{form.formState.errors.images && (
									<p className="text-sm font-medium text-destructive">
										{form.formState.errors.images.message}
									</p>
								)}
							</div>

							{/* Submit */}
							<div className="flex gap-4">
								<Button type="submit" disabled={isPending} className="flex-1">
									{isPending ? t("submitting") : t("submit")}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
								>
									{t("cancel")}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* Info Card */}
			<Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
				<CardHeader>
					<CardTitle className="text-lg">{t("tips.title")}</CardTitle>
				</CardHeader>
				<CardContent className="text-sm space-y-2">
					<p>{t("tips.size")}</p>
					<p>{t("tips.dim")}</p>
					<p>{t("tips.format")}</p>
					<p>{t("tips.maxSize")}</p>
					<p>{t("tips.convert")}</p>
				</CardContent>
			</Card>
		</div>
	);
}
