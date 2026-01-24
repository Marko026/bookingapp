"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
	getAllApartmentsAdmin as getAllApartmentsAdminDAL,
	getApartment as getApartmentDAL,
} from "@/dal/apartments";
import { db } from "@/db";
import { apartmentImages, apartments } from "@/db/schema";
import { getServerUser } from "@/lib/auth-server";
import { createSafeAction } from "@/lib/safe-action";
import { createAdminClient } from "@/lib/supabase-admin";
import { translateToEnglish } from "@/lib/translator";
import {
	createApartmentActionSchema,
	deleteApartmentActionSchema,
	updateApartmentActionSchema,
} from "./schemas";

export const createApartment = createSafeAction(
	createApartmentActionSchema,
	async (data) => {
		const user = await getServerUser();
		if (!user.success) {
			throw new Error("Unauthorized");
		}

		// Auto-translate if English fields are missing
		const nameEn = data.nameEn || (await translateToEnglish(data.name));
		const descriptionEn =
			data.descriptionEn || (await translateToEnglish(data.description || ""));

		// Insert apartment
		const [newApartment] = await db
			.insert(apartments)
			.values({
				name: data.name,
				nameEn: nameEn,
				description: data.description,
				descriptionEn: descriptionEn,
				pricePerNight: data.pricePerNight,
				capacity: data.capacity,
				imageUrl: data.imageUrl,
				latitude: data.latitude,
				longitude: data.longitude,
			})
			.returning({ id: apartments.id });

		if (!newApartment) {
			throw new Error("Failed to create apartment");
		}

		// Insert images if present
		if (data.images && Array.isArray(data.images) && data.images.length > 0) {
			const imagesToInsert = data.images.map((img: any) => ({
				apartmentId: newApartment.id,
				imageUrl: img.imageUrl,
				altText: img.altText,
				displayOrder: img.displayOrder,
				isCover: img.isCover,
				width: img.width,
				height: img.height,
			}));

			await db.insert(apartmentImages).values(imagesToInsert);
		}

		revalidatePath("/admin");
		revalidatePath("/");

		return { success: true, apartmentId: newApartment.id };
	},
);

export const deleteApartmentAction = createSafeAction(
	deleteApartmentActionSchema,
	async ({ id }) => {
		const user = await getServerUser();
		if (!user.success) {
			throw new Error("Unauthorized");
		}

		// 1. Fetch images to delete from storage
		const images = await db.query.apartmentImages.findMany({
			where: eq(apartmentImages.apartmentId, id),
		});

		// 2. Delete from DB (cascade handling manual here just in case)
		await db.delete(apartmentImages).where(eq(apartmentImages.apartmentId, id));
		await db.delete(apartments).where(eq(apartments.id, id));

		// 3. Delete from Storage using Admin Client (Service Role)
		if (images.length > 0) {
			const supabase = createAdminClient();
			const filesToRemove = images
				.map((img) => {
					// Extract path from URL: .../apartment-images/filename.jpg
					const parts = img.imageUrl.split("/apartment-images/");
					return parts.length > 1 ? parts[1] : null;
				})
				.filter((p): p is string => p !== null);

			if (filesToRemove.length > 0) {
				await supabase.storage.from("apartment-images").remove(filesToRemove);
			}
		}

		revalidatePath("/admin");
		return { success: true };
	},
);

export const updateApartment = createSafeAction(
	updateApartmentActionSchema,
	async (data) => {
		const user = await getServerUser();
		if (!user.success) {
			throw new Error("Unauthorized");
		}

		// Auto-translate if English fields are missing
		const nameEn = data.nameEn || (await translateToEnglish(data.name));
		const descriptionEn =
			data.descriptionEn || (await translateToEnglish(data.description || ""));

		await db
			.update(apartments)
			.set({
				name: data.name,
				nameEn: nameEn,
				description: data.description,
				descriptionEn: descriptionEn,
				pricePerNight: data.pricePerNight,
				capacity: data.capacity,
				imageUrl: data.imageUrl,
				latitude: data.latitude,
				longitude: data.longitude,
			})
			.where(eq(apartments.id, data.id));

		revalidatePath("/admin");
		return { success: true };
	},
);

// Re-exports from DAL
export const getApartment = async (id: number) => {
	return getApartmentDAL(id);
};

export const getAllApartmentsAdmin = async () => {
	return getAllApartmentsAdminDAL();
};
