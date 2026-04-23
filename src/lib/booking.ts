import { differenceInCalendarDays } from "date-fns";

/**
 * Parse a "YYYY-MM-DD" string as a local midnight Date.
 * Avoids timezone-shift bugs from `new Date("2026-04-23")` which parses as UTC.
 */
export function parseLocalDate(dateString: string): Date {
	const [y, m, d] = dateString.split("-").map(Number);
	return new Date(y, m - 1, d);
}

/**
 * Calculate the number of nights between check-in and check-out.
 * Uses calendar-day difference, so it is immune to DST transitions
 * and timezone shifts.
 *
 * Defensively returns at least 1 night (callers should still validate
 * that checkOut > checkIn and reject same-day bookings).
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
	const nights = differenceInCalendarDays(checkOut, checkIn);
	return Math.max(1, nights);
}

/**
 * Calculate total price for a stay.
 *
 * Defensively returns at least pricePerNight (callers should still
 * validate that checkOut > checkIn and reject same-day bookings).
 */
export function calculateTotalPrice(
	checkIn: Date,
	checkOut: Date,
	pricePerNight: number,
): number {
	const nights = calculateNights(checkIn, checkOut);
	return nights * pricePerNight;
}
