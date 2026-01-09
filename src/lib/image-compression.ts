/**
 * Compress an image using Canvas API
 * Reduces file size by 60-80% while maintaining good quality
 */
export async function compressImage(
	file: File,
	maxWidth: number = 1920,
	maxHeight: number = 1080,
	quality: number = 0.8,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			reject(new Error("Canvas context not available"));
			return;
		}

		img.onload = () => {
			// Calculate new dimensions (maintain aspect ratio)
			let { width, height } = img;

			if (width > maxWidth) {
				height = (height * maxWidth) / width;
				width = maxWidth;
			}

			if (height > maxHeight) {
				width = (width * maxHeight) / height;
				height = maxHeight;
			}

			// Set canvas size and draw
			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(img, 0, 0, width, height);

			// Convert to blob with compression
			canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve(blob);
					} else {
						reject(new Error("Compression failed"));
					}
				},
				"image/jpeg", // Always use JPEG for best compression
				quality,
			);
		};

		img.onerror = () => reject(new Error("Failed to load image"));
		img.src = URL.createObjectURL(file);
	});
}

/**
 * Get image dimensions from File object
 */
export function getImageDimensions(
	file: File,
): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve({
				width: img.naturalWidth,
				height: img.naturalHeight,
			});
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error("Failed to load image"));
		};

		img.src = url;
	});
}
