import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { apartmentImages, apartments } from "@/db/schema";
import { deleteImage } from "@/lib/image-upload";

export async function deleteApartment(apartmentId: string) {
	try {
		const id = parseInt(apartmentId);

		// Fetch images to delete from storage
		const images = await db.query.apartmentImages.findMany({
			where: eq(apartmentImages.apartmentId, id),
		});

		console.log(`🗑️ Deleting apartment ${id} with ${images.length} images`);

		// Delete apartment from database (cascade will delete images from DB)
		await db.delete(apartments).where(eq(apartments.id, id));

		// Delete images from Supabase Storage
		for (const img of images) {
			try {
				const path = img.imageUrl.split("/").pop();
				if (path) {
					await deleteImage(path);
					console.log(`✅ Deleted image: ${path}`);
				}
			} catch (error) {
				console.error(`Failed to delete image:`, error);
				// Continue even if image deletion fails
			}
		}

		revalidatePath("/admin");
		revalidatePath("/");

		return { success: true, message: "Apartment deleted successfully!" };
	} catch (error) {
		console.error("Delete apartment error:", error);
		return { success: false, message: "Failed to delete apartment" };
	}
}
