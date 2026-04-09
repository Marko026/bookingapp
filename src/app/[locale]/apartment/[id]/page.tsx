import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getAllApartmentsPublic, getApartment } from "@/dal/apartments";
import { routing } from "@/i18n/routing";
import type { Apartment } from "@/types";
import ApartmentDetailClient from "./ApartmentDetailClient";

interface ApartmentDetailPageProps {
	params: Promise<{ id: string; locale: string }>;
}

export async function generateStaticParams() {
	const apartments = await getAllApartmentsPublic();

	// Create params for every combination of locale and apartment
	const paths = [];
	for (const locale of routing.locales) {
		for (const apt of apartments) {
			paths.push({
				locale,
				id: apt.id,
			});
		}
	}

	return paths;
}

export async function generateMetadata({ params }: ApartmentDetailPageProps) {
	const { id, locale } = await params;
	const apartmentId = Number.parseInt(id, 10);

	if (Number.isNaN(apartmentId)) return { title: "Apartman" };

	const result = await getApartment(apartmentId);

	if (!result.success || !result.apartment) {
		return { title: "Apartman Todorović" };
	}

	const apt = result.apartment;
	const title = locale === "en" ? apt.nameEn || apt.name : apt.name;
	const description =
		locale === "en" ? apt.descriptionEn || apt.description : apt.description;

	return {
		title: `${title} | Apartmani Todorović`,
		description: description?.substring(0, 160),
		openGraph: {
			images: apt.images?.[0] ? [apt.images[0]] : [],
		},
	};
}

export default async function ApartmentDetailPage({
	params,
}: ApartmentDetailPageProps) {
	const { id, locale } = await params;

	// Enable static rendering
	setRequestLocale(locale);

	const apartmentId = Number.parseInt(id, 10);

	if (Number.isNaN(apartmentId)) {
		notFound();
	}

	const result = await getApartment(apartmentId);

	if (!result.success || !result.apartment) {
		notFound();
	}

	return (
		<ApartmentDetailClient
			apartment={result.apartment as unknown as Apartment}
		/>
	);
}
