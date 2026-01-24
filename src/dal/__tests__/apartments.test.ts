import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { getAllApartmentsPublic } from "../apartments";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock the db module
vi.mock("@/db", () => ({
	db: {
		query: {
			apartments: {
				findMany: vi.fn(),
				findFirst: vi.fn(),
			},
		},
	},
}));

describe("DAL: apartments", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getAllApartmentsPublic", () => {
		it("should return mapped apartments when db returns data", async () => {
			const mockApartments = [
				{
					id: 1,
					name: "Test Apt",
					nameEn: "Test Apt En",
					description: "Desc",
					descriptionEn: "Desc En",
					pricePerNight: 100,
					capacity: 4,
					latitude: 10,
					longitude: 20,
					images: [{ imageUrl: "img1.jpg", displayOrder: 1 }],
				},
			];

			(db.query.apartments.findMany as any).mockResolvedValue(mockApartments);

			const result = await getAllApartmentsPublic();

			expect(db.query.apartments.findMany).toHaveBeenCalled();
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe("Test Apt");
			expect(result[0].images).toEqual(["img1.jpg"]);
		});

		it("should return empty array on error", async () => {
			(db.query.apartments.findMany as any).mockRejectedValue(
				new Error("DB Error"),
			);

			const result = await getAllApartmentsPublic();

			expect(result).toEqual([]);
		});
	});
});
