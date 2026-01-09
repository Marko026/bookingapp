"use server";

import { z } from "zod";
import { db } from "@/db";
import { apartments, apartmentImages } from "@/db/schema";
import { createSafeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { getApartment as getApartmentDAL, getAllApartmentsAdmin as getAllApartmentsAdminDAL } from "@/dal/apartments";
import { eq } from "drizzle-orm";
import { getServerUser } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { translateToEnglish } from "@/lib/translator";

// Schema for creating an apartment
const createApartmentSchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  pricePerNight: z.string().transform((val) => parseInt(val, 10)),
  capacity: z.string().transform((val) => parseInt(val, 10)),
  imageUrl: z.string().optional(),
  latitude: z.string().optional().transform((val) => val ? parseFloat(val) : null),
  longitude: z.string().optional().transform((val) => val ? parseFloat(val) : null),
  images: z.string().optional().transform((val) => val ? JSON.parse(val) : []),
});

export const createApartment = createSafeAction(createApartmentSchema, async (data) => {
  const user = await getServerUser();
  if (!user.success) {
    throw new Error("Unauthorized");
  }

  // Auto-translate if English fields are missing
  const nameEn = data.nameEn || await translateToEnglish(data.name);
  const descriptionEn = data.descriptionEn || await translateToEnglish(data.description);

  // Insert apartment
  const [newApartment] = await db.insert(apartments).values({
    name: data.name,
    nameEn: nameEn,
    description: data.description,
    descriptionEn: descriptionEn,
    pricePerNight: data.pricePerNight,
    capacity: data.capacity,
    imageUrl: data.imageUrl,
    latitude: data.latitude,
    longitude: data.longitude,
  }).returning({ id: apartments.id });

  if (!newApartment) {
    throw new Error("Failed to create apartment");
  }

  // Insert images if present
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    const imagesToInsert = data.images.map((img: any) => ({
      apartmentId: newApartment.id,
      imageUrl: img.imageUrl,
      altText: img.altText,
      displayOrder: img.displayOrder,
      isCover: img.isCover,
      width: img.width,
      height: img.height,
    }));
    
    await db.insert(apartmentImages).values(imagesToInsert);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  
  return { success: true, apartmentId: newApartment.id };
});

export async function deleteApartmentAction(id: number) {
  try {
    const user = await getServerUser();
    if (!user.success) {
      return { success: false, message: "Unauthorized" };
    }

    // 1. Fetch images to delete from storage
    const images = await db.query.apartmentImages.findMany({
      where: eq(apartmentImages.apartmentId, id),
    });

    // 2. Delete from DB (cascade handling manual here just in case)
    await db.delete(apartmentImages).where(eq(apartmentImages.apartmentId, id));
    await db.delete(apartments).where(eq(apartments.id, id));

    // 3. Delete from Storage using Admin Client (Service Role)
    if (images.length > 0) {
      const supabase = createAdminClient();
      const filesToRemove = images.map(img => {
        // Extract path from URL: .../apartment-images/filename.jpg
        const parts = img.imageUrl.split("/apartment-images/");
        return parts.length > 1 ? parts[1] : null;
      }).filter((p): p is string => p !== null);

      if (filesToRemove.length > 0) {
        await supabase.storage.from("apartment-images").remove(filesToRemove);
      }
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Delete apartment error:", error);
    return { success: false, message: "Failed to delete" };
  }
}

export async function updateApartment(id: number, formData: FormData) {
  try {
    const user = await getServerUser();
    if (!user.success) {
      return { success: false, message: "Unauthorized" };
    }

    const rawData = Object.fromEntries(formData);
    const parsedData = createApartmentSchema.parse(rawData);

    // Auto-translate if English fields are missing
    const nameEn = parsedData.nameEn || await translateToEnglish(parsedData.name);
    const descriptionEn = parsedData.descriptionEn || await translateToEnglish(parsedData.description);

    await db.update(apartments)
      .set({
        name: parsedData.name,
        nameEn: nameEn,
        description: parsedData.description,
        descriptionEn: descriptionEn,
        pricePerNight: parsedData.pricePerNight,
        capacity: parsedData.capacity,
        imageUrl: parsedData.imageUrl,
        latitude: parsedData.latitude,
        longitude: parsedData.longitude,
      })
      .where(eq(apartments.id, id));

      // Handle images if needed (simplified for now to match create logic if re-uploading)
      // In a real app, update might need smarter image diffing

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Update apartment error:", error);
    return { success: false, message: "Failed to update" };
  }
}

// Re-exports from DAL
export const getApartment = async (id: number) => {
  return getApartmentDAL(id);
};

export const getAllApartmentsAdmin = async () => {
  return getAllApartmentsAdminDAL();
};
