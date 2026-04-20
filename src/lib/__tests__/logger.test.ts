import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { logError, logWarn, logInfo, logDebug } from "../logger";

describe("Logger", () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;
	let originalEnv: string | undefined;

	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		originalEnv = process.env.NODE_ENV;
	});

	afterEach(() => {
		vi.restoreAllMocks();
		process.env.NODE_ENV = originalEnv;
	});

	describe("logError", () => {
		it("should log errors in development mode", () => {
			process.env.NODE_ENV = "development";
			const error = new Error("Test error");
			logError(error, { action: "test", userId: "123" });

			expect(consoleErrorSpy).toHaveBeenCalled();
			const loggedMessage = consoleErrorSpy.mock.calls[0][0];
			expect(loggedMessage).toContain("Test error");
			expect(loggedMessage).toContain("test");
			expect(loggedMessage).toContain("123");
		});

		it("should log errors in production mode", () => {
			process.env.NODE_ENV = "production";
			const error = new Error("Test error");
			logError(error, { action: "test", userId: "123" });

			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		it("should handle string errors", () => {
			process.env.NODE_ENV = "development";
			logError("String error message");

			expect(consoleErrorSpy).toHaveBeenCalled();
			const loggedMessage = consoleErrorSpy.mock.calls[0][0];
			expect(loggedMessage).toContain("String error message");
		});

		it("should handle unknown error types", () => {
			process.env.NODE_ENV = "development";
			logError(12345);

			expect(consoleErrorSpy).toHaveBeenCalled();
			const loggedMessage = consoleErrorSpy.mock.calls[0][0];
			expect(loggedMessage).toContain("Unknown error");
		});

		it("should not log sensitive data in production", () => {
			process.env.NODE_ENV = "production";
			const error = new Error("Test error");
			logError(error, {
				action: "login",
				metadata: {
					password: "secret123",
					token: "bearer-token-xyz",
					apiKey: "sk-12345",
				},
			});

			expect(consoleErrorSpy).toHaveBeenCalled();
			const loggedOutput = JSON.stringify(consoleErrorSpy.mock.calls[0]);
			expect(loggedOutput).not.toContain("secret123");
			expect(loggedOutput).not.toContain("bearer-token-xyz");
			expect(loggedOutput).not.toContain("sk-12345");
			expect(loggedOutput).toContain("[REDACTED]");
		});
	});

	describe("logWarn", () => {
		it("should log warnings in development", () => {
			process.env.NODE_ENV = "development";
			logWarn("Warning message", { action: "test" });

			expect(consoleWarnSpy).toHaveBeenCalled();
		});

		it("should log warnings in production", () => {
			process.env.NODE_ENV = "production";
			logWarn("Warning message");

			expect(consoleWarnSpy).toHaveBeenCalled();
		});
	});

	describe("logInfo", () => {
		it("should log info in development", () => {
			process.env.NODE_ENV = "development";
			logInfo("Info message", { action: "test" });

			expect(consoleLogSpy).toHaveBeenCalled();
		});

		it("should not log info in production", () => {
			process.env.NODE_ENV = "production";
			logInfo("Info message");

			expect(consoleLogSpy).not.toHaveBeenCalled();
		});
	});

	describe("logDebug", () => {
		it("should log debug in development", () => {
			process.env.NODE_ENV = "development";
			logDebug("Debug message", { foo: "bar" });

			expect(consoleLogSpy).toHaveBeenCalled();
		});

		it("should not log debug in production", () => {
			process.env.NODE_ENV = "production";
			logDebug("Debug message", { foo: "bar" });

			expect(consoleLogSpy).not.toHaveBeenCalled();
		});
	});
});
