import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, clearRateLimit } from "../rate-limit";

describe("checkRateLimit", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it("allows requests within the limit", () => {
		const result1 = checkRateLimit("test-key", {
			maxRequests: 3,
			windowMs: 60_000,
		});
		expect(result1.allowed).toBe(true);
		expect(result1.remaining).toBe(2);

		const result2 = checkRateLimit("test-key", {
			maxRequests: 3,
			windowMs: 60_000,
		});
		expect(result2.allowed).toBe(true);
		expect(result2.remaining).toBe(1);

		const result3 = checkRateLimit("test-key", {
			maxRequests: 3,
			windowMs: 60_000,
		});
		expect(result3.allowed).toBe(true);
		expect(result3.remaining).toBe(0);
	});

	it("blocks requests after limit is reached", () => {
		for (let i = 0; i < 5; i++) {
			checkRateLimit("block-key", { maxRequests: 5, windowMs: 60_000 });
		}
		const result = checkRateLimit("block-key", {
			maxRequests: 5,
			windowMs: 60_000,
		});
		expect(result.allowed).toBe(false);
		expect(result.remaining).toBe(0);
	});

	it("resets after window expires", () => {
		checkRateLimit("reset-key", { maxRequests: 1, windowMs: 60_000 });
		const before = checkRateLimit("reset-key", {
			maxRequests: 1,
			windowMs: 60_000,
		});
		expect(before.allowed).toBe(false);

		vi.advanceTimersByTime(61_000);

		const after = checkRateLimit("reset-key", {
			maxRequests: 1,
			windowMs: 60_000,
		});
		expect(after.allowed).toBe(true);
	});

	it("uses different keys independently", () => {
		const resultA = checkRateLimit("key-a", {
			maxRequests: 1,
			windowMs: 60_000,
		});
		expect(resultA.allowed).toBe(true);

		const resultB = checkRateLimit("key-b", {
			maxRequests: 1,
			windowMs: 60_000,
		});
		expect(resultB.allowed).toBe(true);

		const resultA2 = checkRateLimit("key-a", {
			maxRequests: 1,
			windowMs: 60_000,
		});
		expect(resultA2.allowed).toBe(false);
	});

	it("clears rate limit when requested", () => {
		checkRateLimit("clear-key", { maxRequests: 1, windowMs: 60_000 });
		const before = checkRateLimit("clear-key", {
			maxRequests: 1,
			windowMs: 60_000,
		});
		expect(before.allowed).toBe(false);

		clearRateLimit("clear-key");

		const after = checkRateLimit("clear-key", {
			maxRequests: 1,
			windowMs: 60_000,
		});
		expect(after.allowed).toBe(true);
	});
});
