/**
 * API Error Handler
 *
 * Utility funkcije za obradu grešaka u API route-ovima.
 * Osigurava da API routes uvek vraćaju generičke poruke bez internih detalja.
 */

import { NextResponse } from "next/server";
import type { ErrorContext } from "./error-types";
import { handleError } from "./error-handling";

/**
 * Handler za API greške koji vraća NextResponse sa user-friendly porukom
 *
 * @param error - Bilo kakva greška
 * @param context - Opcioni kontekst za debugging
 * @param statusCode - HTTP status code (default: 500)
 * @returns NextResponse sa generičkom porukom
 *
 * @example
 * try {
 *   const data = await fetchData();
 *   return NextResponse.json({ success: true, data });
 * } catch (error) {
 *   return handleApiError(error, { path: '/api/data', action: 'fetchData' });
 * }
 */
export function handleApiError(
	error: unknown,
	context?: ErrorContext,
	statusCode: number = 500,
): NextResponse {
	const result = handleError(error, context);

	return NextResponse.json(
		{
			success: false,
			error: result.message,
		},
		{ status: statusCode },
	);
}

/**
 * Handler za API validacione greške (400 Bad Request)
 *
 * @param error - Greška validacije
 * @param validationErrors - Detalji o validacionim greškama po poljima
 * @param context - Opcioni kontekst
 * @returns NextResponse sa 400 statusom
 */
export function handleValidationError(
	error: unknown,
	validationErrors?: Record<string, string[]>,
	context?: ErrorContext,
): NextResponse {
	const result = handleError(error, context);

	return NextResponse.json(
		{
			success: false,
			error: result.message,
			errors: validationErrors,
		},
		{ status: 400 },
	);
}

/**
 * Handler za API auth greške (401 Unauthorized ili 403 Forbidden)
 *
 * @param error - Auth greška
 * @param statusCode - 401 ili 403
 * @param context - Opcioni kontekst
 * @returns NextResponse sa auth statusom
 */
export function handleAuthError(
	error: unknown,
	statusCode: 401 | 403 = 401,
	context?: ErrorContext,
): NextResponse {
	const result = handleError(error, context);

	return NextResponse.json(
		{
			success: false,
			error: result.message,
		},
		{ status: statusCode },
	);
}

/**
 * Wrapper za API route handler-e koji automatski hvata i obrađuje greške
 *
 * @param handler - Originalni route handler
 * @returns Wrapped handler sa error handlingom
 *
 * @example
 * export const GET = withErrorHandling(async (request: Request) => {
 *   const data = await fetchData();
 *   return NextResponse.json({ success: true, data });
 * });
 */
export function withErrorHandling<T extends (request: Request) => Promise<NextResponse>>(
	handler: T,
	context?: Omit<ErrorContext, "action">,
): (request: Request) => Promise<NextResponse> {
	return async (request: Request): Promise<NextResponse> => {
		try {
			return await handler(request);
		} catch (error) {
			return handleApiError(error, {
				...context,
				action: handler.name || "apiHandler",
			});
		}
	};
}
