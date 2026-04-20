/**
 * Error Handling Utility Functions
 *
 * Centralizovane funkcije za obradu grešaka koje se koriste širom aplikacije.
 * Obezbeđuje konzistentno klasifikovanje, logovanje i user-friendly poruke.
 */

import { getUserFriendlyMessage } from "./error-messages";
import { createAppError, type ErrorContext, ErrorType } from "./error-types";
import { logError } from "./logger";

/**
 * Klasifikuje grešku prepoznavanjem tipa iz Error objekta ili stringa
 * @param error - Bilo kakva greška (Error objekat, string, ili unknown)
 * @returns ErrorType enum vrednost
 */
export function classifyError(error: unknown): ErrorType {
	// Ako je već AppError, vrati njegov tip
	if (
		typeof error === "object" &&
		error !== null &&
		"type" in error &&
		Object.values(ErrorType).includes(
			(error as { type: string }).type as ErrorType,
		)
	) {
		return (error as { type: ErrorType }).type;
	}

	let errorMessage = "";

	if (error instanceof Error) {
		errorMessage = error.message.toLowerCase();
	} else if (typeof error === "string") {
		errorMessage = error.toLowerCase();
	} else {
		return ErrorType.UNKNOWN_ERROR;
	}

	// External API error patterns - check BEFORE database to avoid "Request" matching "query"
	if (
		errorMessage.includes("api") ||
		errorMessage.includes("external") ||
		errorMessage.includes("service") ||
		errorMessage.includes("email") ||
		errorMessage.includes("resend") ||
		errorMessage.includes("fetch") ||
		errorMessage.includes("network") ||
		errorMessage.includes("http") ||
		errorMessage.includes("request") ||
		errorMessage.includes("connection refused") ||
		errorMessage.includes("connection reset") ||
		errorMessage.includes("request timeout")
	) {
		return ErrorType.EXTERNAL_API_ERROR;
	}

	// Database error patterns - specific identifiers only (avoid broad "connection"/"timeout")
	if (
		errorMessage.includes("database") ||
		errorMessage.includes("db ") ||
		errorMessage.includes("query") ||
		errorMessage.includes("sql") ||
		errorMessage.includes("postgres") ||
		errorMessage.includes("drizzle") ||
		errorMessage.includes("unique constraint") ||
		errorMessage.includes("foreign key") ||
		errorMessage.includes("connection timeout")
	) {
		return ErrorType.DATABASE_ERROR;
	}

	// Auth error patterns
	if (
		errorMessage.includes("auth") ||
		errorMessage.includes("unauthorized") ||
		errorMessage.includes("forbidden") ||
		errorMessage.includes("permission") ||
		errorMessage.includes("login") ||
		errorMessage.includes("session") ||
		errorMessage.includes("token") ||
		errorMessage.includes("jwt") ||
		errorMessage.includes("prijav") || // Serbian "prijava"
		errorMessage.includes("dozvol") || // Serbian "dozvola"
		errorMessage.includes("admin")
	) {
		return ErrorType.AUTH_ERROR;
	}

	// Validation error patterns
	if (
		errorMessage.includes("validation") ||
		errorMessage.includes("invalid") ||
		errorMessage.includes("required") ||
		errorMessage.includes("format") ||
		errorMessage.includes("zod") ||
		errorMessage.includes("schema") ||
		errorMessage.includes("prover") || // Serbian "proverite"
		errorMessage.includes("obavezno") || // Serbian "obavezno"
		errorMessage.includes("mor")
	) {
		// Serbian "mora"
		return ErrorType.VALIDATION_ERROR;
	}

	// Storage error patterns
	if (
		errorMessage.includes("storage") ||
		errorMessage.includes("file") ||
		errorMessage.includes("upload") ||
		errorMessage.includes("image") ||
		errorMessage.includes("bucket") ||
		errorMessage.includes("supabase")
	) {
		return ErrorType.STORAGE_ERROR;
	}

	return ErrorType.UNKNOWN_ERROR;
}

/**
 * Sanitizuje grešku za produkciju - vraća samo user-friendly poruku
 * Nikada ne vraća raw error.message koji može sadržati interne detalje
 * @param error - Bilo kakva greška
 * @returns User-friendly poruka na srpskom
 */
export function sanitizeErrorForProduction(error: unknown): string {
	const errorType = classifyError(error);
	return getUserFriendlyMessage(errorType);
}

/**
 * Glavna funkcija za obradu grešaka
 * Klasifikuje grešku, loguje je sa kontekstom, i vraća user-friendly poruku
 *
 * @param error - Bilo kakva greška
 * @param context - Opcioni kontekst za debugging
 * @returns Objekat sa success: false i user-friendly message
 *
 * @example
 * try {
 *   await someOperation();
 * } catch (error) {
 *   return handleError(error, { action: 'createBooking', userId: '123' });
 * }
 */
export function handleError(
	error: unknown,
	context?: ErrorContext,
): { success: false; message: string } {
	const errorType = classifyError(error);
	const userMessage = getUserFriendlyMessage(errorType);

	// Loguj grešku interno sa svim detaljima
	logError(error, context);

	return {
		success: false,
		message: userMessage,
	};
}

/**
 * Kreira AppError objekat sa svim informacijama
 * Korisno kada želiš da eksplicitno kreiraš grešku sa specifičnim tipom
 *
 * @param type - Tip greške
 * @param message - Tehnička poruka (za logging)
 * @param context - Opcioni kontekst
 * @returns AppError objekat
 */
export function createError(
	type: ErrorType,
	message: string,
	context?: ErrorContext,
): ReturnType<typeof createAppError> {
	const userMessage = getUserFriendlyMessage(type);
	return createAppError(type, message, userMessage, { context });
}

/**
 * Helper za throw-anje grešaka koje će biti uhvaćene i obrađene
 * Korisno za early returns sa greškama
 *
 * @param type - Tip greške
 * @param message - Poruka
 * @param context - Kontekst
 * @throws Uvek baca Error
 */
export function throwError(
	type: ErrorType,
	message: string,
	context?: ErrorContext,
): never {
	const userMessage = getUserFriendlyMessage(type);
	const appError = createAppError(type, message, userMessage, { context });

	// Kreiraj Error objekat sa dodatnim poljima i originalnim stack-om
	const error = new Error(message, { cause: appError });
	(error as unknown as Record<string, unknown>).type = appError.type;
	(error as unknown as Record<string, unknown>).userMessage =
		appError.userMessage;
	(error as unknown as Record<string, unknown>).context = context;

	throw error;
}

/**
 * Type guard za proveru da li je rezultat success
 */
export function isSuccess<T>(
	result: { success: boolean; data?: T } | { success: false; message: string },
): result is { success: true; data: T } {
	return result.success === true;
}

/**
 * Type guard za proveru da li je rezultat error
 */
export function isError(
	result: { success: boolean } | { success: false; message: string },
): result is { success: false; message: string } {
	return result.success === false && "message" in result;
}
