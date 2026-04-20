/**
 * Error Types and Classification System
 *
 * Centralizovana definicija svih error tipova u aplikaciji.
 * Omogućava konzistentno klasifikovanje grešaka i mapiranje na user-friendly poruke.
 */

export enum ErrorType {
	/** Database connection, query, or transaction errors */
	DATABASE_ERROR = "DATABASE_ERROR",
	/** Authentication and authorization errors */
	AUTH_ERROR = "AUTH_ERROR",
	/** Input validation errors (Zod, manual validation) */
	VALIDATION_ERROR = "VALIDATION_ERROR",
	/** External API/service errors (email, translation, etc.) */
	EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
	/** File system or storage errors */
	STORAGE_ERROR = "STORAGE_ERROR",
	/** Unknown/unexpected errors */
	UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Struktura aplikacione greške sa svim relevantnim informacijama
 */
export interface AppError {
	/** Tip greške za klasifikaciju */
	type: ErrorType;
	/** Originalna/tehnička poruka (za logging) */
	message: string;
	/** User-friendly poruka na srpskom (za prikaz korisniku) */
	userMessage: string;
	/** Opcioni kontekst za debugging */
	context?: ErrorContext;
	/** Original error ako postoji */
	cause?: unknown;
}

/**
 * Kontekst za bolje razumevanje greške prilikom debugginga
 */
export interface ErrorContext {
	/** ID korisnika koji je izazvao grešku */
	userId?: string;
	/** Akcija koja se izvršavala */
	action?: string;
	/** Putanja ili route */
	path?: string;
	/** Dodatni metadata */
	metadata?: Record<string, unknown>;
	/** Timestamp kada se greška desila */
	timestamp?: string;
}

/**
 * Type guard functions za proveru tipova grešaka
 */
export function isDatabaseError(error: AppError): boolean {
	return error.type === ErrorType.DATABASE_ERROR;
}

export function isAuthError(error: AppError): boolean {
	return error.type === ErrorType.AUTH_ERROR;
}

export function isValidationError(error: AppError): boolean {
	return error.type === ErrorType.VALIDATION_ERROR;
}

export function isExternalApiError(error: AppError): boolean {
	return error.type === ErrorType.EXTERNAL_API_ERROR;
}

export function isStorageError(error: AppError): boolean {
	return error.type === ErrorType.STORAGE_ERROR;
}

/**
 * Kreira AppError objekat sa svim potrebnim poljima
 */
export function createAppError(
	type: ErrorType,
	message: string,
	userMessage: string,
	options?: {
		context?: ErrorContext;
		cause?: unknown;
	},
): AppError {
	return {
		type,
		message,
		userMessage,
		context: options?.context,
		cause: options?.cause,
	};
}
