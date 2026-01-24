import { db } from "@/db";
import { apartmentImages, apartments } from "@/db/schema";
import type { Apartment } from "@/types";
import { asc, eq } from "drizzle-orm";
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
		// Fetch all apartments
		const allApartments = await db
			.select()
			.from(apartments)
			.orderBy(asc(apartments.id));

		// Fetch all images for these apartments
		const allImages = await db.query.apartmentImages.findMany({
			orderBy: (images, { asc }) => [asc(images.displayOrder)],
		});

		return allApartments.map((apt) => {
			const aptImages = allImages.filter((img) => img.apartmentId === apt.id);

			return {
				id: apt.id.toString(),
				name: apt.name,
				nameEn: apt.nameEn,
				description: apt.description || "",
				descriptionEn: apt.descriptionEn,
				price: apt.pricePerNight,
				maxGuests: apt.capacity,
				beds: Math.ceil(apt.capacity / 2), // Estimate beds
				images:
					aptImages.length > 0
						? aptImages.map((img) => img.imageUrl)
						: [
								"https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=1600",
							], // Fallback
				reviewsCount: 42, // Placeholder
				rating: 4.9, // Placeholder
				amenities: ["WiFi", "Parking", "Klima", "Terasa", "Kuhinja", "TV"], // Placeholder
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

import { getServerUser } from "@/lib/auth-server";

// Get all apartments for admin dashboard
export async function getAllApartmentsAdmin() {
	try {
		const user = await getServerUser();
		if (!user.success) {
			return { success: false, apartments: [] };
		}

		const allApartments = await db
			.select()
			.from(apartments)
			.orderBy(asc(apartments.id));

		const allImages = await db.query.apartmentImages.findMany({
			orderBy: (images, { asc }) => [asc(images.displayOrder)],
		});

		return {
			success: true,
			apartments: allApartments.map((apt) => {
				const aptImages = allImages.filter((img) => img.apartmentId === apt.id);
				return {
					id: apt.id.toString(),
					name: apt.name,
					nameEn: apt.nameEn,
					description: apt.description || "",
					descriptionEn: apt.descriptionEn,
					price: apt.pricePerNight,
					maxGuests: apt.capacity,
					images:
						aptImages.length > 0
							? aptImages.map((img) => img.imageUrl)
							: ["/images/apartment1.jpg"], // Static fallback
					reviewsCount: 0,
					latitude: apt.latitude,
					longitude: apt.longitude,
				};
			}),
		};
	} catch (error) {
		console.error("Failed to fetch apartments:", error);
		return { success: false, apartments: [] };
	}
}

export async function getApartment(id: number) {
	try {
		const result = await db
			.select()
			.from(apartments)
			.where(eq(apartments.id, id))
			.limit(1);

		if (result.length === 0) {
			return { success: false, message: "Apartment not found" };
		}

		const apartment = result[0];

		const aptImages = await db.query.apartmentImages.findMany({
			where: eq(apartmentImages.apartmentId, id),
			orderBy: (images, { asc }) => [asc(images.displayOrder)],
		});

		return {
			success: true,
			apartment: {
				id: apartment.id.toString(),
				name: apartment.name,
				nameEn: apartment.nameEn,
				description: apartment.description || "",
				descriptionEn: apartment.descriptionEn,
				images: aptImages.map((img) => img.imageUrl),
				amenities: ["WiFi", "Parking", "Klima", "Terasa", "Kuhinja", "TV"], // Default amenities for now
				rating: 4.9, // Default rating
				reviewsCount: 0, // Default reviews
				beds: 2, // Default beds (should be in DB)
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
