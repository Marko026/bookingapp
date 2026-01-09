export function validateImageFile(file: File): {
	valid: boolean;
	error?: string;
} {
	console.log("🔍 Validating file:", {
		name: file.name,
		type: file.type,
		size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
	});

	// Check file type
	const validTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp",
		"image/avif",
	];

	// Check MIME type first
	let isValidType = validTypes.includes(file.type);

	// Fallback: Check file extension if MIME type is missing or invalid
	if (!isValidType || !file.type) {
		const fileName = file.name.toLowerCase();
		const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
		isValidType = validExtensions.some((ext) => fileName.endsWith(ext));

		if (isValidType) {
			console.log(
				"⚠️ File type missing or invalid, but extension is valid:",
				fileName,
			);
		}
	}

	if (!isValidType) {
		const errorMsg = `Invalid file type. File: "${file.name}", Type: "${file.type}". Please upload JPEG, PNG, WebP, or AVIF images.`;
		console.error("❌ Validation failed:", errorMsg);
		return {
			valid: false,
			error: errorMsg,
		};
	}

	// Check file size (max 10MB)
	const maxSize = 10 * 1024 * 1024; // 10MB
	if (file.size > maxSize) {
		const errorMsg = `File too large. Size: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.`;
		console.error("❌ Validation failed:", errorMsg);
		return {
			valid: false,
			error: errorMsg,
		};
	}

	console.log("✅ File validation passed");
	return { valid: true };
}
