export interface BookingData {
	guestName: string;
	guestEmail: string;
	phone?: string;
	checkIn: string;
	checkOut: string;
	totalPrice: number;
	question?: string;
	apartmentId: string;
	apartmentName: string;
	apartmentImage: string;
}
