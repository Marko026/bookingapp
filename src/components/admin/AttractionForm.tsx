"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { ImageUpload } from "@/components/ImageUpload";
import { FormInput } from "@/components/shared/FormInput";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	type AttractionFormValues,
	attractionFormSchema,
} from "@/features/attractions/schemas";
import type { Attraction } from "@/types";

interface AttractionFormProps {
	editingAttraction: Partial<Attraction> | null;
	onSave: (data: AttractionFormValues) => Promise<void>;
	onCancel: () => void;
	isAddingNew: boolean;
	isSubmitting?: boolean;
}

export function AttractionForm({
	editingAttraction,
	onSave,
	onCancel,
	isAddingNew,
	isSubmitting = false,
}: AttractionFormProps) {
	const t = useTranslations("Admin.attractions");

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<AttractionFormValues>({
		resolver: zodResolver(attractionFormSchema),
		defaultValues: {
			title: editingAttraction?.title || "",
			titleEn: editingAttraction?.titleEn || "",
			description: editingAttraction?.description || "",
			descriptionEn: editingAttraction?.descriptionEn || "",
			longDescription: editingAttraction?.longDescription || "",
			longDescriptionEn: editingAttraction?.longDescriptionEn || "",
			distance: editingAttraction?.distance || "",
			coords: editingAttraction?.coords || "",
			latitude: editingAttraction?.latitude || null,
			longitude: editingAttraction?.longitude || null,
			image: editingAttraction?.image || "",
			gallery: editingAttraction?.gallery || [],
		},
	});

	// Reset form when editingAttraction changes
	useEffect(() => {
		if (editingAttraction) {
			reset({
				title: editingAttraction.title || "",
				titleEn: editingAttraction.titleEn || "",
				description: editingAttraction.description || "",
				descriptionEn: editingAttraction.descriptionEn || "",
				longDescription: editingAttraction.longDescription || "",
				longDescriptionEn: editingAttraction.longDescriptionEn || "",
				distance: editingAttraction.distance || "",
				coords: editingAttraction.coords || "",
				latitude: editingAttraction.latitude || null,
				longitude: editingAttraction.longitude || null,
				image: editingAttraction.image || "",
				gallery: editingAttraction.gallery || [],
			});
		}
	}, [editingAttraction, reset]);

	return (
		<Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden mb-8">
			<CardContent className="p-8">
				<form onSubmit={handleSubmit(onSave)} className="space-y-6">
										<div className="space-y-6">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<FormInput
													label={t("fields.titleSr")}
													{...register("title")}
													error={errors.title?.message}
													placeholder={t("placeholders.attractionName")}
												/>
												<FormInput
													label={t("fields.titleEn") || "Title (EN)"}
													{...register("titleEn")}
													placeholder="English title (optional)"
												/>
												<FormInput
													label={t("fields.distance")}
													{...register("distance")}
													placeholder={t("placeholders.distance")}
												/>
												<FormInput
													label={t("fields.coords")}
													{...register("coords")}
													placeholder={t("placeholders.coords")}
												/>
												<FormInput
													label={t("fields.shortDescSr")}
													{...register("description")}
													className="md:col-span-1"
													placeholder={t("placeholders.shortSubtitle")}
												/>
												<FormInput
													label={t("fields.shortDescEn") || "Short Description (EN)"}
													{...register("descriptionEn")}
													className="md:col-span-1"
													placeholder="English short description (optional)"
												/>
											</div>
					
											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												<Controller
													name="longDescription"
													control={control}
													render={({ field }) => (
														<RichTextEditor
															label={t("fields.longDescSr")}
															value={field.value || ""}
															onChange={field.onChange}
															placeholder={t("placeholders.fullText")}
														/>
													)}
												/>
												<Controller
													name="longDescriptionEn"
													control={control}
													render={({ field }) => (
														<RichTextEditor
															label={t("fields.longDescEn") || "Long Description (EN)"}
															value={field.value || ""}
															onChange={field.onChange}
															placeholder="Full English text (optional)"
														/>
													)}
												/>
											</div>
										</div>
										<div className="space-y-4">
						<label className="text-sm font-medium text-gray-900 block">
							{t("fields.gallery")}
						</label>
						<Controller
							name="gallery"
							control={control}
							render={({ field }) => (
								<ImageUpload
									onUploadComplete={(images) => {
										const urls = images.map((i) => i.url);
										field.onChange(urls);
									}}
									existingImages={field.value?.map((url) => ({
										url,
										path: url.split("/").pop() || "",
										width: 1920,
										height: 1080,
									}))}
								/>
							)}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="ghost"
							onClick={onCancel}
							className="rounded-xl"
						>
							{t("cancel")}
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="bg-black text-white px-8 rounded-xl"
						>
							<Save size={18} className="mr-2" />{" "}
							{isSubmitting ? t("saving") : t("save")}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
