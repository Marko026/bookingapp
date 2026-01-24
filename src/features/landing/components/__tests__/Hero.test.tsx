import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Hero } from "../Hero";

// Mock next-intl
vi.mock("next-intl", () => ({
	useTranslations: (namespace: string) => (key: string) =>
		`${namespace}.${key}`,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
	motion: {
		div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
		h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
	},
}));

// Mock next/image
vi.mock("next/image", () => ({
	default: ({ src, alt, ...props }: any) => (
		<img src={src} alt={alt} {...props} />
	),
}));

// Mock next/link
vi.mock("@/i18n/routing", () => ({
	Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

// Mock lenis
vi.mock("lenis/react", () => ({
	useLenis: () => ({
		scrollTo: vi.fn(),
	}),
}));

describe("Hero Component - Hydration Safety", () => {
	it("should not contain a div inside an h1 (invalid HTML nesting)", () => {
		render(<Hero />);

		const h1 = screen.getByRole("heading", { level: 1 });

		// Check if h1 contains any div
		const nestedDivs = h1.querySelectorAll("div");

		expect(nestedDivs.length).toBe(0);
	});
});
