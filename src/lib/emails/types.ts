export interface BookingData {
	guestName: string;
	guestEmail: string;
	phone?: string;
	checkIn: string;
	checkOut: string;
	totalPrice: number;
	question?: string;
	apartmentId: number;
	apartmentName: string;
	apartmentImage: string;
}
