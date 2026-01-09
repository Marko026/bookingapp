"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { UploadedImage } from "@/lib/image-upload";

interface SortableImageItemProps {
	image: UploadedImage;
	index: number;
	onRemove: () => void;
	isMainImage: boolean;
}

export function SortableImageItem({
	image,
	index,
	onRemove,
	isMainImage,
}: SortableImageItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: image.url });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={cn(
				"relative aspect-square rounded-lg overflow-hidden group border-2 cursor-grab active:cursor-grabbing",
				isMainImage ? "border-primary ring-2 ring-primary/20" : "border-border",
			)}
		>
			<Image
				src={image.url}
				alt={`Uploaded ${index + 1}`}
				fill
				className="object-cover"
				onError={(e) => {
					console.error("Image failed to load:", image.url);
					console.error("Error:", e);
				}}
				unoptimized // Bypass Next.js optimization for Supabase URLs
			/>

			{/* Main Image Badge */}
			{isMainImage && (
				<div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-lg pointer-events-none">
					<Star className="w-3 h-3 fill-current" />
					Main Image
				</div>
			)}

			{/* Remove Button */}
			<button
				onClick={(e) => {
					e.stopPropagation(); // Prevent drag when clicking remove
					onRemove();
				}}
				className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110 active:scale-95"
				type="button"
				aria-label="Remove image"
			>
				<X className="w-4 h-4" />
			</button>

			{/* Image Info */}
			<div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
				{image.width} × {image.height}
			</div>
		</div>
	);
}
