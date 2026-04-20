import { eq, sql } from "drizzle-orm";
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
			distance: attr.distance ?? "",
			gallery: attr.images.map((img) => img.imageUrl),
		}));
	} catch (error) {
		console.error("Failed to fetch attractions:", error);
		return [];
	}
}

export async function getAttractionById(id: number) {
	try {
		const attraction = await db.query.attractions.findFirst({
			where: eq(attractions.id, id),
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
			distance: attraction.distance ?? "",
			gallery: attraction.images.map((img) => img.imageUrl),
		};
	} catch (error) {
		console.error("Failed to fetch attraction by id:", error);
		return null;
	}
}

export async function getAttractionByUuid(uuid: string) {
	try {
		const attraction = await db.query.attractions.findFirst({
			where: eq(attractions.uuid, uuid),
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
			distance: attraction.distance ?? "",
			gallery: attraction.images.map((img) => img.imageUrl),
		};
	} catch (error) {
		console.error("Failed to fetch attraction by uuid:", error);
		return null;
	}
}

export async function getAttractionsPaginated(
	page = 1,
	pageSize = 10,
): Promise<{
	attractions: Array<{
		id: string;
		title: string;
		titleEn: string | null;
		description: string | null;
		descriptionEn: string | null;
		longDescription: string | null;
		longDescriptionEn: string | null;
		distance: string;
		coords: string | null;
		latitude: number | null;
		longitude: number | null;
		slug: string;
		image: string | null;
		createdAt: Date | null;
		gallery: string[];
	}>;
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}> {
	try {
		page = Math.max(1, page);
		pageSize = Math.max(1, Math.min(100, pageSize));
		const offset = (page - 1) * pageSize;

		const [result, countResult] = await Promise.all([
			db.query.attractions.findMany({
				with: {
					images: {
						orderBy: (images, { asc }) => [asc(images.displayOrder)],
					},
				},
				limit: pageSize,
				offset,
			}),
			db
				.select({ count: sql<number>`cast(count(*) as integer)` })
				.from(attractions),
		]);

		const total = countResult[0]?.count ?? 0;

		const mappedAttractions = result.map((attr) => ({
			...attr,
			id: attr.id.toString(),
			distance: attr.distance ?? "",
			gallery: attr.images.map((img) => img.imageUrl),
		}));

		return {
			attractions: mappedAttractions,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	} catch (error) {
		console.error("Failed to fetch paginated attractions:", error);
		return { attractions: [], total: 0, page, pageSize, totalPages: 0 };
	}
}

export async function getAttractionBySlug(slug: string) {
	try {
		// Try exact slug first, then try with trailing hyphens stripped
		const slugsToTry = [slug, slug.replace(/-+$/g, "")].filter(Boolean);

		for (const s of slugsToTry) {
			const attraction = await db.query.attractions.findFirst({
				where: eq(attractions.slug, s),
				with: {
					images: {
						orderBy: (images, { asc }) => [asc(images.displayOrder)],
					},
				},
			});

			if (attraction) {
				return {
					...attraction,
					id: attraction.id.toString(),
					distance: attraction.distance ?? "",
					gallery: attraction.images.map((img) => img.imageUrl),
				};
			}
		}

		return null;
	} catch (error) {
		console.error("Failed to fetch attraction by slug:", error);
		return null;
	}
}
