"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { attractionImages, attractions } from "@/db/schema";
import { translateToEnglish } from "@/lib/translator";

const attractionSchema = z.object({
	title: z.string().min(2, "Naslov mora imati bar 2 karaktera"),
	titleEn: z.string().optional(),
	description: z.string().optional(),
	descriptionEn: z.string().optional(),
	longDescription: z.string().optional(),
	longDescriptionEn: z.string().optional(),
	distance: z.string().optional(),
	coords: z.string().optional(),
	latitude: z.number().nullable().optional(),
	longitude: z.number().nullable().optional(),
	image: z.string().optional(),
	gallery: z.array(z.string()).optional(),
});

export type AttractionState = {
	success: boolean;
	message?: string;
	errors?: {
		[key: string]: string[];
	};
};

export async function createAttraction(
	prevState: AttractionState,
	formData: FormData,
): Promise<AttractionState> {
	try {
		const galleryJson = formData.get("gallery") as string;

		const rawData = {
			title: formData.get("title"),
			titleEn: formData.get("titleEn"),
			description: formData.get("description"),
			descriptionEn: formData.get("descriptionEn"),
			longDescription: formData.get("longDescription"),
			longDescriptionEn: formData.get("longDescriptionEn"),
			distance: formData.get("distance"),
			coords: formData.get("coords"),
			latitude: formData.get("latitude")
				? Number(formData.get("latitude"))
				: null,
			longitude: formData.get("longitude")
				? Number(formData.get("longitude"))
				: null,
			image: formData.get("image"),
			gallery: galleryJson ? JSON.parse(galleryJson) : [],
			slug: (formData.get("title") as string).toLowerCase().replace(/ /g, "-"),
		};

		const validatedData = attractionSchema.parse(rawData);

        // Auto-translate if English fields are missing
        const titleEn = validatedData.titleEn || await translateToEnglish(validatedData.title);
        const descriptionEn = validatedData.descriptionEn || await translateToEnglish(validatedData.description);
        const longDescriptionEn = validatedData.longDescriptionEn || await translateToEnglish(validatedData.longDescription);

		await db.transaction(async (tx) => {
			const [newAttraction] = await tx
				.insert(attractions)
				.values({
					title: validatedData.title,
					titleEn: titleEn,
					description: validatedData.description,
					descriptionEn: descriptionEn,
					longDescription: validatedData.longDescription,
					longDescriptionEn: longDescriptionEn,
					distance: validatedData.distance,
					coords: validatedData.coords,
					latitude: validatedData.latitude,
					longitude: validatedData.longitude,
					slug: rawData.slug,
					image: validatedData.image,
				})

				.returning();

			if (rawData.gallery && rawData.gallery.length > 0) {
				const imageRecords = rawData.gallery.map(
					(url: string, index: number) => ({
						attractionId: newAttraction.id,
						imageUrl: url,
						displayOrder: index,
					}),
				);
				await tx.insert(attractionImages).values(imageRecords);
			}
		});

		revalidatePath("/admin/dashboard");
		revalidatePath("/");
		return { success: true, message: "Atrakcija uspešno kreirana!" };
	} catch (error) {
		console.error("Create attraction error:", error);
		if (error instanceof z.ZodError) {
			return { success: false, errors: error.flatten().fieldErrors };
		}
		return { success: false, message: "Greška pri kreiranju atrakcije" };
	}
}

export async function deleteAttraction(
	attractionId: number,
): Promise<AttractionState> {
	try {
		// Images will be deleted by cascade if configured, but let's be safe
		await db
			.delete(attractionImages)
			.where(eq(attractionImages.attractionId, attractionId));

		await db.delete(attractions).where(eq(attractions.id, attractionId));

		revalidatePath("/admin/dashboard");
		revalidatePath("/");
		return { success: true, message: "Atrakcija uspešno obrisana!" };
	} catch (error) {
		console.error("Delete attraction error:", error);
		return { success: false, message: "Greška pri brisanju atrakcije" };
	}
}

export async function updateAttraction(
	attractionId: number,
	formData: FormData,
): Promise<AttractionState> {
	try {
		const galleryJson = formData.get("gallery") as string;
		const rawData = {
			title: formData.get("title"),
			titleEn: formData.get("titleEn"),
			description: formData.get("description"),
			descriptionEn: formData.get("descriptionEn"),
			longDescription: formData.get("longDescription"),
			longDescriptionEn: formData.get("longDescriptionEn"),
			distance: formData.get("distance"),
			coords: formData.get("coords"),
			latitude: formData.get("latitude")
				? Number(formData.get("latitude"))
				: null,
			longitude: formData.get("longitude")
				? Number(formData.get("longitude"))
				: null,
			image: formData.get("image"),
			gallery: galleryJson ? JSON.parse(galleryJson) : [],
		};

		const validatedData = attractionSchema.parse(rawData);

        // Auto-translate if English fields are missing
        const titleEn = validatedData.titleEn || await translateToEnglish(validatedData.title);
        const descriptionEn = validatedData.descriptionEn || await translateToEnglish(validatedData.description);
        const longDescriptionEn = validatedData.longDescriptionEn || await translateToEnglish(validatedData.longDescription);

		await db.transaction(async (tx) => {
			await tx
				.update(attractions)
				.set({
					title: validatedData.title,
					titleEn: titleEn,
					description: validatedData.description,
					descriptionEn: descriptionEn,
					longDescription: validatedData.longDescription,
					longDescriptionEn: longDescriptionEn,
					distance: validatedData.distance,
					coords: validatedData.coords,
					latitude: validatedData.latitude,
					longitude: validatedData.longitude,
					image: validatedData.image,
				})
				.where(eq(attractions.id, attractionId));

			// Update gallery
			if (rawData.gallery) {
				// Delete old
				await tx
					.delete(attractionImages)
					.where(eq(attractionImages.attractionId, attractionId));

				// Insert new
				if (rawData.gallery.length > 0) {
					const imageRecords = rawData.gallery.map(
						(url: string, index: number) => ({
							attractionId,
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
		// Revalidate specific attraction page if needed
		// revalidatePath(`/attraction/${slug}`);

		return { success: true, message: "Atrakcija uspešno ažurirana!" };
	} catch (error) {
		console.error("Update attraction error:", error);
		if (error instanceof z.ZodError) {
			return { success: false, errors: error.flatten().fieldErrors };
		}
		return { success: false, message: "Greška pri ažuriranju atrakcije" };
	}
}

import * as attractionsDal from "@/dal/attractions";

export async function getAllAttractions() {
	return await attractionsDal.getAllAttractions();
}

export async function getAttractionBySlug(slug: string) {
	return await attractionsDal.getAttractionBySlug(slug);
}
