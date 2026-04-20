/**
 * User-friendly Error Message Mapping
 *
 * Mapira ErrorType na srpske poruke koje su razumljive korisnicima.
 * Sve poruke su kratke, jasne i akcija-orijentisane.
 */

import { ErrorType } from "./error-types";

/**
 * Mapa error tipova na user-friendly poruke na srpskom
 */
export const errorMessages: Record<ErrorType, string> = {
	[ErrorType.DATABASE_ERROR]:
		"Došlo je do problema sa bazom podataka. Pokušajte ponovo za par trenutaka.",

	[ErrorType.AUTH_ERROR]:
		"Nemate dozvolu za ovu akciju. Prijavite se ponovo ili kontaktirajte administratora.",

	[ErrorType.VALIDATION_ERROR]:
		"Proverite unete podatke i pokušajte ponovo. Sva polja moraju biti ispravno popunjena.",

	[ErrorType.EXTERNAL_API_ERROR]:
		"Spoljni servis trenutno nije dostupan. Pokušajte kasnije ili kontaktirajte podršku.",

	[ErrorType.STORAGE_ERROR]:
		"Došlo je do problema sa skladištenjem podataka. Pokušajte ponovo ili kontaktirajte podršku.",

	[ErrorType.UNKNOWN_ERROR]:
		"Došlo je do neočekivane greške. Molimo vas da osvežite stranicu i pokušate ponovo.",
};

/**
 * Fallback poruka za slučaj da tip nije prepoznat
 */
const FALLBACK_MESSAGE =
	"Došlo je do neočekivane greške. Molimo vas da osvežite stranicu i pokušate ponovo.";

/**
 * Vraća user-friendly poruku za dati ErrorType
 * @param errorType - Tip greške
 * @returns Srpska poruka razumljiva korisnicima
 */
export function getUserFriendlyMessage(errorType: ErrorType): string {
	return errorMessages[errorType] ?? FALLBACK_MESSAGE;
}

/**
 * Vraća sve dostupne error tipove (korisno za testiranje)
 */
export function getAllErrorTypes(): ErrorType[] {
	return Object.values(ErrorType);
}
