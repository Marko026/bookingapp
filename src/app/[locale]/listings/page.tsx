import { getTranslations } from "next-intl/server";
import { getAllApartmentsPublic } from "@/dal/apartments";
import { ApartmentList } from "@/features/listings/components/ApartmentList";

export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function ListingsPage() {
	const apartments = await getAllApartmentsPublic();
	const t = await getTranslations("Listings");

	return (
		<div className="min-h-screen pt-24 bg-white">
			<div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-4">
				<div className="mb-12 text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
						{t("title")}
					</h1>
					<p className="text-zinc-500 max-w-2xl mx-auto">{t("subtitle")}</p>
				</div>
			</div>
			<ApartmentList apartments={apartments} />
		</div>
	);
}
