import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { AttractionsSection } from "@/features/landing/components/AttractionsSection";

export const revalidate = 3600;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Metadata" });
	const ta = await getTranslations({ locale, namespace: "Attractions" });

	return {
		title: `${ta("title")} | ${t("title")}`,
		description: ta("subtitle"),
	};
}

export default async function AttractionsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<div className="min-h-screen pt-24 bg-white">
			<div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-4">
				<div className="mb-12 text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
						{locale === "sr" ? "Атракције" : "Attractions"}
					</h1>
					<p className="text-zinc-500 max-w-2xl mx-auto">
						{locale === "sr"
							? "Откријте најлепша места у околини"
							: "Discover the most beautiful places nearby"}
					</p>
				</div>
			</div>
			<Suspense
				fallback={
					<div className="py-24 flex justify-center">
						<div className="animate-pulse h-12 w-12 bg-amber-100 rounded-full" />
					</div>
				}
			>
				<AttractionsSection />
			</Suspense>
		</div>
	);
}
