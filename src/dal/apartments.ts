import { eq } from "drizzle-orm";
import { db } from "@/db";
import { apartments } from "@/db/schema";
import type { Apartment } from "@/types";
import "server-only";

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

		return allApartments.map((apt) => ({
			id: apt.id.toString(),
			name: apt.name,
			nameEn: apt.nameEn,
			description: apt.description || "",
			descriptionEn: apt.descriptionEn,
			price: apt.pricePerNight,
			maxGuests: apt.capacity,
			beds: Math.ceil(apt.capacity / 2), // Estimate beds
			images:
				apt.images.length > 0
					? apt.images.map((img) => img.imageUrl)
					: [
							"https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=1600",
						], // Fallback
			reviewsCount: 42, // Placeholder
			rating: 4.9, // Placeholder
			amenities: ["WiFi", "Parking", "Klima", "Terasa", "Kuhinja", "TV"], // Placeholder
			slug: apt.name.toLowerCase().replace(/ /g, "-"),
			latitude: apt.latitude ?? undefined,
			longitude: apt.longitude ?? undefined,
		}));
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

		const allApartments = await db.query.apartments.findMany({
			with: {
				images: {
					orderBy: (images, { asc }) => [asc(images.displayOrder)],
				},
			},
		});

		return {
			success: true,
			apartments: allApartments.map((apt) => ({
				id: apt.id.toString(),
				name: apt.name,
				nameEn: apt.nameEn,
				description: apt.description || "",
				descriptionEn: apt.descriptionEn,
				price: apt.pricePerNight,
				maxGuests: apt.capacity,
				images:
					apt.images.length > 0
						? apt.images.map((img) => img.imageUrl)
						: ["/images/apartment1.jpg"], // Static fallback
				reviewsCount: 0,
				latitude: apt.latitude,
				longitude: apt.longitude,
			})),
		};
	} catch (error) {
		console.error("Failed to fetch apartments:", error);
		return { success: false, apartments: [] };
	}
}

export async function getApartment(id: number) {
	try {
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
				id: apartment.id.toString(),
				name: apartment.name,
				nameEn: apartment.nameEn,
				description: apartment.description || "",
				descriptionEn: apartment.descriptionEn,
				images: apartment.images.map((img) => img.imageUrl),
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
