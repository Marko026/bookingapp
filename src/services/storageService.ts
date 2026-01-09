import type { Apartment } from "@/types";

const APARTMENTS_KEY = "todorovic_apartments";

const DEFAULT_APARTMENTS: Apartment[] = [
	{
		id: "1",
		name: "Šumski Mir - Apartman 1",
		slug: "sumski-mir",
		description:
			"Prostran apartman sa pogledom na šumu, idealan za porodice. Uživajte u jutarnjoj kafi na terasi uz cvrkut ptica. Apartman poseduje potpuno opremljenu kuhinju, prostrano kupatilo i udobne krevete.",
		price: 50,
		rating: 4.9,
		reviewsCount: 24,
		maxGuests: 4,
		beds: 2,
		images: [
			"https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=1600", // Modern Cabin Interior
			"https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1600", // Forest View
			"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600", // Modern Living Room
			"https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1600", // Bedroom
			"https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1600", // Bathroom
		],
		amenities: ["WiFi", "Parking", "Klima", "Terasa", "Kuhinja", "TV"],
	},
	{
		id: "2",
		name: "Rečni Pogled - Apartman 2",
		slug: "recni-pogled",
		description:
			"Moderan apartman sa pogledom na Dunav. Savršeno mesto za romantični vikend ili opuštajući odmor pored vode. Enterijer je dizajniran po najvišim standardima.",
		price: 45,
		rating: 4.8,
		reviewsCount: 18,
		maxGuests: 2,
		beds: 1,
		images: [
			"https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1600", // River House
			"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1600", // Modern interior
			"https://images.unsplash.com/photo-1522771753037-633361652bff?auto=format&fit=crop&q=80&w=1600", // Balcony
			"https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=1600", // Kitchen
		],
		amenities: ["WiFi", "Parking", "Klima", "Balkon", "Mini Bar", "TV"],
	},
];

export const getApartments = (): Apartment[] => {
	if (typeof window === "undefined") return DEFAULT_APARTMENTS;

	const stored = localStorage.getItem(APARTMENTS_KEY);
	if (!stored) {
		localStorage.setItem(APARTMENTS_KEY, JSON.stringify(DEFAULT_APARTMENTS));
		return DEFAULT_APARTMENTS;
	}
	return JSON.parse(stored);
};

export const saveApartment = (updatedApartment: Apartment): void => {
	if (typeof window === "undefined") return;

	const apartments = getApartments();
	const index = apartments.findIndex((a) => a.id === updatedApartment.id);
	if (index !== -1) {
		apartments[index] = updatedApartment;
		localStorage.setItem(APARTMENTS_KEY, JSON.stringify(apartments));
	}
};
