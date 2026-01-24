import { MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { 
    getAttractionBySlug, 
    getApartmentOrigin, 
    getAllAttractions 
} from "@/features/attractions/actions";
import { Link, routing } from "@/i18n/routing";
import type { Attraction } from "@/types";
import AttractionDetailClient from "./AttractionDetailClient";

interface AttractionDetailPageProps {
    params: Promise<{ id: string; locale: string }>;
}

export async function generateStaticParams() {
    const attractions = await getAllAttractions();
    
    // Create params for every combination of locale and attraction
    const paths = [];
    for (const locale of routing.locales) {
        for (const attr of attractions) {
            paths.push({
                locale,
                id: attr.slug,
            });
        }
    }
    
    return paths;
}

export async function generateMetadata({ params }: AttractionDetailPageProps) {
    const { id: slug } = await params;
    const attractionData = await getAttractionBySlug(slug);
    const attraction = attractionData as unknown as Attraction;

    if (!attraction) return { title: "Not Found" };

    return {
        title: attraction.title,
        description: attraction.description,
    };
}

export default async function AttractionDetailPage({ params }: AttractionDetailPageProps) {
	const { id: slug } = await params;
    const t = await getTranslations("AttractionDetail");

    const [attractionData, originData] = await Promise.all([
        getAttractionBySlug(slug),
        getApartmentOrigin()
    ]);

    const attraction = attractionData as unknown as Attraction;

	if (!attraction) {
		return (
			<div className="flex items-center justify-center pt-32 pb-20 min-h-[60vh] bg-white">
				<div className="max-w-md w-full px-6 text-center">
					<div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse text-amber-600">
						<MapPin size={32} />
					</div>
					<h1 className="text-3xl font-serif font-medium text-gray-900 mb-4">
						{t("notFound.title")}
					</h1>
					<p className="text-gray-500 mb-8 leading-relaxed">
						{t("notFound.description")}
					</p>
					<div className="grid grid-cols-1 gap-3">
						<Link href="/#location" className="block">
							<Button className="w-full bg-amber-600 text-white hover:bg-amber-700 py-6 rounded-xl transition-all">
								{t("notFound.seeAll")}
							</Button>
						</Link>
						<Link href="/" className="block">
							<Button
								variant="ghost"
								className="w-full text-gray-500 hover:text-amber-600"
							>
								{t("notFound.backHome")}
							</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
        <AttractionDetailClient 
            attraction={attraction} 
            origin={originData} 
        />
    );
}
