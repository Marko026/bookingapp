import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBooking, updateBooking } from "../actions";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock next/cache
vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
}));

// Mock db
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/db", () => ({
	db: {
		transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) =>
			fn({
				query: {
					apartments: { findFirst: mockFindFirst },
					bookings: { findFirst: mockFindFirst },
				},
				insert: () => ({ values: mockInsert }),
				update: () => ({
					set: (data: unknown) => ({
						where: () => {
							mockUpdate(data);
							return {};
						},
					}),
				}),
			}),
		),
	},
}));

// Mock rate limit
vi.mock("@/lib/rate-limit", () => ({
	checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 2 })),
}));

// Mock auth-server
vi.mock("@/lib/auth-server", () => ({
	getServerUser: vi.fn(() => Promise.resolve({ success: true })),
}));

// Mock email
vi.mock("@/lib/email", () => ({
	sendBookingEmails: vi.fn(() => Promise.resolve({ success: true })),
	sendApprovalEmail: vi.fn(() => Promise.resolve({ success: true })),
	sendCancellationEmail: vi.fn(() => Promise.resolve({ success: true })),
}));

describe("createBooking", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates a booking with server-calculated price", async () => {
		mockFindFirst.mockResolvedValueOnce({
			id: "550e8400-e29b-41d4-a716-446655440001",
			name: "Test Apartment",
			pricePerNight: 100,
			imageUrl: "img.jpg",
			images: [],
		});
		mockFindFirst.mockResolvedValueOnce(null); // no overlap
		mockInsert.mockResolvedValueOnce({});

		const result = await createBooking(
			{ success: false, message: "" },
			{
				apartmentId: "550e8400-e29b-41d4-a716-446655440001",
				guestName: "John Doe",
				guestEmail: "john@example.com",
				checkIn: "2026-04-23",
				checkOut: "2026-04-25",
				totalPrice: 9999, // manipulated client value
			},
		);

		expect(result.success).toBe(true);
		expect(mockInsert).toHaveBeenCalled();
		const inserted = mockInsert.mock.calls[0][0];
		expect(inserted.totalPrice).toBe(200); // 2 nights × 100€
		expect(inserted.checkIn).toBe("2026-04-23");
		expect(inserted.checkOut).toBe("2026-04-25");
	});

	it("rejects same-day checkIn and checkOut", async () => {
		const result = await createBooking(
			{ success: false, message: "" },
			{
				apartmentId: "550e8400-e29b-41d4-a716-446655440001",
				guestName: "John Doe",
				guestEmail: "john@example.com",
				checkIn: "2026-04-23",
				checkOut: "2026-04-23",
				totalPrice: 0,
			},
		);

		expect(result.success).toBe(false);
		expect(result.errors?.checkOut).toBeDefined();
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it("rejects reversed dates", async () => {
		const result = await createBooking(
			{ success: false, message: "" },
			{
				apartmentId: "550e8400-e29b-41d4-a716-446655440001",
				guestName: "John Doe",
				guestEmail: "john@example.com",
				checkIn: "2026-04-25",
				checkOut: "2026-04-23",
				totalPrice: 100,
			},
		);

		expect(result.success).toBe(false);
		expect(result.errors?.checkOut).toBeDefined();
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it("rejects invalid date strings", async () => {
		const result = await createBooking(
			{ success: false, message: "" },
			{
				apartmentId: "550e8400-e29b-41d4-a716-446655440001",
				guestName: "John Doe",
				guestEmail: "john@example.com",
				checkIn: "not-a-date",
				checkOut: "2026-04-25",
				totalPrice: 100,
			},
		);

		expect(result.success).toBe(false);
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it("rejects non-existent apartment", async () => {
		mockFindFirst.mockResolvedValueOnce(null); // apartment not found

		const result = await createBooking(
			{ success: false, message: "" },
			{
				apartmentId: "550e8400-e29b-41d4-a716-446655440999",
				guestName: "John Doe",
				guestEmail: "john@example.com",
				checkIn: "2026-04-23",
				checkOut: "2026-04-25",
				totalPrice: 200,
			},
		);

		expect(result.success).toBe(true); // wrapper succeeds
		expect(result.data?.success).toBe(false);
		expect(result.data?.message).toContain("Apartman");
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it("rejects overlapping bookings", async () => {
		mockFindFirst.mockResolvedValueOnce({
			id: "550e8400-e29b-41d4-a716-446655440001",
			name: "Test Apartment",
			pricePerNight: 100,
			imageUrl: "img.jpg",
			images: [],
		});
		mockFindFirst.mockResolvedValueOnce({
			id: 99,
			checkIn: "2026-04-24",
			checkOut: "2026-04-26",
		}); // overlap exists

		const result = await createBooking(
			{ success: false, message: "" },
			{
				apartmentId: "550e8400-e29b-41d4-a716-446655440001",
				guestName: "John Doe",
				guestEmail: "john@example.com",
				checkIn: "2026-04-23",
				checkOut: "2026-04-25",
				totalPrice: 200,
			},
		);

		expect(result.success).toBe(true); // wrapper succeeds
		expect(result.data?.success).toBe(false);
		expect(result.data?.message).toContain("zauzet");
		expect(mockInsert).not.toHaveBeenCalled();
	});
});

describe("updateBooking", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("recalculates price when admin updates dates", async () => {
		mockFindFirst
			.mockResolvedValueOnce({
				id: 1,
				apartmentId: "550e8400-e29b-41d4-a716-446655440001",
				checkIn: "2026-04-20",
				checkOut: "2026-04-22",
			})
			.mockResolvedValueOnce({
				id: "550e8400-e29b-41d4-a716-446655440001",
				pricePerNight: 150,
			})
			.mockResolvedValueOnce(null); // no overlap

		const result = await updateBooking(
			1,
			"2026-04-23",
			"2026-04-26",
			9999, // ignored admin-provided price
		);

		expect(result.success).toBe(true);
		expect(mockUpdate).toHaveBeenCalled();
		const updated = mockUpdate.mock.calls[0][0];
		expect(updated.totalPrice).toBe(450); // 3 nights × 150€
	});

	it("rejects same-day dates in update", async () => {
		const result = await updateBooking(1, "2026-04-23", "2026-04-23", 100);

		expect(result.success).toBe(false);
		expect(result.message).toContain("odjave");
		expect(mockUpdate).not.toHaveBeenCalled();
	});

	it("rejects overlapping dates excluding self", async () => {
		mockFindFirst
			.mockResolvedValueOnce({
				id: 1,
				apartmentId: "550e8400-e29b-41d4-a716-446655440001",
				checkIn: "2026-04-20",
				checkOut: "2026-04-22",
			})
			.mockResolvedValueOnce({
				id: "550e8400-e29b-41d4-a716-446655440001",
				pricePerNight: 100,
			})
			.mockResolvedValueOnce({
				id: 2,
				checkIn: "2026-04-24",
				checkOut: "2026-04-26",
			}); // overlap with another booking

		const result = await updateBooking(1, "2026-04-23", "2026-04-25", 200);

		expect(result.success).toBe(false);
		expect(result.message).toContain("zauzet");
		expect(mockUpdate).not.toHaveBeenCalled();
	});
});
