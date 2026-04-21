import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { apartments } from "@/db/schema";
import { getServerUser } from "@/lib/auth-server";
import type { Apartment } from "@/types";

const REVIEWS_MAP: Record<string, number> = {};
const getReviewsCount = (id: string) => REVIEWS_MAP[id] ?? 65;

import "server-only";

// Get only the location of the first apartment for routing
export async function getApartmentLocation() {
	try {
		const result = await db
			.select({
				latitude: apartments.latitude,
				longitude: apartments.longitude,
			})
			.from(apartments)
			.orderBy(asc(apartments.id))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		console.error("Failed to fetch apartment location:", error);
		return null;
	}
}

// Get all apartments for public landing page
export async function getAllApartmentsPublic(): Promise<Apartment[]> {
	try {
		const allApartments = await db.query.apartments.findMany({
			with: {
				images: {
					orderBy: (images, { asc }) => [asc(images.displayOrder)],
				},
			},
			orderBy: (apartments, { asc }) => [asc(apartments.id)],
		});

		return allApartments.map((apt) => {
			return {
				id: apt.id,
				name: apt.name,
				nameEn: apt.nameEn,
				description: apt.description || "",
				descriptionEn: apt.descriptionEn,
				price: apt.pricePerNight,
				maxGuests: apt.capacity,
				beds: apt.beds,
				images:
					apt.images.length > 0
						? apt.images.map((img) => img.imageUrl)
						: [
								"https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=1600",
							],
				reviewsCount: 42,
				rating: 5,
				amenities: [],
				slug: apt.name.toLowerCase().replace(/ /g, "-"),
				latitude: apt.latitude ?? undefined,
				longitude: apt.longitude ?? undefined,
			};
		});
	} catch (error) {
		console.error("Failed to fetch public apartments:", error);
		return [];
	}
}

export async function getApartmentsPublicPaginated(
	page = 1,
	pageSize = 10,
): Promise<{
	apartments: Apartment[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}> {
	try {
		page = Math.max(1, page);
		pageSize = Math.max(1, Math.min(100, pageSize));
		const offset = (page - 1) * pageSize;

		const [apartmentsResult, countResult] = await Promise.all([
			db.query.apartments.findMany({
				with: {
					images: {
						orderBy: (images, { asc }) => [asc(images.displayOrder)],
					},
				},
				orderBy: (apartments, { asc }) => [asc(apartments.id)],
				limit: pageSize,
				offset,
			}),
			db
				.select({ count: sql<number>`cast(count(*) as integer)` })
				.from(apartments),
		]);

		const total = countResult[0]?.count ?? 0;

		const mappedApartments = apartmentsResult.map((apt) => ({
			id: apt.id,
			name: apt.name,
			nameEn: apt.nameEn,
			description: apt.description || "",
			descriptionEn: apt.descriptionEn,
			price: apt.pricePerNight,
			maxGuests: apt.capacity,
			beds: apt.beds,
			images:
				apt.images.length > 0
					? apt.images.map((img) => img.imageUrl)
					: [
							"https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=1600",
						],
			reviewsCount: 42,
			rating: 5,
			amenities: [],
			slug: apt.name.toLowerCase().replace(/ /g, "-"),
			latitude: apt.latitude ?? undefined,
			longitude: apt.longitude ?? undefined,
		}));

		return {
			apartments: mappedApartments,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize),
		};
	} catch (error) {
		console.error("Failed to fetch paginated apartments:", error);
		return { apartments: [], total: 0, page, pageSize, totalPages: 0 };
	}
}

// Get all apartments for admin dashboard
export async function getAllApartmentsAdmin() {
	try {
		const user = await getServerUser();
		if (!user.success) {
			return { success: false, apartments: [] };
		}

		// Use Drizzle relational query to fetch apartments with images in a single query
		const allApartments = await db.query.apartments.findMany({
			with: {
				images: {
					orderBy: (images, { asc }) => [asc(images.displayOrder)],
				},
			},
			orderBy: (apartments, { asc }) => [asc(apartments.id)],
		});

		return {
			success: true,
			apartments: allApartments.map((apt) => ({
				id: apt.id,
				name: apt.name,
				nameEn: apt.nameEn,
				description: apt.description || "",
				descriptionEn: apt.descriptionEn,
				price: apt.pricePerNight,
				maxGuests: apt.capacity,
				beds: apt.beds,
				images:
					apt.images.length > 0
						? apt.images.map((img) => img.imageUrl)
						: ["/images/apartment1.jpg"], // Static fallback
				reviewsCount: 42,
				rating: 5,
				latitude: apt.latitude,
				longitude: apt.longitude,
			})),
		};
	} catch (error) {
		console.error("Failed to fetch apartments:", error);
		return { success: false, apartments: [] };
	}
}

export async function getApartment(id: string) {
	try {
		// Use Drizzle relational query to fetch apartment with images in a single query
		const apartment = await db.query.apartments.findFirst({
			where: eq(apartments.id, id),
			with: {
				images: {
					orderBy: (images, { asc }) => [asc(images.displayOrder)],
				},
			},
		});

		if (!apartment) {
			return { success: false, message: "Apartment not found" };
		}

		return {
			success: true,
			apartment: {
				id: apartment.id,
				name: apartment.name,
				nameEn: apartment.nameEn,
				description: apartment.description || "",
				descriptionEn: apartment.descriptionEn,
				images: apartment.images.map((img) => img.imageUrl),
				amenities: [],
				rating: 5,
				reviewsCount: 42,
				beds: apartment.beds,
				maxGuests: apartment.capacity,
				price: apartment.pricePerNight,
				slug: apartment.name.toLowerCase().replace(/ /g, "-"),
				latitude: apartment.latitude ?? undefined,
				longitude: apartment.longitude ?? undefined,
			},
		};
	} catch (error) {
		console.error("Failed to fetch apartment:", error);
		return { success: false, message: "Failed to fetch apartment" };
	}
}
