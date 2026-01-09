export interface Booking {
	apartmentId: number;
	guestName: string;
	guestEmail: string;
	phone?: string;
	checkIn: string;
	checkOut: string;
	totalPrice: number;
	question?: string;
}
