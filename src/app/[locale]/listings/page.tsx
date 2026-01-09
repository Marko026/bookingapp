import { getAllApartmentsPublic } from "@/dal/apartments";
import { ApartmentList } from "@/features/listings/components/ApartmentList";

export const revalidate = 0; // Dynamic

export default async function ListingsPage() {
	const apartments = await getAllApartmentsPublic();

	return (
		<div className="min-h-screen pt-24 bg-[#FFFDF9]">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-12 text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
						All Listings
					</h1>
					<p className="text-zinc-500 max-w-2xl mx-auto">
						Explore our complete collection of eco-certified luxury apartments
						interspersed throughout the forest sanctuary.
					</p>
				</div>
				<ApartmentList apartments={apartments} />
			</div>
		</div>
	);
}
