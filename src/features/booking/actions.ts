"use server";

import {
	and,
	desc,
	eq,
	gt,
	type InferSelectModel,
	lt,
	ne,
	sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { apartments, bookings } from "@/db/schema";
import { getServerUser } from "@/lib/auth-server";
import {
	sendApprovalEmail,
	sendBookingEmails,
	sendCancellationEmail,
} from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSafeAction } from "@/lib/safe-action";

const createBookingSchema = z.object({
	apartmentId: z.string().uuid(),
	guestName: z.string().min(1).max(200),
	guestEmail: z.string().email().max(255),
	phone: z.string().max(50).optional(),
	checkIn: z.string(), // ISO date
	checkOut: z.string(), // ISO date
	totalPrice: z.coerce.number(),
	question: z.string().max(2000).optional(),
});

type BookingType = InferSelectModel<typeof bookings>;

export const createBooking = createSafeAction(
	createBookingSchema,
	async (data) => {
		const rateLimit = checkRateLimit(`booking:${data.guestEmail}`, {
			maxRequests: 3,
			windowMs: 300_000,
		});
		if (!rateLimit.allowed) {
			return {
				success: false,
				message:
					"Previše pokušaja rezervacije. Pokušajte ponovo za nekoliko minuta.",
			};
		}

		try {
			return await db.transaction(async (tx) => {
				// Check for overlapping bookings
				const overlap = await tx.query.bookings.findFirst({
					where: and(
						eq(bookings.apartmentId, data.apartmentId),
						ne(bookings.status, "cancelled"),
						lt(bookings.checkIn, data.checkOut),
						gt(bookings.checkOut, data.checkIn),
					),
				});

				if (overlap) {
					return { success: false, message: "Izabrani termin je već zauzet." };
				}

				await tx.insert(bookings).values({
					apartmentId: data.apartmentId,
					guestName: data.guestName,
					guestEmail: data.guestEmail,
					checkIn: data.checkIn,
					checkOut: data.checkOut,
					totalPrice: data.totalPrice,
					status: "pending",
				});

				const apartment = await tx.query.apartments.findFirst({
					where: eq(apartments.id, data.apartmentId),
					with: {
						images: true,
					},
				});

				if (apartment) {
					const firstImage =
						apartment.images?.[0]?.imageUrl || apartment.imageUrl || "";

					await sendBookingEmails({
						guestName: data.guestName,
						guestEmail: data.guestEmail,
						phone: data.phone,
						// ovde prosleđujemo kompletan dodatni tekst iz forme
						question: data.question,
						checkIn: data.checkIn,
						checkOut: data.checkOut,
						totalPrice: data.totalPrice,
						apartmentId: data.apartmentId,
						apartmentName: apartment.name,
						apartmentImage: firstImage,
					});
				}

				return { success: true };
			});
		} catch (error) {
			console.error("Booking creation error:", error);
			return {
				success: false,
				message: "Došlo je do greške prilikom rezervacije.",
			};
		} finally {
			revalidatePath("/admin");
		}
	},
);

export async function getApartmentBookings(
	apartmentId: string,
): Promise<{ success: boolean; bookings: BookingType[] }> {
	try {
		const result = await db.query.bookings.findMany({
			where: eq(bookings.apartmentId, apartmentId),
			orderBy: (bookings, { desc }) => [desc(bookings.checkIn)],
		});

		return {
			success: true,
			bookings: result,
		};
	} catch (error) {
		console.error("Failed to fetch bookings:", error);
		return { success: false, bookings: [] };
	}
}

export async function getAllBookings(page = 1, pageSize = 10) {
	try {
		const user = await getServerUser();
		if (!user.success) {
			return {
				success: false,
				message: "Unauthorized",
				bookings: [],
				pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
			};
		}

		page = Math.max(1, page);
		pageSize = Math.max(1, Math.min(100, pageSize));
		const offset = (page - 1) * pageSize;

		const [result, countResult] = await Promise.all([
			db.query.bookings.findMany({
				orderBy: [desc(bookings.createdAt)],
				limit: pageSize,
				offset,
				with: {
					apartment: true,
				},
			}),
			db
				.select({ count: sql<number>`cast(count(*) as integer)` })
				.from(bookings),
		]);

		const total = countResult[0]?.count ?? 0;

		return {
			success: true,
			bookings: result,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize),
			},
		};
	} catch (error) {
		console.error("Failed to fetch bookings:", error);
		return {
			success: false,
			message: "Failed to fetch bookings",
			bookings: [],
			pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
		};
	}
}

export async function deleteBooking(id: number) {
	try {
		const user = await getServerUser();
		if (!user.success) {
			return { success: false, message: "Unauthorized" };
		}
		await db.delete(bookings).where(eq(bookings.id, id));
		revalidatePath("/admin");
		return { success: true };
	} catch (_error) {
		return { success: false, message: "Failed to delete" };
	}
}

export async function updateBooking(
	id: number,
	checkIn: string,
	checkOut: string,
	totalPrice: number,
) {
	try {
		const user = await getServerUser();
		if (!user.success) {
			return { success: false, message: "Unauthorized" };
		}

		return await db.transaction(async (tx) => {
			const booking = await tx.query.bookings.findFirst({
				where: eq(bookings.id, id),
			});

			if (!booking) {
				return { success: false, message: "Booking not found" };
			}

			const overlap = await tx.query.bookings.findFirst({
				where: and(
					eq(bookings.apartmentId, booking.apartmentId),
					ne(bookings.status, "cancelled"),
					ne(bookings.id, id),
					lt(bookings.checkIn, checkOut),
					gt(bookings.checkOut, checkIn),
				),
			});

			if (overlap) {
				return { success: false, message: "Izabrani termin je već zauzet." };
			}

			await tx
				.update(bookings)
				.set({
					checkIn,
					checkOut,
					totalPrice,
				})
				.where(eq(bookings.id, id));

			revalidatePath("/admin");
			return { success: true };
		});
	} catch (error) {
		console.error("Failed to update booking:", error);
		return { success: false, message: "Failed to update" };
	}
}

export async function updateBookingStatusAction(
	id: number,
	status: "confirmed" | "cancelled",
) {
	try {
		const user = await getServerUser();
		if (!user.success) {
			return { success: false, message: "Unauthorized" };
		}

		const booking = await db.query.bookings.findFirst({
			where: eq(bookings.id, id),
			with: {
				apartment: {
					with: {
						images: true,
					},
				},
			},
		});

		if (!booking) {
			return { success: false, message: "Booking not found" };
		}

		await db.update(bookings).set({ status }).where(eq(bookings.id, id));

		revalidatePath("/admin");

		const apartment = booking.apartment;
		if (apartment) {
			const firstImage =
				apartment.images?.[0]?.imageUrl || apartment.imageUrl || "";

			const bookingData = {
				guestName: booking.guestName,
				guestEmail: booking.guestEmail,
				checkIn: booking.checkIn,
				checkOut: booking.checkOut,
				totalPrice: booking.totalPrice,
				apartmentId: booking.apartmentId,
				apartmentName: apartment.name,
				apartmentImage: firstImage,
			};

			try {
				if (status === "confirmed") {
					await sendApprovalEmail(bookingData);
				} else if (status === "cancelled") {
					await sendCancellationEmail(bookingData);
				}
			} catch (emailError) {
				console.error("Failed to send notification email:", emailError);
				return {
					success: true,
					message: "Status updated, but notification email could not be sent.",
				};
			}
		}

		return { success: true };
	} catch (error) {
		console.error("Failed to update booking status:", error);
		return { success: false, message: "Failed to update status" };
	}
}

// Export State type if components need it
export type State = {
	success: boolean;
	message?: string;
	errors?: Record<string, string[]>;
};
