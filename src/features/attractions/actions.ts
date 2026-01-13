"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { attractionImages, attractions } from "@/db/schema";
import { getServerUser } from "@/lib/auth-server";
import { createSafeAction } from "@/lib/safe-action";
import { translateToEnglish } from "@/lib/translator";
import {
	createAttractionActionSchema,
	deleteAttractionActionSchema,
	updateAttractionActionSchema,
} from "./schemas";

export const createAttraction = createSafeAction(
	createAttractionActionSchema,
	async (data) => {
		const user = await getServerUser();
		if (!user.success) {
			throw new Error("Unauthorized");
		}

		// Auto-translate if English fields are missing
		const titleEn = data.titleEn || (await translateToEnglish(data.title));
		const descriptionEn =
			data.descriptionEn || (await translateToEnglish(data.description || ""));
		const longDescriptionEn =
			data.longDescriptionEn ||
			(await translateToEnglish(data.longDescription || ""));

		await db.transaction(async (tx) => {
			const [newAttraction] = await tx
				.insert(attractions)
				.values({
					title: data.title,
					titleEn: titleEn,
					description: data.description,
					descriptionEn: descriptionEn,
					longDescription: data.longDescription,
					longDescriptionEn: longDescriptionEn,
					distance: data.distance,
					coords: data.coords,
					latitude: data.latitude,
					longitude: data.longitude,
					slug: data.slug,
					image: data.image,
				})
				.returning();

			if (data.gallery && data.gallery.length > 0) {
				const imageRecords = data.gallery.map((url: string, index: number) => ({
					attractionId: newAttraction.id,
					imageUrl: url,
					displayOrder: index,
				}));
				await tx.insert(attractionImages).values(imageRecords);
			}
		});

		revalidatePath("/admin/dashboard");
		revalidatePath("/");
		return { success: true };
	},
);

export const updateAttraction = createSafeAction(
	updateAttractionActionSchema,
	async (data) => {
		const user = await getServerUser();
		if (!user.success) {
			throw new Error("Unauthorized");
		}

		// Auto-translate if English fields are missing
		const titleEn = data.titleEn || (await translateToEnglish(data.title));
		const descriptionEn =
			data.descriptionEn || (await translateToEnglish(data.description || ""));
		const longDescriptionEn =
			data.longDescriptionEn ||
			(await translateToEnglish(data.longDescription || ""));

		await db.transaction(async (tx) => {
			await tx
				.update(attractions)
				.set({
					title: data.title,
					titleEn: titleEn,
					description: data.description,
					descriptionEn: descriptionEn,
					longDescription: data.longDescription,
					longDescriptionEn: longDescriptionEn,
					distance: data.distance,
					coords: data.coords,
					latitude: data.latitude,
					longitude: data.longitude,
					image: data.image,
				})
				.where(eq(attractions.id, data.id));

			if (data.gallery) {
				// Delete old
				await tx
					.delete(attractionImages)
					.where(eq(attractionImages.attractionId, data.id));

				// Insert new
				if (data.gallery.length > 0) {
					const imageRecords = data.gallery.map(
						(url: string, index: number) => ({
							attractionId: data.id,
							imageUrl: url,
							displayOrder: index,
						}),
					);
					await tx.insert(attractionImages).values(imageRecords);
				}
			}
		});

		revalidatePath("/admin/dashboard");
		revalidatePath("/");
		return { success: true };
	},
);

export const deleteAttraction = createSafeAction(
	deleteAttractionActionSchema,
	async ({ id }) => {
		const user = await getServerUser();
		if (!user.success) {
			throw new Error("Unauthorized");
		}

		await db.transaction(async (tx) => {
			await tx
				.delete(attractionImages)
				.where(eq(attractionImages.attractionId, id));

			await tx.delete(attractions).where(eq(attractions.id, id));
		});

		revalidatePath("/admin/dashboard");
		revalidatePath("/");
		return { success: true };
	},
);

import * as attractionsDal from "@/dal/attractions";

export async function getAllAttractions() {
	return await attractionsDal.getAllAttractions();
}

export async function getAttractionBySlug(slug: string) {
	return await attractionsDal.getAttractionBySlug(slug);
}
