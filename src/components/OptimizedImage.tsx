import Image from "next/image";
import { memo } from "react";
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
 * Shimmer effect for image loading placeholder
 */
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f3f4f6" offset="20%" />
      <stop stop-color="#e5e7eb" offset="50%" />
      <stop stop-color="#f3f4f6" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f3f4f6" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
	typeof window === "undefined"
		? Buffer.from(str).toString("base64")
		: window.btoa(str);

/**
 * Optimized Image Component with automatic WebP/AVIF conversion
 * Uses Next.js Image component with shimmer placeholder and responsive sizing
 */
export const OptimizedImage = memo(function OptimizedImage({
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
	loading,
}: OptimizedImageProps) {
	// Default sizes for responsive images
	const defaultSizes =
		sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

	const imageWidth = width || 800;
	const imageHeight = height || 600;

	const commonProps = {
		src,
		alt,
		quality,
		priority,
		sizes: defaultSizes,
		placeholder: "blur" as const,
		blurDataURL: `data:image/svg+xml;base64,${toBase64(
			shimmer(imageWidth, imageHeight),
		)}`,
		loading: priority ? undefined : loading,
	};

	if (fill) {
		return (
			<Image
				{...commonProps}
				fill
				className={cn("object-cover", className)}
				style={{ objectFit }}
			/>
		);
	}

	return (
		<Image
			{...commonProps}
			width={imageWidth}
			height={imageHeight}
			className={className}
		/>
	);
});

/**
 * Apartment Gallery Image - Optimized for apartment listings
 */
export const ApartmentImage = memo(function ApartmentImage({
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
});

/**
 * Thumbnail Image - Optimized for small previews
 */
export const ThumbnailImage = memo(function ThumbnailImage({
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
});
