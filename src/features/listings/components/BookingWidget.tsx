"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { BookingCalendar } from "@/features/booking/components/BookingCalendar";
import { BookingForm } from "@/features/booking/components/BookingForm";
import { toast } from "@/lib/toast";

interface BookingWidgetProps {
	apartmentId: string;
	price: number;
	rating: number;
	apartmentName: string;
	apartmentImage: string;
}

export function BookingWidget({
	apartmentId,
	price,
	rating,
	apartmentName,
	apartmentImage,
}: BookingWidgetProps) {
	const t = useTranslations("ApartmentDetail");
	const [dateRange, setDateRange] = useState<DateRange | undefined>();
	const [bookingFormVisible, setBookingFormVisible] = useState(false);

	const handleBookingSuccess = () => {
		setBookingFormVisible(false);
		toast.success(t("toast.successTitle"), {
			description: t("toast.successDesc"),
		});
		// Optional: Redirect or refresh
	};

	const nights =
		dateRange?.from && dateRange?.to
			? Math.ceil(
					(dateRange.to.getTime() - dateRange.from.getTime()) /
						(1000 * 3600 * 24),
				)
			: 0;

	const totalPrice = nights * price;

	return (
		<>
			<div className="sticky top-24 bg-white border border-gray-200 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8">
				{/* Price Header */}
				<div className="flex justify-between items-baseline mb-4 md:mb-6">
					<span className="text-3xl md:text-4xl font-serif font-medium text-gray-900">
						{price}€{" "}
						<span className="text-base md:text-lg font-sans text-gray-400 font-normal">
							{t("priceNight")}
						</span>
					</span>
					<div className="flex items-center gap-1 text-xs md:text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-1 md:px-3 md:py-1 rounded-full">
						<Star
							size={12}
							className="fill-amber-600 md:w-[14px] md:h-[14px]"
						/>
						{rating}
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
							{dateRange?.to ? dateRange.to.toLocaleDateString() : t("addDate")}
						</p>
					</div>
				</div>

				{/* High Contrast Calendar Container */}
				<div className="mb-6 bg-stone-50 border border-stone-200 rounded-[1.5rem] p-3 md:p-4 shadow-inner">
					<div className="flex justify-center">
						<BookingCalendar
							apartmentId={apartmentId}
							onDateSelect={setDateRange}
						/>
					</div>
				</div>

				{/* Price Breakdown / Action Button */}
				{dateRange?.from && dateRange?.to ? (
					<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div className="bg-white p-4 rounded-2xl mb-4 space-y-2 text-xs md:text-sm border border-gray-100 shadow-sm">
							<div className="flex justify-between text-gray-600">
								<span>
									{nights} {t("nights")}
								</span>
								<span className="font-medium text-gray-900">{totalPrice}€</span>
							</div>
							<div className="h-px bg-gray-100 my-1" />
							<div className="flex justify-between text-base md:text-lg font-serif font-medium text-gray-900">
								<span>{t("total")}</span>
								<span>{totalPrice}€</span>
							</div>
						</div>

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

			{/* Booking Form Modal */}
			<AnimatePresence>
				{bookingFormVisible && dateRange?.from && dateRange?.to && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
					>
						<BookingForm
							apartmentId={apartmentId}
							apartmentName={apartmentName}
							apartmentImage={apartmentImage}
							checkIn={dateRange.from}
							checkOut={dateRange.to}
							totalPrice={totalPrice}
							onClose={() => setBookingFormVisible(false)}
							onSuccess={handleBookingSuccess}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
