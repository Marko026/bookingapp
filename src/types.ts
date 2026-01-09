export interface Apartment {
	id: string;
	name: string;
	nameEn?: string | null;
	slug: string;
	description: string;
	descriptionEn?: string | null;
	price: number;
	rating: number;
	reviewsCount: number;
	maxGuests: number;
	beds: number;
	images: string[];
	amenities: string[];
	latitude?: number;
	longitude?: number;
}

export interface Booking {
	id: number;
	apartmentId: number;
	guestName: string;
	guestEmail: string;
	phone?: string;
	checkIn: string; // ISO Date string
	checkOut: string; // ISO Date string
	totalPrice: number;
	guests?: number;
	status: "pending" | "confirmed" | "cancelled";
	createdAt: Date | null;
}

export interface Attraction {
	id: string;
	title: string;
	titleEn?: string | null;
	description: string | null;
	descriptionEn?: string | null;
	longDescription: string | null;
	longDescriptionEn?: string | null;
	distance: string | null;
	image: string | null;
	gallery: string[];
	coords: string | null;
	slug: string;
}

export interface ChatMessage {
	id: string;
	role: "user" | "model";
	text: string;
	timestamp: number;
}
