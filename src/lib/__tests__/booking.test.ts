import { describe, expect, it } from "vitest";
import { calculateNights, calculateTotalPrice } from "../booking";

describe("calculateNights", () => {
	it("returns 2 nights for a 2-day span", () => {
		const checkIn = new Date(2026, 3, 23); // April 23
		const checkOut = new Date(2026, 3, 25); // April 25
		expect(calculateNights(checkIn, checkOut)).toBe(2);
	});

	it("returns 1 night for a 1-day span", () => {
		const checkIn = new Date(2026, 3, 23);
		const checkOut = new Date(2026, 3, 24);
		expect(calculateNights(checkIn, checkOut)).toBe(1);
	});

	it("defensively returns 1 night for same-day selection", () => {
		const checkIn = new Date(2026, 3, 23);
		const checkOut = new Date(2026, 3, 23);
		expect(calculateNights(checkIn, checkOut)).toBe(1);
	});

	it("handles DST spring forward correctly", () => {
		// March 8 → March 9 (2026 spring forward in US)
		const checkIn = new Date(2026, 2, 8);
		const checkOut = new Date(2026, 2, 9);
		expect(calculateNights(checkIn, checkOut)).toBe(1);
	});

	it("handles DST fall back correctly", () => {
		// November 1 → November 2 (2026 fall back in US)
		const checkIn = new Date(2026, 10, 1);
		const checkOut = new Date(2026, 10, 2);
		expect(calculateNights(checkIn, checkOut)).toBe(1);
	});

	it("handles a 30-night stay", () => {
		const checkIn = new Date(2026, 3, 1);
		const checkOut = new Date(2026, 4, 1);
		expect(calculateNights(checkIn, checkOut)).toBe(30);
	});

	it("handles leap year correctly", () => {
		const checkIn = new Date(2024, 1, 28); // Feb 28, 2024
		const checkOut = new Date(2024, 2, 1); // Mar 1, 2024
		expect(calculateNights(checkIn, checkOut)).toBe(2);
	});
});

describe("calculateTotalPrice", () => {
	it("calculates correct total for multiple nights", () => {
		const checkIn = new Date(2026, 3, 23);
		const checkOut = new Date(2026, 3, 25);
		expect(calculateTotalPrice(checkIn, checkOut, 100)).toBe(200);
	});

	it("calculates correct total for 1 night", () => {
		const checkIn = new Date(2026, 3, 23);
		const checkOut = new Date(2026, 3, 24);
		expect(calculateTotalPrice(checkIn, checkOut, 85)).toBe(85);
	});

	it("defensively returns pricePerNight for same-day selection", () => {
		const checkIn = new Date(2026, 3, 23);
		const checkOut = new Date(2026, 3, 23);
		expect(calculateTotalPrice(checkIn, checkOut, 120)).toBe(120);
	});
});
