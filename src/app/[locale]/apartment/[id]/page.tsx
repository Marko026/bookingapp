"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	BedDouble,
	Car,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Grip,
	MapPin,
	Mountain,
	ShieldCheck,
	Star,
	Tv,
	Users,
	Utensils,
	Wifi,
	Wind,
	X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { BookingCalendar } from "@/features/booking/components/BookingCalendar";
import { BookingForm } from "@/features/booking/components/BookingForm";
import { getApartment } from "@/features/listings/actions";
import { getLocalizedField } from "@/lib/localization";
import { toast } from "@/lib/toast";
import { getApartments } from "@/services/storageService";
import type { Apartment } from "@/types";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
	ssr: false,
	loading: () => (
		<div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-2xl" />
	),
});

export default function ApartmentDetailPage() {
	const paramsHook = useParams();
	const id = paramsHook?.id as string;

	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations("ApartmentDetail");
	const tAmenities = useTranslations("Amenities");
	const [apartment, setApartment] = useState<Apartment | null>(null);

	const [dateRange, setDateRange] = useState<DateRange | undefined>();
	const [bookingFormVisible, setBookingFormVisible] = useState(false);

	// Gallery States
	const [showGallery, setShowGallery] = useState(false);
	const [galleryIndex, setGalleryIndex] = useState(0);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	useEffect(() => {
		if (!id) return;

		const fetchApartment = async () => {
			// Try fetching from server first (if ID is numeric)
			if (!isNaN(Number(id))) {
				const result = await getApartment(Number(id));
				if (result.success && result.apartment) {
					setApartment(result.apartment as Apartment);
					return;
				}
			}

			// Fallback to local storage (mock data)
			const apts = getApartments();
			const found = apts.find((a) => a.id === id);
			if (found) setApartment(found);
			else router.push("/");
		};

		fetchApartment();
		window.scrollTo(0, 0);
	}, [id, router]);

	if (!apartment)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-pulse flex flex-col items-center">
					<div className="h-12 w-12 bg-amber-600 rounded-full mb-4"></div>
					<p className="font-serif text-xl text-gray-400">
						{t("loading")}
					</p>
				</div>
			</div>
		);

	const handleBookingSuccess = () => {
		setBookingFormVisible(false);
		toast.success(t("toast.successTitle"), {
			description: t("toast.successDesc"),
		});
		router.push("/");
	};

	const nextImage = () =>
		setCurrentImageIndex((prev) => (prev + 1) % apartment.images.length);
	const prevImage = () =>
		setCurrentImageIndex(
			(prev) => (prev - 1 + apartment.images.length) % apartment.images.length,
		);
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
		setGalleryIndex((prev) => (prev + 1) % apartment.images.length);
	};
	const prevGalleryImage = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		setGalleryIndex(
			(prev) => (prev - 1 + apartment.images.length) % apartment.images.length,
		);
	};

	const getAmenityTranslation = (amenity: string) => {
		switch (amenity) {
			case "WiFi":
				return tAmenities("wifi");
			case "Parking":
				return tAmenities("parking");
			case "Klima":
				return tAmenities("ac");
			case "Terasa":
				return tAmenities("terrace");
			case "Balkon":
				return tAmenities("balcony");
			case "Kuhinja":
				return tAmenities("kitchen");
			case "TV":
				return tAmenities("tv");
			default:
				return amenity;
		}
	};

	const renderAmenityIcon = (amenity: string) => {
		switch (amenity) {
			case "WiFi":
				return <Wifi size={18} />;
			case "Parking":
				return <Car size={18} />;
			case "Klima":
				return <Wind size={18} />;
			case "Terasa":
			case "Balkon":
				return <Mountain size={18} />;
			case "Kuhinja":
				return <Utensils size={18} />;
			case "TV":
				return <Tv size={18} />;
			default:
				return <CheckCircle2 size={18} />;
		}
	};

	return (
		<div className="bg-white min-h-screen pb-12 md:pb-24 pt-20 md:pt-28">
			<div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
				{/* Left Column: Content */}
				<div className="lg:col-span-8">
					{/* Header Section */}
					<div className="mb-6 md:mb-8">
						<h1 className="text-3xl md:text-6xl font-serif font-medium text-gray-900 leading-[1.1] mb-3 md:mb-4">
							{getLocalizedField(apartment, "name", locale)}
						</h1>

						<div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
							<span className="flex items-center gap-1.5 font-bold text-gray-900">
								<Star
									size={14}
									className="fill-amber-500 text-amber-500 md:w-[16px] md:h-[16px]"
								/>{" "}
								{apartment.rating}
							</span>
							<span className="w-1 h-1 bg-gray-300 rounded-full" />
							<span className="underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-amber-600 transition-colors">
								42 {t("reviews")}
							</span>
							<span className="w-1 h-1 bg-gray-300 rounded-full" />
							<span className="flex items-center gap-1.5">
								<MapPin
									size={14}
									className="text-gray-400 md:w-[16px] md:h-[16px]"
								/>{" "}
								{t("locationName")}
							</span>
							<span className="w-1 h-1 bg-gray-300 rounded-full" />
							<a
								href={
									apartment.latitude && apartment.longitude
										? `https://www.google.com/maps/dir/?api=1&destination=${apartment.latitude},${apartment.longitude}`
										: "https://www.google.com/maps/dir/?api=1&destination=Vinci,Golubac"
								}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-full font-medium transition-all border border-amber-200 hover:shadow-sm ml-2"
							>
								<MapPin size={16} className="fill-amber-600 text-amber-600" />
								{t("directions")}
							</a>
						</div>
					</div>

					{/* Image Grid */}
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
								src={apartment.images[0]}
								className="object-cover transition-transform duration-700 group-hover:scale-105"
								alt="Main"
								fill
								sizes="(max-width: 768px) 100vw, 50vw"
								priority
							/>
							<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
						</div>
						<div
							className="col-span-1 row-span-1 relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-500/20"
							onClick={() => openGallery(1)}
							onKeyDown={(e) =>
								(e.key === "Enter" || e.key === " ") && openGallery(1)
							}
							role="button"
							tabIndex={0}
						>
							<Image
								src={apartment.images[1]}
								className="object-cover transition-transform duration-700 group-hover:scale-105"
								alt="Sub 1"
								fill
								sizes="(max-width: 768px) 100vw, 25vw"
							/>
						</div>
						<div
							className="col-span-1 row-span-1 relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-500/20"
							onClick={() => openGallery(2)}
							onKeyDown={(e) =>
								(e.key === "Enter" || e.key === " ") && openGallery(2)
							}
							role="button"
							tabIndex={0}
						>
							<Image
								src={apartment.images[2]}
								className="object-cover transition-transform duration-700 group-hover:scale-105"
								alt="Sub 2"
								fill
								sizes="(max-width: 768px) 100vw, 25vw"
							/>
						</div>
						<div
							className="col-span-1 row-span-1 relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-500/20"
							onClick={() => openGallery(3)}
							onKeyDown={(e) =>
								(e.key === "Enter" || e.key === " ") && openGallery(3)
							}
							role="button"
							tabIndex={0}
						>
							<Image
								src={apartment.images[3]}
								className="object-cover transition-transform duration-700 group-hover:scale-105"
								alt="Sub 3"
								fill
								sizes="(max-width: 768px) 100vw, 25vw"
							/>
						</div>
						<div
							className="col-span-1 row-span-1 relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-500/20"
							onClick={() => openGallery(0)}
							onKeyDown={(e) =>
								(e.key === "Enter" || e.key === " ") && openGallery(0)
							}
							role="button"
							tabIndex={0}
						>
							<Image
								src={apartment.images[4] || apartment.images[0]}
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
							src={apartment.images[currentImageIndex]}
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

					{/* Details & Description */}
					<div className="flex flex-col gap-8 md:gap-10">
						<div className="flex items-center gap-4 md:gap-8 py-4 md:py-6 border-y border-gray-100 overflow-x-auto no-scrollbar">
							<div className="flex items-center gap-2 md:gap-3 shrink-0">
								<div className="p-2 md:p-3 bg-amber-50 text-amber-600 rounded-full">
									<Users size={16} className="md:w-[20px] md:h-[20px]" />
								</div>
								<div>
									<p className="font-bold text-xs md:text-sm text-gray-900">
										{apartment.maxGuests} {t("guests")}
									</p>
									<p className="text-[10px] md:text-xs text-gray-500">
										{t("capacity")}
									</p>
								</div>
							</div>
							<div className="w-px h-8 md:h-10 bg-gray-100 shrink-0" />
							<div className="flex items-center gap-2 md:gap-3 shrink-0">
								<div className="p-2 md:p-3 bg-amber-50 text-amber-600 rounded-full">
									<BedDouble size={16} className="md:w-[20px] md:h-[20px]" />
								</div>
								<div>
									<p className="font-bold text-xs md:text-sm text-gray-900">
										{apartment.beds} {t("beds")}
									</p>
									<p className="text-[10px] md:text-xs text-gray-500">
										{t("sleeping")}
									</p>
								</div>
							</div>
							<div className="w-px h-8 md:h-10 bg-gray-100 shrink-0" />
							<div className="flex items-center gap-2 md:gap-3 shrink-0">
								<div className="p-2 md:p-3 bg-amber-50 text-amber-600 rounded-full">
									<ShieldCheck size={16} className="md:w-[20px] md:h-[20px]" />
								</div>
								<div>
									<p className="font-bold text-xs md:text-sm text-gray-900">
										{t("verified")}
									</p>
									<p className="text-[10px] md:text-xs text-gray-500">
										{t("premium")}
									</p>
								</div>
							</div>
						</div>

						<div>
							<h2 className="text-xl md:text-2xl font-serif font-medium mb-3 md:mb-4 text-gray-900">
								{t("aboutTitle")}
							</h2>
							<div
								className="prose prose-stone prose-lg max-w-none text-gray-500 leading-7 md:leading-8 font-light"
								dangerouslySetInnerHTML={{
									__html: getLocalizedField(apartment, "description", locale),
								}}
							/>
						</div>

						<div className="mb-6 md:mb-8">
							<h2 className="text-xl md:text-2xl font-serif font-medium mb-4 md:mb-6">
								{t("amenitiesTitle")}
							</h2>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
								{apartment.amenities.map((am) => (
									<div
										key={am}
										className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100"
									>
										<div className="text-gray-500">{renderAmenityIcon(am)}</div>
										<span className="text-xs md:text-sm text-gray-700 font-medium">
											{getAmenityTranslation(am)}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Location Map */}
						{apartment.latitude && apartment.longitude && (
							<div className="mt-8 md:mt-10">
								<h2 className="text-xl md:text-2xl font-serif font-medium mb-4 md:mb-6 text-gray-900">
									{t("locationTitle")}
								</h2>
								<LocationMap
									lat={apartment.latitude}
									lng={apartment.longitude}
									popupText={getLocalizedField(apartment, "name", locale)}
								/>
							</div>
						)}
					</div>
				</div>

				{/* Right Column: Sticky Booking Widget */}
				<div className="lg:col-span-4 relative z-10">
					{/* FIXED: Removed overflow-hidden, Changed top to 24 to move it up */}
					<div className="sticky top-24 bg-white border border-gray-200 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8">
						{/* Price Header */}
						<div className="flex justify-between items-baseline mb-4 md:mb-6">
							<span className="text-3xl md:text-4xl font-serif font-medium text-gray-900">
								{apartment.price}€{" "}
								<span className="text-base md:text-lg font-sans text-gray-400 font-normal">
									{t("priceNight")}
								</span>
							</span>
							<div className="flex items-center gap-1 text-xs md:text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-1 md:px-3 md:py-1 rounded-full">
								<Star
									size={12}
									className="fill-amber-600 md:w-[14px] md:h-[14px]"
								/>
								{apartment.rating}
							</div>
						</div>

						{/* Visual Date Display Boxes */}
						<div className="grid grid-cols-2 gap-2 mb-4">
							<div
								className={`p-3 rounded-2xl border transition-all ${dateRange?.from ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-transparent"}`}
							>
								<p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
									{t("checkIn")}
								</p>
								<p
									className={`font-medium text-xs md:text-sm ${dateRange?.from ? "text-amber-900" : "text-gray-400"}`}
								>
									{dateRange?.from
										? dateRange.from.toLocaleDateString()
										: t("addDate")}
								</p>
							</div>
							<div
								className={`p-3 rounded-2xl border transition-all ${dateRange?.to ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-transparent"}`}
							>
								<p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
									{t("checkOut")}
								</p>
								<p
									className={`font-medium text-xs md:text-sm ${dateRange?.to ? "text-amber-900" : "text-gray-400"}`}
								>
									{dateRange?.to
										? dateRange.to.toLocaleDateString()
										: t("addDate")}
								</p>
							</div>
						</div>

						{/* High Contrast Calendar Container */}
						<div className="mb-6 bg-stone-50 border border-stone-200 rounded-[1.5rem] p-3 md:p-4 shadow-inner">
							<div className="flex justify-center">
								<BookingCalendar
									apartmentId={apartment.id}
									onDateSelect={setDateRange}
								/>
							</div>
						</div>

						{/* Price Breakdown / Action Button */}
						{dateRange?.from && dateRange?.to ? (
							<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
								{/* FIXED: Reduced padding (p-4) and spacing to make it more compact */}
								<div className="bg-white p-4 rounded-2xl mb-4 space-y-2 text-xs md:text-sm border border-gray-100 shadow-sm">
									<div className="flex justify-between text-gray-600">
										<span>
											{Math.ceil(
												(dateRange.to.getTime() - dateRange.from.getTime()) /
													(1000 * 3600 * 24),
											)}{" "}
											{t("nights")}
										</span>
										<span className="font-medium text-gray-900">
											{Math.ceil(
												(dateRange.to.getTime() - dateRange.from.getTime()) /
													(1000 * 3600 * 24),
											) * apartment.price}
											€
										</span>
									</div>
									<div className="h-px bg-gray-100 my-1" />
									<div className="flex justify-between text-base md:text-lg font-serif font-medium text-gray-900">
										<span>{t("total")}</span>
										<span>
											{Math.ceil(
												(dateRange.to.getTime() - dateRange.from.getTime()) /
													(1000 * 3600 * 24),
											) * apartment.price}
											€
										</span>
									</div>
								</div>

								{/* Button is now outside the compact box and should be fully visible */}
								<Button
									onClick={() => setBookingFormVisible(true)}
									className="w-full !py-6 text-base md:text-lg bg-amber-600 text-white hover:bg-amber-700 shadow-xl shadow-amber-600/20 rounded-2xl transition-all hover:scale-[1.02]"
								>
									{t("reserveButton")}
								</Button>
							</div>
						) : (
							<div className="p-4 text-center">
								<p className="text-xs md:text-sm text-gray-400 font-medium">
									{t("selectDates")}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Booking Form Modal */}
			<AnimatePresence>
				{bookingFormVisible && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
					>
						{dateRange?.from && dateRange?.to && (
							<BookingForm
								apartmentId={apartment.id}
								apartmentName={getLocalizedField(apartment, "name", locale)}
								apartmentImage={apartment.images[0]}
								checkIn={dateRange.from}
								checkOut={dateRange.to}
								totalPrice={
									Math.ceil(
										(dateRange.to.getTime() - dateRange.from.getTime()) /
											(1000 * 3600 * 24),
									) * apartment.price
								}
								onClose={() => setBookingFormVisible(false)}
								onSuccess={handleBookingSuccess}
							/>
						)}
					</motion.div>
				)}
			</AnimatePresence>

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
								src={apartment.images[galleryIndex]}
								alt="Gallery"
								className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}