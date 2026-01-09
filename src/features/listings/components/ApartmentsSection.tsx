import { getAllApartmentsPublic } from "@/dal/apartments";
import { ApartmentList } from "./ApartmentList";

export async function ApartmentsSection() {
	const apartments = await getAllApartmentsPublic();

	return <ApartmentList apartments={apartments} />;
}
