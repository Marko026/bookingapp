import { describe, expect, it, vi } from "vitest";
import {
	classifyError,
	createError,
	handleError,
	isError,
	isSuccess,
	sanitizeErrorForProduction,
} from "../error-handling";
import { ErrorType } from "../error-types";

describe("classifyError", () => {
	it("should classify database errors correctly", () => {
		const dbErrors = [
			new Error("database connection failed"),
			new Error("timeout connecting to postgres"),
			new Error("unique constraint violation"),
			new Error("foreign key constraint failed"),
			new Error("Query failed"),
			new Error("SQL syntax error"),
			new Error("Drizzle ORM error"),
		];

		for (const error of dbErrors) {
			expect(classifyError(error)).toBe(ErrorType.DATABASE_ERROR);
		}
	});

	it("should classify auth errors correctly", () => {
		const authErrors = [
			new Error("unauthorized access"),
			new Error("forbidden"),
			new Error("invalid token"),
			new Error("jwt expired"),
			new Error("Nemate administratorska prava"),
			new Error("Greška prilikom prijave"),
		];

		for (const error of authErrors) {
			expect(classifyError(error)).toBe(ErrorType.AUTH_ERROR);
		}
	});

	it("should classify validation errors correctly", () => {
		const validationErrors = [
			new Error("validation failed"),
			new Error("invalid input format"),
			new Error("field is required"),
			new Error("zod schema validation error"),
			new Error("Proverite unete podatke"),
			new Error("Obavezno polje"),
		];

		for (const error of validationErrors) {
			expect(classifyError(error)).toBe(ErrorType.VALIDATION_ERROR);
		}
	});

	it("should classify external API errors correctly", () => {
		const apiErrors = [
			new Error("external API timeout"),
			new Error("fetch failed"),
			new Error("network error"),
			new Error("HTTP 500"),
			new Error("Resend API error"),
			new Error("email service unavailable"),
		];

		for (const error of apiErrors) {
			expect(classifyError(error)).toBe(ErrorType.EXTERNAL_API_ERROR);
		}
	});

	it("should classify storage errors correctly", () => {
		const storageErrors = [
			new Error("storage bucket not found"),
			new Error("file upload failed"),
			new Error("image processing error"),
			new Error("Supabase storage error"),
		];

		for (const error of storageErrors) {
			expect(classifyError(error)).toBe(ErrorType.STORAGE_ERROR);
		}
	});

	it("should return UNKNOWN_ERROR for unrecognized errors", () => {
		const unknownErrors = [
			new Error("something weird happened"),
			new Error("custom error message"),
			"just a string error",
			123, // number
			null,
			undefined,
		];

		for (const error of unknownErrors) {
			expect(classifyError(error)).toBe(ErrorType.UNKNOWN_ERROR);
		}
	});

	it("should preserve AppError type if already classified", () => {
		const appError = {
			type: ErrorType.AUTH_ERROR,
			message: "test",
			userMessage: "test message",
		};

		expect(classifyError(appError)).toBe(ErrorType.AUTH_ERROR);
	});
});

describe("sanitizeErrorForProduction", () => {
	it("should return user-friendly Serbian messages", () => {
		const dbError = new Error("Connection to postgres failed");
		const message = sanitizeErrorForProduction(dbError);

		expect(message).toContain("bazom podataka");
		expect(message).not.toContain("postgres");
		expect(message).not.toContain("Connection");
	});

	it("should never return raw error messages", () => {
		const sensitiveError = new Error("Internal server error: password123 exposed");
		const message = sanitizeErrorForProduction(sensitiveError);

		expect(message).not.toContain("password123");
		expect(message).not.toContain("Internal server error");
	});
});

describe("handleError", () => {
	it("should return success: false with user-friendly message", () => {
		const error = new Error("database connection failed");
		const result = handleError(error);

		expect(result.success).toBe(false);
		expect(result.message).toBeDefined();
		expect(typeof result.message).toBe("string");
		expect(result.message.length).toBeGreaterThan(0);
	});

	it("should never expose raw error messages", () => {
		const sensitiveError = new Error("Critical: SQL_INJECTION_DETECTED");
		const result = handleError(sensitiveError);

		expect(result.message).not.toContain("SQL_INJECTION_DETECTED");
		expect(result.message).not.toContain("Critical");
	});
});

describe("createError", () => {
	it("should create AppError with all fields", () => {
		const error = createError(ErrorType.DATABASE_ERROR, "Connection timeout", {
			action: "fetchUser",
			userId: "123",
		});

		expect(error.type).toBe(ErrorType.DATABASE_ERROR);
		expect(error.message).toBe("Connection timeout");
		expect(error.userMessage).toContain("bazom podataka");
		expect(error.context?.action).toBe("fetchUser");
		expect(error.context?.userId).toBe("123");
	});
});

describe("type guards", () => {
	describe("isSuccess", () => {
		it("should return true for success results", () => {
			const successResult = { success: true, data: { id: 1 } };
			expect(isSuccess(successResult)).toBe(true);
		});

		it("should return false for error results", () => {
			const errorResult = { success: false, message: "error" };
			expect(isSuccess(errorResult)).toBe(false);
		});
	});

	describe("isError", () => {
		it("should return true for error results", () => {
			const errorResult = { success: false, message: "error" };
			expect(isError(errorResult)).toBe(true);
		});

		it("should return false for success results", () => {
			const successResult = { success: true };
			expect(isError(successResult)).toBe(false);
		});

		it("should return false for results without message", () => {
			const noMessageResult = { success: false };
			expect(isError(noMessageResult)).toBe(false);
		});
	});
});
