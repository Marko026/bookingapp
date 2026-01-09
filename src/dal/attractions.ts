import { eq } from "drizzle-orm";
import { db } from "@/db";
import { attractions } from "@/db/schema";
import "server-only";

export async function getAllAttractions() {
	try {
		const result = await db.query.attractions.findMany({
			with: {
				images: {
					orderBy: (images, { asc }) => [asc(images.displayOrder)],
				},
			},
		});

		return result.map((attr) => ({
			...attr,
			id: attr.id.toString(),
			gallery: attr.images.map((img) => img.imageUrl),
		}));
	} catch (error) {
		console.error("Failed to fetch attractions:", error);
		return [];
	}
}

export async function getAttractionBySlug(slug: string) {
	try {
		const attraction = await db.query.attractions.findFirst({
			where: eq(attractions.slug, slug),
			with: {
				images: {
					orderBy: (images, { asc }) => [asc(images.displayOrder)],
				},
			},
		});

		if (!attraction) return null;

		return {
			...attraction,
			id: attraction.id.toString(),
			gallery: attraction.images.map((img) => img.imageUrl),
		};
	} catch (error) {
		console.error("Failed to fetch attraction by slug:", error);
		return null;
	}
}
