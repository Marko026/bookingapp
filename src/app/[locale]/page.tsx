import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { AttractionsSection } from "@/features/landing/components/AttractionsSection";
import { Features } from "@/features/landing/components/Features";
import { Hero } from "@/features/landing/components/Hero";
import { ApartmentsSection } from "@/features/listings/components/ApartmentsSection";

export const revalidate = 0; // Ensure fresh data on every request

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Metadata" });

	return {
		title: t("title"),
		description: t("description"),
		alternates: {
			languages: {
				en: "/en",
				de: "/de",
				sr: "/sr",
			},
		},
		openGraph: {
			title: t("title"),
			description: t("description"),
			type: "website",
			locale: locale,
		},
	};
}

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<div className="flex flex-col min-h-screen">
			<Hero />
			<Features />

			<Suspense
				fallback={
					<div className="py-24 flex justify-center">
						<div className="animate-pulse h-12 w-12 bg-amber-100 rounded-full" />
					</div>
				}
			>
				<ApartmentsSection />
			</Suspense>

			<Suspense
				fallback={
					<div className="py-24 flex justify-center">
						<div className="animate-pulse h-12 w-12 bg-gray-100 rounded-full" />
					</div>
				}
			>
				<AttractionsSection />
			</Suspense>
		</div>
	);
}
