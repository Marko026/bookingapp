"use server";

import { z } from "zod";
import { db } from "@/db";
import { bookings, apartments } from "@/db/schema";
import { createSafeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { eq, desc, and, ne, lt, gt, type InferSelectModel } from "drizzle-orm";
import { getServerUser } from "@/lib/auth-server";
import { sendBookingEmails } from "@/lib/email";

const createBookingSchema = z.object({
  apartmentId: z.coerce.number(),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  phone: z.string().optional(),
  checkIn: z.string(), // ISO date
  checkOut: z.string(), // ISO date
  totalPrice: z.coerce.number(),
  // Dodatni tekst iz forme (poruka gosta)
  question: z.string().optional(),
});

type BookingType = InferSelectModel<typeof bookings>;

export const createBooking = createSafeAction(createBookingSchema, async (data) => {
  try {
    return await db.transaction(async (tx) => {
      // Check for overlapping bookings
      const overlap = await tx.query.bookings.findFirst({
        where: and(
          eq(bookings.apartmentId, data.apartmentId),
          ne(bookings.status, "cancelled"),
          lt(bookings.checkIn, data.checkOut),
          gt(bookings.checkOut, data.checkIn)
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
        const firstImage = apartment.images?.[0]?.imageUrl || apartment.imageUrl || "";

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
    return { success: false, message: "Došlo je do greške prilikom rezervacije." };
  } finally {
    revalidatePath("/admin");
  }
});

export async function getApartmentBookings(apartmentId: number): Promise<{ success: boolean; bookings: BookingType[] }> {
  try {
    const result = await db.query.bookings.findMany({
      where: eq(bookings.apartmentId, apartmentId),
      orderBy: (bookings, { desc }) => [desc(bookings.checkIn)],
    });
    
    return { 
      success: true, 
      bookings: result 
    };
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return { success: false, bookings: [] };
  }
}

import { sql } from "drizzle-orm";

export async function getAllBookings(page = 1, pageSize = 10) {
  try {
    const offset = (page - 1) * pageSize;

    // Fetch data with pagination
    const result = await db.query.bookings.findMany({
      orderBy: [desc(bookings.createdAt)],
      limit: pageSize,
      offset: offset,
      with: {
        apartment: true,
      }
    });

    // Fetch total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(bookings);
    
    return { 
      success: true, 
      bookings: result,
      pagination: {
        page,
        pageSize,
        total: countResult.count,
        totalPages: Math.ceil(countResult.count / pageSize)
      }
    };
  } catch (error) {
    return { success: false, bookings: [] };
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
  } catch (error) {
    return { success: false, message: "Failed to delete" };
  }
}

export async function updateBooking(id: number, checkIn: string, checkOut: string, totalPrice: number) {
  try {
    const user = await getServerUser();
    if (!user.success) {
      return { success: false, message: "Unauthorized" };
    }

    await db.update(bookings)
      .set({
        checkIn,
        checkOut,
        totalPrice,
      })
      .where(eq(bookings.id, id));
      
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to update" };
  }
}

export async function updateBookingStatusAction(id: number, status: "confirmed" | "cancelled") {
  try {
    const user = await getServerUser();
    if (!user.success) {
      return { success: false, message: "Unauthorized" };
    }
    
    await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id));
      
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to update status" };
  }
}

// Export State type if components need it
export type State = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};
