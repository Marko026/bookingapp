"use client";

import { Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { ImageUpload } from "@/components/ImageUpload";
import { FormInput } from "@/components/shared/FormInput";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Attraction } from "@/types";

interface AttractionFormProps {
	editingAttraction: Partial<Attraction>;
	setEditingAttraction: (attraction: Partial<Attraction> | null) => void;
	onSave: () => void;
	onCancel: () => void;
	isAddingNew: boolean;
}

export function AttractionForm({
	editingAttraction,
	setEditingAttraction,
	onSave,
	onCancel,
	isAddingNew,
}: AttractionFormProps) {
	const t = useTranslations("Admin.attractions");

	const handleChange = (field: keyof Attraction, value: any) => {
		setEditingAttraction({
			...editingAttraction,
			[field]: value,
		});
	};

	return (
		<Card className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden mb-8">
			<CardContent className="p-8">
				<div className="space-y-6">
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormInput
								label={t("fields.titleSr")}
								value={editingAttraction.title || ""}
								onChange={(e) => handleChange("title", e.target.value)}
								placeholder={t("placeholders.attractionName")}
							/>
							<FormInput
								label={t("fields.distance")}
								value={editingAttraction.distance || ""}
								onChange={(e) => handleChange("distance", e.target.value)}
								placeholder={t("placeholders.distance")}
							/>
							<FormInput
								label={t("fields.shortDescSr")}
								value={editingAttraction.description || ""}
								onChange={(e) => handleChange("description", e.target.value)}
								placeholder={t("placeholders.shortSubtitle")}
							/>
							<FormInput
								label={t("fields.coords")}
								value={editingAttraction.coords || ""}
								onChange={(e) => handleChange("coords", e.target.value)}
								placeholder={t("placeholders.coords")}
							/>
						</div>
						<RichTextEditor
							label={t("fields.longDescSr")}
							value={editingAttraction.longDescription || ""}
							onChange={(value) => handleChange("longDescription", value)}
							placeholder={t("placeholders.fullText")}
						/>
					</div>

					<div className="space-y-4">
						<label className="text-sm font-medium text-gray-900 block">
							{t("fields.gallery")}
						</label>
						<ImageUpload
							onUploadComplete={(images) => {
								const urls = images.map((i) => i.url);
								setEditingAttraction({
									...editingAttraction,
									image: urls[0] || "",
									gallery: urls,
								});
							}}
							existingImages={editingAttraction.gallery?.map((url) => ({
								url,
								path: url.split("/").pop() || "",
								width: 1920,
								height: 1080,
							}))}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button variant="ghost" onClick={onCancel} className="rounded-xl">
							{t("cancel")}
						</Button>
						<Button
							onClick={onSave}
							className="bg-black text-white px-8 rounded-xl"
						>
							<Save size={18} className="mr-2" /> {t("save")}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
