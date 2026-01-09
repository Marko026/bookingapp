"use client";

import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase";
import { compressImage, getImageDimensions } from "./image-compression";
import { validateImageFile } from "./image-validation";

export interface UploadedImage {
	url: string;
	path: string;
	width: number;
	height: number;
}

export { validateImageFile };

/**
 * Upload image to Supabase Storage with automatic compression
 * @param file - Image file to upload
 * @param bucket - Supabase storage bucket name (default: 'apartment-images')
 * @returns Promise with uploaded image details
 */
export async function uploadImage(
	file: File,
	bucket: string = "apartment-images",
): Promise<UploadedImage> {
	const supabase = createClient();

	// Validate
	const validation = validateImageFile(file);
	if (!validation.valid) {
		throw new Error(validation.error || "Invalid image file");
	}

	// Compress image before upload
	console.log("🗜️ Compressing image...");
	const compressedBlob = await compressImage(file);

	// Create new file from compressed blob
	const compressedFile = new File(
		[compressedBlob],
		file.name.replace(/\.[^.]+$/, ".jpg"), // Force .jpg extension
		{ type: "image/jpeg" },
	);

	// Log compression results
	const originalSize = (file.size / 1024 / 1024).toFixed(2);
	const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
	const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(0);
	console.log(
		`✅ Compressed: ${originalSize}MB → ${compressedSize}MB (${savings}% smaller)`,
	);

	// Get dimensions from compressed image
	const dimensions = await getImageDimensions(compressedFile);

	// Generate unique filename
	const fileExt = "jpg"; // Always use jpg after compression
	const fileName = `${uuidv4()}.${fileExt}`;
	const filePath = `${fileName}`;

	// Upload compressed file to Supabase Storage
	const { data, error } = await supabase.storage
		.from(bucket)
		.upload(filePath, compressedFile, {
			cacheControl: "31536000", // 1 year cache
			upsert: false,
		});

	if (error) {
		throw new Error(`Upload failed: ${error.message}`);
	}

	// Get public URL
	const {
		data: { publicUrl },
	} = supabase.storage.from(bucket).getPublicUrl(data.path);

	console.log("✅ Image uploaded successfully:");
	console.log("  Path:", data.path);
	console.log("  Public URL:", publicUrl);

	return {
		url: publicUrl,
		path: data.path,
		width: dimensions.width,
		height: dimensions.height,
	};
}

/**
 * Upload multiple images at once
 */
export async function uploadMultipleImages(
	files: File[],
	bucket: string = "apartment-images",
): Promise<UploadedImage[]> {
	const uploadPromises = files.map((file) => uploadImage(file, bucket));
	return Promise.all(uploadPromises);
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(
	path: string,
	bucket: string = "apartment-images",
): Promise<void> {
	const supabase = createClient();

	const { error } = await supabase.storage.from(bucket).remove([path]);

	if (error) {
		throw new Error(`Delete failed: ${error.message}`);
	}
}
