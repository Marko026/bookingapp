import { useCallback, useState } from "react";
import {
	deleteBooking as deleteBookingAction,
	getAllBookings,
	updateBooking as updateBookingAction,
	updateBookingStatusAction,
} from "@/features/booking/actions";
import { toast } from "@/lib/toast";
import type { Booking } from "@/types";

export function useAdminBookings(initialPage = 1) {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [pagination, setPagination] = useState({
		page: initialPage,
		pageSize: 10,
		total: 0,
		totalPages: 1,
	});
	const [isLoading, setIsLoading] = useState(false);

	const fetchBookings = useCallback(async (page = 1) => {
		setIsLoading(true);
		try {
			const result = await getAllBookings(page);
			if (result.success && result.bookings) {
				setBookings(result.bookings as unknown as Booking[]);
				if (result.pagination) {
					setPagination(result.pagination);
				}
			}
		} catch (error) {
			console.error("Failed to fetch bookings:", error);
			toast.error("Greška pri učitavanju rezervacija");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const updateBookingStatus = async (
		id: number,
		status: "confirmed" | "cancelled",
	) => {
		const result = await updateBookingStatusAction(id, status);
		if (result.success) {
			await fetchBookings(pagination.page);
			if (status === "confirmed") {
				toast.success("Rezervacija je potvrđena", {
					description: "Gost je obavešten emailom.",
				});
			} else {
				toast.info("Rezervacija je odbijena", {
					description: "Gost je obavešten.",
				});
			}
			return true;
		} else {
			toast.error("Greška pri ažuriranju statusa", {
				description: "Pokušajte ponovo.",
			});
			return false;
		}
	};

	const removeBooking = async (id: number) => {
		try {
			const result = await deleteBookingAction(id);
			if (result.success) {
				await fetchBookings(pagination.page);
				toast.success("Rezervacija je otkazana");
				return true;
			}
		} catch (error) {
			console.error("Delete booking error:", error);
			toast.error("Greška pri brisanju rezervacije");
		}
		return false;
	};

	const updateBookingDetails = async (
		id: number,
		data: { checkIn: string; checkOut: string; totalPrice: number },
	) => {
		try {
			const result = await updateBookingAction(
				id,
				data.checkIn,
				data.checkOut,
				data.totalPrice,
			);
			if (result.success) {
				await fetchBookings(pagination.page);
				toast.success("Rezervacija je ažurirana");
				return true;
			}
		} catch (error) {
			console.error("Save booking error:", error);
			toast.error("Greška pri izmeni rezervacije");
		}
		return false;
	};

	return {
		bookings,
		pagination,
		isLoading,
		fetchBookings,
		updateBookingStatus,
		removeBooking,
		updateBookingDetails,
		setBookings, // Exposed if needed for optimistic updates locally
	};
}
