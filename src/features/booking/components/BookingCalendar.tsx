"use client";

import { addDays, isSameDay, startOfToday } from "date-fns";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { getApartmentBookings } from "@/features/booking/actions";
import { toast } from "@/lib/toast";

interface BookingCalendarProps {
	apartmentId: string;
	onDateSelect: (range: DateRange | undefined) => void;
}

export function BookingCalendar({
	apartmentId,
	onDateSelect,
}: BookingCalendarProps) {
	const t = useTranslations("Booking");
	const [date, setDate] = React.useState<DateRange | undefined>();
	const [disabledDates, setDisabledDates] = React.useState<Date[]>([]);
	const [isLoading, setIsLoading] = React.useState(true);

	React.useEffect(() => {
		const fetchBookings = async () => {
			setIsLoading(true);
			try {
				const result = await getApartmentBookings(Number(apartmentId));

				if (result.success && result.bookings) {
					const disabled: Date[] = [];

					result.bookings.forEach((booking) => {
						if (booking.status !== "cancelled") {
							let current = new Date(booking.checkIn);
							const end = new Date(booking.checkOut);

							while (current < end) {
								disabled.push(new Date(current));
								current = addDays(current, 1);
							}
						}
					});

					setDisabledDates(disabled);
				}
			} catch (error) {
				console.error("Failed to fetch bookings:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchBookings();
	}, [apartmentId]);

	const handleSelect = (range: DateRange | undefined) => {
		if (range?.from && range?.to) {
			// Check if any date in the range is disabled
			let current = new Date(range.from);
			let isInvalid = false;
			while (current <= range.to) {
				if (disabledDates.some((d) => isSameDay(d, current))) {
					isInvalid = true;
					break;
				}
				current = addDays(current, 1);
			}

			if (isInvalid) {
				toast.error(t("calendar.unavailableTitle"), {
					description: t("calendar.unavailableDesc"),
				});
				setDate({ from: range.from, to: undefined });
				onDateSelect({ from: range.from, to: undefined });
				return;
			}
		}
		setDate(range);
		onDateSelect(range);
	};

	return (
		<div className="p-2 md:p-4 bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm flex justify-center">
			{isLoading ? (
				<div className="flex items-center justify-center p-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
				</div>
			) : (
				<Calendar
					mode="range"
					selected={date}
					onSelect={handleSelect}
					numberOfMonths={1}
					disabled={[{ before: startOfToday() }, ...disabledDates]}
					className="rounded-md border-none"
					classNames={{
						day_selected:
							"bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white",
						day_today: "bg-gray-100 text-gray-900",
					}}
				/>
			)}
		</div>
	);
}