"use client";

import { Plus, Save } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminApartments } from "@/features/admin/hooks/useAdminApartments";
import { getLocalizedField } from "@/lib/localization";
import { stripHtml } from "@/lib/utils";
import type { Apartment } from "@/types";

export function ApartmentsManager() {
	const t = useTranslations("Admin.apartments.manager");
	const locale = useLocale();
	const {
		apartments,
		isLoading,
		fetchApartments,
		removeApartment,
		saveApartment,
	} = useAdminApartments();
	const router = useRouter();

	const [editingApartment, setEditingApartment] = useState<Apartment | null>(
		null,
	);
	const [deleteConfirm, setDeleteConfirm] = useState<{
		isOpen: boolean;
		id: number | null;
	}>({ isOpen: false, id: null });

	useEffect(() => {
		fetchApartments();
	}, [fetchApartments]);

	const handleSave = async () => {
		if (editingApartment) {
			const formData = new FormData();
			formData.append("name", editingApartment.name);
			formData.append("nameEn", "");
			formData.append("description", editingApartment.description);
			formData.append("descriptionEn", "");
			formData.append("pricePerNight", String(editingApartment.price));
			formData.append("capacity", String(editingApartment.maxGuests));

			const imagesData = editingApartment.images.map((url, index) => ({
				imageUrl: url,
				altText: t("imageAlt", {
					name: editingApartment.name,
					number: index + 1,
				}),
				displayOrder: index,
				isCover: index === 0,
			}));
			formData.append("images", JSON.stringify(imagesData));

			const success = await saveApartment(
				Number(editingApartment.id),
				formData,
			);
			if (success) {
				setEditingApartment(null);
			}
		}
	};

	const handleDelete = async () => {
		if (deleteConfirm.id) {
			await removeApartment(deleteConfirm.id);
			setDeleteConfirm({ isOpen: false, id: null });
		}
	};

	if (isLoading && apartments.length === 0) {
		return <div className="p-8 text-center text-gray-500">{t("loading")}</div>;
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-serif font-bold text-gray-900">
					{t("title")}
				</h2>
				<Button
					onClick={() => router.push("/admin/apartments/add")}
					className="bg-black text-white rounded-xl"
				>
					<Plus size={20} className="mr-2" /> {t("addNew")}
				</Button>
			</div>

			<div className="grid gap-8">
				{apartments.map((apt) => (
					<Card
						key={apt.id}
						className="rounded-[2.5rem] border-gray-100 shadow-sm overflow-hidden"
					>
						<CardContent className="p-8">
							{editingApartment?.id === apt.id ? (
								<div className="space-y-6">
									{/* Apartment Edit Form */}
									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-8">
											<div className="space-y-2">
												<label className="text-xs font-bold uppercase text-gray-400">
													{t("labels.nameSr")}
												</label>
												<Input
													value={editingApartment.name}
													onChange={(e) =>
														setEditingApartment({
															...editingApartment,
															name: e.target.value,
														})
													}
												/>
											</div>
											<div className="space-y-2">
												<label className="text-xs font-bold uppercase text-gray-400">
													{t("labels.pricePerNight")}
												</label>
												<Input
													type="number"
													value={editingApartment.price}
													onChange={(e) =>
														setEditingApartment({
															...editingApartment,
															price: Number(e.target.value),
														})
													}
												/>
											</div>
										</div>
										<RichTextEditor
											label={t("labels.descSr")}
											value={editingApartment.description}
											onChange={(value) =>
												setEditingApartment({
													...editingApartment,
													description: value,
												})
											}
										/>
									</div>

									<ImageUpload
										onUploadComplete={(images) =>
											setEditingApartment({
												...editingApartment,
												images: images.map((i) => i.url),
											})
										}
										existingImages={editingApartment.images.map((url) => ({
											url,
											path: url.split("/").pop() || "",
											width: 1920,
											height: 1080,
										}))}
									/>
									<div className="flex justify-end gap-2">
										<Button
											variant="ghost"
											onClick={() => setEditingApartment(null)}
										>
											{t("buttons.cancel")}
										</Button>
										<Button onClick={handleSave}>
											<Save size={20} className="mr-2" /> {t("buttons.save")}
										</Button>
									</div>
								</div>
							) : (
								<div className="flex justify-between items-start gap-8">
									<div className="flex gap-8">
										<div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
											<Image
												src={apt.images[0]}
												alt={
													getLocalizedField(apt, "name", locale) || "Apartment"
												}
												fill
												className="object-cover"
												sizes="160px"
											/>
										</div>
										<div>
											<h3 className="text-2xl font-serif font-bold">
												{getLocalizedField(apt, "name", locale)}
											</h3>
											<p className="text-gray-600">
												{stripHtml(
													getLocalizedField(apt, "description", locale),
												)}
											</p>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											onClick={() => setEditingApartment(apt)}
										>
											{t("buttons.edit")}
										</Button>
										<Button
											variant="destructive"
											onClick={() =>
												setDeleteConfirm({
													isOpen: true,
													id: Number(apt.id),
												})
											}
										>
											{t("buttons.delete")}
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			<ConfirmDeleteDialog
				open={deleteConfirm.isOpen}
				onOpenChange={(open) =>
					setDeleteConfirm((prev) => ({ ...prev, isOpen: open }))
				}
				onConfirm={handleDelete}
				title={t("deleteDialog.title")}
				description={t("deleteDialog.description")}
			/>
		</div>
	);
}
