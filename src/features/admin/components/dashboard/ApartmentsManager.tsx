"use client";

import { useState, useEffect } from "react";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminApartments } from "@/features/admin/hooks/useAdminApartments";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { ImageUpload } from "@/components/ImageUpload";
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { stripHtml } from "@/lib/utils";
import type { Apartment } from "@/types";

export function ApartmentsManager() {
	const { apartments, isLoading, fetchApartments, removeApartment, saveApartment } =
		useAdminApartments();
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
			formData.append("nameEn", editingApartment.nameEn || "");
			formData.append("description", editingApartment.description);
			formData.append("descriptionEn", editingApartment.descriptionEn || "");
			formData.append("pricePerNight", String(editingApartment.price));
			formData.append("capacity", String(editingApartment.maxGuests));

			const imagesData = editingApartment.images.map((url, index) => ({
				imageUrl: url,
				altText: `${editingApartment.name} - Slika ${index + 1}`,
				displayOrder: index,
				isCover: index === 0,
			}));
			formData.append("images", JSON.stringify(imagesData));

			const success = await saveApartment(Number(editingApartment.id), formData);
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
		return <div className="p-8 text-center text-gray-500">Loading apartments...</div>;
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-serif font-bold text-gray-900">
					Manage Apartments
				</h2>
				<Button
					onClick={() => router.push("/admin/apartments/add")}
					className="bg-black text-white rounded-xl"
				>
					<Plus size={20} className="mr-2" /> Add New
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
									<Tabs defaultValue="sr" className="w-full">
										<TabsList className="bg-gray-100 p-1 rounded-xl mb-4">
											<TabsTrigger
												value="sr"
												className="rounded-lg data-[state=active]:bg-white"
											>
												SR
											</TabsTrigger>
											<TabsTrigger
												value="en"
												className="rounded-lg data-[state=active]:bg-white"
											>
												EN
											</TabsTrigger>
										</TabsList>

										<TabsContent value="sr" className="space-y-4">
											<div className="grid grid-cols-2 gap-8">
												<div className="space-y-2">
													<label className="text-xs font-bold uppercase text-gray-400">
														Naziv (SR)
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
														Cena po noćenju
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
												label="Opis (SR)"
												value={editingApartment.description}
												onChange={(value) =>
													setEditingApartment({
														...editingApartment,
														description: value,
													})
												}
											/>
										</TabsContent>

										<TabsContent value="en" className="space-y-4">
											<div className="space-y-2">
												<label className="text-xs font-bold uppercase text-gray-400">
													Name (EN)
												</label>
												<Input
													value={editingApartment.nameEn || ""}
													onChange={(e) =>
														setEditingApartment({
															...editingApartment,
															nameEn: e.target.value,
														})
													}
													placeholder="English name"
												/>
											</div>
											<RichTextEditor
												label="Description (EN)"
												value={editingApartment.descriptionEn || ""}
												onChange={(value) =>
													setEditingApartment({
														...editingApartment,
														descriptionEn: value,
													})
												}
												placeholder="English description"
											/>
										</TabsContent>
									</Tabs>

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
											Cancel
										</Button>
										<Button onClick={handleSave}>
											<Save size={20} className="mr-2" /> Save
										</Button>
									</div>
								</div>
							) : (
								<div className="flex justify-between items-start gap-8">
									<div className="flex gap-8">
										<img
											src={apt.images[0]}
											className="w-40 h-40 object-cover rounded-2xl"
											alt={apt.name}
										/>
										<div>
											<h3 className="text-2xl font-serif font-bold">
												{apt.name}
											</h3>
											<p className="text-gray-600">
												{stripHtml(apt.description)}
											</p>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											onClick={() => setEditingApartment(apt)}
										>
											Edit
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
											Delete
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
				title="Delete Apartment"
				description="Are you sure you want to delete this apartment? This action cannot be undone."
			/>
		</div>
	);
}
