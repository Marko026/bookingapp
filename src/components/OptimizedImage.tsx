import Image from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
	priority?: boolean;
	quality?: number;
	fill?: boolean;
	sizes?: string;
	objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
	loading?: "lazy" | "eager";
}

/**
 * Optimized Image Component with automatic WebP/AVIF conversion
 * Uses Next.js Image component with blur placeholder and responsive sizing
 */
export function OptimizedImage({
	src,
	alt,
	width,
	height,
	className,
	priority = false,
	quality = 85,
	fill = false,
	sizes,
	objectFit = "cover",
	loading = "lazy",
}: OptimizedImageProps) {
	// Default sizes for responsive images
	const defaultSizes =
		sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

	if (fill) {
		return (
			<Image
				src={src}
				alt={alt}
				fill
				className={cn("object-cover", className)}
				style={{ objectFit }}
				quality={quality}
				priority={priority}
				sizes={defaultSizes}
				placeholder="blur"
				blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
			/>
		);
	}

	return (
		<Image
			src={src}
			alt={alt}
			width={width || 800}
			height={height || 600}
			className={className}
			quality={quality}
			priority={priority}
			sizes={defaultSizes}
			loading={loading}
			placeholder="blur"
			blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
		/>
	);
}

/**
 * Apartment Gallery Image - Optimized for apartment listings
 */
export function ApartmentImage({
	src,
	alt,
	className,
	priority = false,
}: {
	src: string;
	alt: string;
	className?: string;
	priority?: boolean;
}) {
	return (
		<OptimizedImage
			src={src}
			alt={alt}
			fill
			className={className}
			priority={priority}
			quality={90}
			sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
		/>
	);
}

/**
 * Thumbnail Image - Optimized for small previews
 */
export function ThumbnailImage({
	src,
	alt,
	className,
}: {
	src: string;
	alt: string;
	className?: string;
}) {
	return (
		<OptimizedImage
			src={src}
			alt={alt}
			width={150}
			height={150}
			className={className}
			quality={75}
			sizes="150px"
		/>
	);
}
