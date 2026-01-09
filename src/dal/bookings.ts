import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import "server-only";

export async function getApartmentBookings(apartmentId: number) {
	try {
		const apartmentBookings = await db
			.select()
			.from(bookings)
			.where(eq(bookings.apartmentId, apartmentId));

		return { success: true, bookings: apartmentBookings };
	} catch (error) {
		console.error("Failed to fetch apartment bookings:", error);
		return {
			success: false,
			bookings: [],
			message: "Failed to fetch bookings",
		};
	}
}

export async function getAllBookings() {
	try {
		const allBookings = await db.select().from(bookings);
		return { success: true, bookings: allBookings };
	} catch (error) {
		console.error("Failed to fetch all bookings:", error);
		return {
			success: false,
			bookings: [],
			message: "Failed to fetch bookings",
		};
	}
}
