"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Grip, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ApartmentGalleryProps {
	images: string[];
}

export function ApartmentGallery({ images }: ApartmentGalleryProps) {
	const t = useTranslations("ApartmentDetail");
	const [showGallery, setShowGallery] = useState(false);
	const [galleryIndex, setGalleryIndex] = useState(0);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const nextImage = () =>
		setCurrentImageIndex((prev) => (prev + 1) % images.length);
	const prevImage = () =>
		setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

	const openGallery = (index: number) => {
		setGalleryIndex(index);
		setShowGallery(true);
		document.body.style.overflow = "hidden";
	};

	const closeGallery = () => {
		setShowGallery(false);
		document.body.style.overflow = "unset";
	};

	const nextGalleryImage = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		setGalleryIndex((prev) => (prev + 1) % images.length);
	};

	const prevGalleryImage = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		setGalleryIndex((prev) => (prev - 1 + images.length) % images.length);
	};

	// Ensure we have at least one image to prevent crashes
	const displayImages =
		images.length > 0 ? images : ["/images/placeholder.jpg"];

	return (
		<>
			{/* Image Grid (Desktop) */}
			<div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[500px] mb-12 rounded-[2.5rem] overflow-hidden shadow-sm">
				<div
					className="col-span-2 row-span-2 relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-500/20"
					onClick={() => openGallery(0)}
					onKeyDown={(e) =>
						(e.key === "Enter" || e.key === " ") && openGallery(0)
					}
					role="button"
					tabIndex={0}
				>
					<Image
						src={displayImages[0]}
						className="object-cover transition-transform duration-700 group-hover:scale-105"
						alt="Main"
						fill
						sizes="(max-width: 768px) 100vw, 50vw"
						priority
					/>
					<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
				</div>
				{/* Secondary Images */}
				{displayImages.slice(1, 4).map((img, idx) => (
					<div
						key={idx}
						className="col-span-1 row-span-1 relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-500/20"
						onClick={() => openGallery(idx + 1)}
						onKeyDown={(e) =>
							(e.key === "Enter" || e.key === " ") && openGallery(idx + 1)
						}
						role="button"
						tabIndex={0}
					>
						<Image
							src={img}
							className="object-cover transition-transform duration-700 group-hover:scale-105"
							alt={`Sub ${idx + 1}`}
							fill
							sizes="(max-width: 768px) 100vw, 25vw"
						/>
					</div>
				))}
				{/* 5th Image / Show All Button */}
				<div
					className="col-span-1 row-span-1 relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-500/20"
					onClick={() => openGallery(0)} // Open gallery at start if clicked
					onKeyDown={(e) =>
						(e.key === "Enter" || e.key === " ") && openGallery(0)
					}
					role="button"
					tabIndex={0}
				>
					<Image
						src={displayImages[4] || displayImages[0]}
						className="object-cover transition-transform duration-700 group-hover:scale-105"
						alt="Sub 4"
						fill
						sizes="(max-width: 768px) 100vw, 25vw"
					/>
					<div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors flex items-center justify-center">
						<button className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform text-gray-900">
							<Grip size={16} /> {t("showPhotos")}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Image Slider */}
			<div className="md:hidden relative h-[35vh] rounded-[1.5rem] overflow-hidden mb-6 shadow-lg">
				<Image
					src={displayImages[currentImageIndex]}
					alt=""
					fill
					sizes="100vw"
					priority
					className="object-cover"
				/>
				<div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
					<button
						onClick={prevImage}
						className="pointer-events-auto p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-black"
					>
						<ChevronLeft size={18} />
					</button>
					<button
						onClick={nextImage}
						className="pointer-events-auto p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-black"
					>
						<ChevronRight size={18} />
					</button>
				</div>
			</div>

			{/* Lightbox Gallery */}
			<AnimatePresence>
				{showGallery && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-white z-[100] flex items-center justify-center"
					>
						<button
							onClick={closeGallery}
							className="absolute top-6 right-6 p-4 text-black bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-20"
						>
							<X size={24} />
						</button>
						<button
							onClick={prevGalleryImage}
							className="absolute left-4 md:left-10 p-4 text-black bg-gray-100 hover:bg-white hover:scale-110 shadow-lg rounded-full transition-all z-20 hidden md:block"
						>
							<ChevronLeft size={32} />
						</button>
						<button
							onClick={nextGalleryImage}
							className="absolute right-4 md:right-10 p-4 text-black bg-gray-100 hover:bg-white hover:scale-110 shadow-lg rounded-full transition-all z-20 hidden md:block"
						>
							<ChevronRight size={32} />
						</button>

						<div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center p-4">
							<motion.img
								key={galleryIndex}
								initial={{ scale: 0.95, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								src={displayImages[galleryIndex]}
								alt="Gallery"
								className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
