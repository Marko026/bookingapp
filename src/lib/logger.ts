/**
 * Environment-aware Logger
 *
 * Centralizovani logging sistem koji razlikuje development i production režim.
 * U developmentu: detaljni log sa stack trace-ovima
 * U produkciji: strukturirani log bez osetljivih podataka
 */

import type { ErrorContext } from "./error-types";

/**
 * Log level za kategorizaciju logova
 */
export type LogLevel = "error" | "warn" | "info" | "debug";

/**
 * Struktura log entry-ja
 */
interface LogEntry {
	level: LogLevel;
	message: string;
	timestamp: string;
	context?: ErrorContext;
	stack?: string;
	data?: unknown;
}

/**
 * Osetljiva polja koja se ne smeju logovati u produkciji
 */
const SENSITIVE_FIELDS = [
	"password",
	"token",
	"secret",
	"apiKey",
	"api_key",
	"authorization",
	"cookie",
	"session",
	"creditCard",
	"credit_card",
];

/**
 * Proverava da li je trenutno development okruženje
 */
function isDevelopment(): boolean {
	return process.env.NODE_ENV === "development";
}

/**
 * Generiše timestamp u ISO formatu
 */
function getTimestamp(): string {
	return new Date().toISOString();
}

/**
 * Sanitizuje objekat uklanjanjem osetljivih polja
 */
function sanitizeData(data: unknown): unknown {
	if (data === null || data === undefined) {
		return data;
	}

	if (typeof data === "string") {
		// Only redact strings that look like actual secrets
		// JWT tokens, API keys, Bearer tokens, connection strings
		if (
			/^eyJ[A-Za-z0-9_-]+\.eyJ/.test(data) || // JWT
			/^sk-[A-Za-z0-9]{20,}/.test(data) || // API key pattern
			/^Bearer\s/.test(data) || // Bearer token
			/^(postgres|mongodb|redis):\/\/.*:.*@/.test(data) // Connection string with credentials
		) {
			return "[REDACTED]";
		}
		return data;
	}

	if (typeof data !== "object") {
		return data;
	}

	if (Array.isArray(data)) {
		return data.map(sanitizeData);
	}

	const sanitized: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(data as object)) {
		// Preskoči osetljiva polja
		if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
			sanitized[key] = "[REDACTED]";
		} else {
			sanitized[key] = sanitizeData(value);
		}
	}
	return sanitized;
}

/**
 * Sanitizuje kontekst za produkciju
 */
function sanitizeContext(context?: ErrorContext): ErrorContext | undefined {
	if (!context) return undefined;

	return {
		...context,
		metadata: context.metadata
			? (sanitizeData(context.metadata) as Record<string, unknown>)
			: undefined,
	};
}

/**
 * Formatira log entry za konzolu
 */
function formatLogEntry(entry: LogEntry): string {
	const { level, message, timestamp, context, stack, data } = entry;

	if (isDevelopment()) {
		// U developmentu: detaljan, čitljiv format
		const parts = [`[${timestamp}] ${level.toUpperCase()}: ${message}`];

		if (context) {
			parts.push(`Context: ${JSON.stringify(context, null, 2)}`);
		}

		if (data) {
			parts.push(`Data: ${JSON.stringify(data, null, 2)}`);
		}

		if (stack) {
			parts.push(`Stack:\n${stack}`);
		}

		return parts.join("\n");
	}

	// U produkciji: strukturirani JSON format
	const prodEntry = {
		level,
		message,
		timestamp,
		context: sanitizeContext(context),
		data: data ? sanitizeData(data) : undefined,
		// Stack trace u produkciji samo ako je kritično
		stack: level === "error" ? stack : undefined,
	};

	return JSON.stringify(prodEntry);
}

/**
 * Loguje grešku sa kontekstom
 */
export function logError(error: unknown, context?: ErrorContext): void {
	const isDev = isDevelopment();

	let message: string;
	let stack: string | undefined;

	if (error instanceof Error) {
		message = error.message;
		stack = error.stack;
	} else if (typeof error === "string") {
		message = error;
	} else {
		message = "Unknown error";
	}

	const entry: LogEntry = {
		level: "error",
		message,
		timestamp: getTimestamp(),
		context: isDev ? context : sanitizeContext(context),
		stack: isDev ? stack : undefined,
		data: isDev ? error : undefined,
	};

	// Uvek koristimo console.error za error level
	console.error(formatLogEntry(entry));
}

/**
 * Loguje upozorenje
 */
export function logWarn(message: string, context?: ErrorContext): void {
	const isDev = isDevelopment();

	const entry: LogEntry = {
		level: "warn",
		message,
		timestamp: getTimestamp(),
		context: isDev ? context : sanitizeContext(context),
	};

	console.warn(formatLogEntry(entry));
}

/**
 * Loguje informativnu poruku
 */
export function logInfo(message: string, context?: ErrorContext): void {
	const isDev = isDevelopment();

	// U produkciji logujemo samo error i warn
	if (!isDev) return;

	const entry: LogEntry = {
		level: "info",
		message,
		timestamp: getTimestamp(),
		context,
	};

	console.log(formatLogEntry(entry));
}

/**
 * Loguje debug poruku (samo u developmentu)
 */
export function logDebug(message: string, data?: unknown, context?: ErrorContext): void {
	if (!isDevelopment()) return;

	const entry: LogEntry = {
		level: "debug",
		message,
		timestamp: getTimestamp(),
		context,
		data,
	};

	console.log(formatLogEntry(entry));
}
