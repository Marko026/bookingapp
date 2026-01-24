const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Configuration
const TARGET_SIZE_KB = 200;
const MAX_WIDTH = 1920;
const PUBLIC_DIR = path.join(process.cwd(), "public");

// Helper to format bytes
const formatBytes = (bytes) => (bytes / 1024).toFixed(2) + " KB";

// Recursive function to get all image files
function getAllImages(dir) {
	let results = [];
	const list = fs.readdirSync(dir);

	list.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat && stat.isDirectory()) {
			results = results.concat(getAllImages(filePath));
		} else {
			if (/\.(png|jpg|jpeg|webp)$/i.test(file)) {
				results.push(filePath);
			}
		}
	});

	return results;
}

async function optimizeFile(filePath) {
	const originalSize = fs.statSync(filePath).size;
	const originalSizeKB = originalSize / 1024;

	// Skip if already small (strict 200KB check)
	if (originalSizeKB <= TARGET_SIZE_KB) {
		if (originalSizeKB < 150) return; // Skip small files
	}

	const tempPath = filePath + ".temp";
	let quality = 80;
	let width = MAX_WIDTH;
	let attempt = 0;
	let optimized = false;

	let bestSize = originalSizeKB;
	let bestPath = null;

	console.log(`\nProcessing: ${path.relative(process.cwd(), filePath)}`);
	console.log(`Original: ${formatBytes(originalSize)}`);

	// Iterative optimization loop
	while (attempt < 7) {
		try {
			const pipeline = sharp(filePath);
			const metadata = await pipeline.metadata();

			// Aggressive resizing logic
			if (attempt > 0) {
				width = Math.floor(width * 0.75); // 25% reduction each fail
			} else if (metadata.width > MAX_WIDTH) {
				width = MAX_WIDTH;
			}

			// Ensure we don't go too small unless original was small
			if (width < 320 && originalSizeKB > 50) width = 320;

			pipeline.resize({ width: width, withoutEnlargement: true });

			// Format specific options
			if (filePath.toLowerCase().endsWith(".png")) {
				// Use palette for lossy compression (quantization) to significantly reduce size
				pipeline.png({
					quality: quality,
					compressionLevel: 9,
					adaptiveFiltering: true,
					palette: true,
				});
			} else if (
				filePath.toLowerCase().endsWith(".jpg") ||
				filePath.toLowerCase().endsWith(".jpeg")
			) {
				pipeline.jpeg({ quality: quality, mozjpeg: true });
			} else if (filePath.toLowerCase().endsWith(".webp")) {
				pipeline.webp({ quality: quality });
			}

			await pipeline.toFile(tempPath);

			const newSize = fs.statSync(tempPath).size;
			const newSizeKB = newSize / 1024;

			console.log(
				`Attempt ${attempt + 1}: Quality ${quality}, Width ${width} -> ${formatBytes(newSize)}`,
			);

			if (newSizeKB < bestSize) {
				bestSize = newSizeKB;
				// Keep this temp file as the current best candidate
				const bestCandidatePath = filePath + ".best";
				fs.copyFileSync(tempPath, bestCandidatePath);
				if (bestPath && bestPath !== bestCandidatePath) {
					if (fs.existsSync(bestPath)) fs.unlinkSync(bestPath);
				}
				bestPath = bestCandidatePath;
			}

			if (newSizeKB <= TARGET_SIZE_KB) {
				optimized = true;
				break; // We made it!
			} else {
				// Prepare for next attempt
				attempt++;
				quality -= 10;
				if (quality < 20) quality = 20;

				// Clean up current temp
				if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
			}
		} catch (err) {
			console.error("Error optimizing:", err);
			if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
			break;
		}
	}

	// Final Decision
	if (optimized && bestPath) {
		console.log(`✅ Success! Reached under 200KB.`);
		fs.copyFileSync(bestPath, filePath);
		if (fs.existsSync(bestPath)) fs.unlinkSync(bestPath);
	} else if (bestPath && bestSize < originalSizeKB) {
		console.warn(
			`⚠️ Could not reach 200KB, but improved to ${bestSize.toFixed(2)} KB. Saving best attempt.`,
		);
		fs.copyFileSync(bestPath, filePath);
		if (fs.existsSync(bestPath)) fs.unlinkSync(bestPath);
	} else {
		console.log(`No improvement possible or file already ideal.`);
		if (bestPath && fs.existsSync(bestPath)) fs.unlinkSync(bestPath);
	}
}

async function main() {
	console.log("🚀 Starting Image Optimization (Aggressive Target: <200KB)...");
	const allImages = getAllImages(PUBLIC_DIR);
	console.log(`Found ${allImages.length} images.`);

	for (const file of allImages) {
		await optimizeFile(file);
	}

	console.log("\n✨ Optimization Complete!");
}

main();
