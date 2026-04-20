import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { logError, logWarn, logInfo, logDebug } from "../logger";

describe("Logger", () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
	});

	describe("logError", () => {
		it("should log errors in development mode", () => {
			vi.stubEnv("NODE_ENV", "development");
			const error = new Error("Test error");
			logError(error, { action: "test", userId: "123" });

			expect(consoleErrorSpy).toHaveBeenCalled();
			const loggedMessage = consoleErrorSpy.mock.calls[0][0];
			expect(loggedMessage).toContain("Test error");
			expect(loggedMessage).toContain("test");
			expect(loggedMessage).toContain("123");
		});

		it("should log errors in production mode", () => {
			vi.stubEnv("NODE_ENV", "production");
			const error = new Error("Test error");
			logError(error, { action: "test", userId: "123" });

			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		it("should handle string errors", () => {
			vi.stubEnv("NODE_ENV", "development");
			logError("String error message");

			expect(consoleErrorSpy).toHaveBeenCalled();
			const loggedMessage = consoleErrorSpy.mock.calls[0][0];
			expect(loggedMessage).toContain("String error message");
		});

		it("should handle unknown error types", () => {
			vi.stubEnv("NODE_ENV", "development");
			logError(12345);

			expect(consoleErrorSpy).toHaveBeenCalled();
			const loggedMessage = consoleErrorSpy.mock.calls[0][0];
			expect(loggedMessage).toContain("Unknown error");
		});

		it("should not log sensitive data in production", () => {
			vi.stubEnv("NODE_ENV", "production");
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
			vi.stubEnv("NODE_ENV", "development");
			logWarn("Warning message", { action: "test" });

			expect(consoleWarnSpy).toHaveBeenCalled();
		});

		it("should log warnings in production", () => {
			vi.stubEnv("NODE_ENV", "production");
			logWarn("Warning message");

			expect(consoleWarnSpy).toHaveBeenCalled();
		});
	});

	describe("logInfo", () => {
		it("should log info in development", () => {
			vi.stubEnv("NODE_ENV", "development");
			logInfo("Info message", { action: "test" });

			expect(consoleLogSpy).toHaveBeenCalled();
		});

		it("should not log info in production", () => {
			vi.stubEnv("NODE_ENV", "production");
			logInfo("Info message");

			expect(consoleLogSpy).not.toHaveBeenCalled();
		});
	});

	describe("logDebug", () => {
		it("should log debug in development", () => {
			vi.stubEnv("NODE_ENV", "development");
			logDebug("Debug message", { foo: "bar" });

			expect(consoleLogSpy).toHaveBeenCalled();
		});

		it("should not log debug in production", () => {
			vi.stubEnv("NODE_ENV", "production");
			logDebug("Debug message", { foo: "bar" });

			expect(consoleLogSpy).not.toHaveBeenCalled();
		});
	});
});
