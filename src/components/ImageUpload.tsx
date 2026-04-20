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
import { useCallback, useEffect, useRef, useState } from "react";
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
	uploadOptions?: { maxWidth?: number; maxHeight?: number; quality?: number };
}

export function ImageUpload({
	onUploadComplete,
	maxFiles = 10,
	existingImages = [],
	uploadOptions,
}: ImageUploadProps) {
	const [uploading, setUploading] = useState(false);
	const [uploadedImages, setUploadedImages] =
		useState<UploadedImage[]>(existingImages);
	const [error, setError] = useState<string | null>(null);
	const mountedRef = useRef(false);
	const prevImagesRef = useRef<string | null>(null);

	useEffect(() => {
		mountedRef.current = true;
	}, []);

	useEffect(() => {
		setUploadedImages(existingImages);
	}, [existingImages]);

	useEffect(() => {
		if (!mountedRef.current) return;
		const key = uploadedImages.map((img) => img.url).join("|");
		if (prevImagesRef.current !== key) {
			prevImagesRef.current = key;
			onUploadComplete(uploadedImages);
		}
	}, [uploadedImages, onUploadComplete]);

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

				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			setError(null);

			for (const file of acceptedFiles) {
				const validation = validateImageFile(file);
				if (!validation.valid) {
					setError(validation.error || "Invalid file");
					return;
				}
			}

			if (uploadedImages.length + acceptedFiles.length > maxFiles) {
				setError(`Maximum ${maxFiles} images allowed`);
				return;
			}

			setUploading(true);

			try {
				const newImages = await uploadMultipleImages(
					acceptedFiles,
					undefined,
					uploadOptions,
				);
				setUploadedImages((prev) => [...prev, ...newImages]);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Upload failed");
			} finally {
				setUploading(false);
			}
		},
		[uploadedImages.length, maxFiles, uploadOptions],
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
			const path = imageToRemove.path || imageToRemove.url.split("/").pop();

			if (path) {
				const { deleteImage } = await import("@/lib/image-upload");
				await deleteImage(path);
			}
		} catch (error) {
			console.error("Failed to delete image from storage:", error);
		}

		setUploadedImages((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div className="space-y-4">
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

			{error && (
				<div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
					{error}
				</div>
			)}

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
