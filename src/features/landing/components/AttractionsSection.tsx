import { getAllAttractions } from "@/dal/attractions";
import { Location } from "./Location";

export async function AttractionsSection() {
	const attractions = await getAllAttractions();

	return <Location attractions={attractions} />;
}
