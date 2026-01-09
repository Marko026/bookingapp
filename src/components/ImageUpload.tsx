"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { SortableImageItem } from "@/components/shared/SortableImageItem";
import {
	type UploadedImage,
	uploadMultipleImages,
	validateImageFile,
} from "@/lib/image-upload";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
	onUploadComplete: (images: UploadedImage[]) => void;
	maxFiles?: number;
	existingImages?: UploadedImage[];
}

export function ImageUpload({
	onUploadComplete,
	maxFiles = 10,
	existingImages = [],
}: ImageUploadProps) {
	const [uploading, setUploading] = useState(false);
	const [uploadedImages, setUploadedImages] =
		useState<UploadedImage[]>(existingImages);
	const [error, setError] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setUploadedImages((items) => {
				const oldIndex = items.findIndex((item) => item.url === active.id);
				const newIndex = items.findIndex((item) => item.url === over.id);

				const newItems = arrayMove(items, oldIndex, newIndex);
				onUploadComplete(newItems);
				return newItems;
			});
		}
	};

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			setError(null);

			// Validate files
			for (const file of acceptedFiles) {
				const validation = validateImageFile(file);
				if (!validation.valid) {
					setError(validation.error || "Invalid file");
					return;
				}
			}

			// Check max files
			if (uploadedImages.length + acceptedFiles.length > maxFiles) {
				setError(`Maximum ${maxFiles} images allowed`);
				return;
			}

			setUploading(true);

			try {
				const newImages = await uploadMultipleImages(acceptedFiles);
				const allImages = [...uploadedImages, ...newImages];
				setUploadedImages(allImages);
				onUploadComplete(allImages);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Upload failed");
			} finally {
				setUploading(false);
			}
		},
		[uploadedImages, maxFiles, onUploadComplete],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/jpeg": [".jpg", ".jpeg"],
			"image/png": [".png"],
			"image/webp": [".webp"],
			"image/avif": [".avif"],
		},
		maxFiles,
		disabled: uploading,
	});

	const removeImage = async (index: number) => {
		const imageToRemove = uploadedImages[index];

		try {
			// Extract path from URL (last segment after the last /)
			const path = imageToRemove.path || imageToRemove.url.split("/").pop();

			if (path) {
				console.log("🗑️ Deleting image from storage:", path);
				const { deleteImage } = await import("@/lib/image-upload");
				await deleteImage(path);
				console.log("✅ Image deleted from storage:", path);
			}
		} catch (error) {
			console.error("Failed to delete image from storage:", error);
			// Continue with removal from UI even if storage deletion fails
		}

		// Remove from state
		const newImages = uploadedImages.filter((_, i) => i !== index);
		setUploadedImages(newImages);
		onUploadComplete(newImages);
	};

	return (
		<div className="space-y-4">
			{/* Upload Area */}
			<div
				{...getRootProps()}
				className={cn(
					"border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
					"hover:border-primary hover:bg-primary/5",
					isDragActive && "border-primary bg-primary/10",
					uploading && "opacity-50 cursor-not-allowed",
				)}
			>
				<input {...getInputProps()} />

				<div className="flex flex-col items-center gap-3">
					{uploading ? (
						<>
							<Loader2 className="w-12 h-12 text-primary animate-spin" />
							<p className="text-sm text-muted-foreground">
								Uploading images...
							</p>
						</>
					) : (
						<>
							<Upload className="w-12 h-12 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">
									{isDragActive
										? "Drop images here"
										: "Drag & drop images here"}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									or click to browse (max {maxFiles} images, 10MB each)
								</p>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
					{error}
				</div>
			)}

			{/* Uploaded Images Grid with Drag-and-Drop */}
			{uploadedImages.length > 0 && (
				<div className="space-y-3">
					<p className="text-sm text-muted-foreground">
						💡 Drag images to reorder. The first image will be the main/cover
						image.
					</p>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={uploadedImages.map((img) => img.url)}
							strategy={verticalListSortingStrategy}
						>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{uploadedImages.map((image, index) => (
									<SortableImageItem
										key={image.url}
										image={image}
										index={index}
										onRemove={() => removeImage(index)}
										isMainImage={index === 0}
									/>
								))}
							</div>
						</SortableContext>
					</DndContext>
				</div>
			)}

			{/* Upload Summary */}
			{uploadedImages.length > 0 && (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<ImageIcon className="w-4 h-4" />
					<span>
						{uploadedImages.length} image
						{uploadedImages.length !== 1 ? "s" : ""} uploaded
					</span>
				</div>
			)}
		</div>
	);
}
