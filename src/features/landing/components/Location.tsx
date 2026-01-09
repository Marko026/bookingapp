"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/localization";
import { stripHtml } from "@/lib/utils";
import type { Attraction } from "@/types";

export function Location({ attractions = [] }: { attractions?: Attraction[] }) {
	const t = useTranslations("Attractions");
	const locale = useLocale();

	return (
		<section
			id="attractions"
			className="py-12 md:py-24 bg-white rounded-t-[2rem] md:rounded-t-[3rem] -mt-8 md:-mt-12 relative z-10 px-4 md:px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
		>
			<div className="max-w-7xl mx-auto">
				{/* Header Section */}
				<div className="mb-10 md:mb-16 text-center md:text-left">
					<motion.p
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-amber-600 uppercase mb-2 md:mb-3"
					>
						{t("badge")}
					</motion.p>
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						className="text-3xl md:text-6xl font-serif font-medium text-gray-900 mb-4 md:mb-6"
					>
						{t("title")}
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-gray-500 text-lg md:text-xl max-w-2xl leading-relaxed mb-6 md:mb-8 md:mx-0 mx-auto"
					>
						{t("subtitle")}
					</motion.p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
					{attractions.map((attraction, index) => (
						<AttractionCard
							key={attraction.id}
							id={attraction.id}
							slug={attraction.slug}
							image={attraction.image || "/images/placeholder.jpg"}
							title={getLocalizedField(attraction, "title", locale)}
							description={getLocalizedField(attraction, "description", locale)}
							distance={attraction.distance || ""}
							coords={attraction.coords || ""}
							index={index}
						/>
					))}
				</div>
			</div>
		</section>
	);
}

function AttractionCard({
	id,
	slug,
	image,
	title,
	description,
	distance,
	coords,
	index,
}: {
	id: string;
	slug: string;
	image: string;
	title: string;
	description: string;
	distance: string;
	coords: string;
	index: number;
}) {
	const t = useTranslations("Attractions");
	const _directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=Vinci,Golubac&destination=${encodeURIComponent(coords || "")}`;

	return (
		<div className="flex flex-col h-full">
			<Link href={`/attraction/${slug}` as any} className="flex-grow">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: index * 0.1 }}
					className="group bg-gray-50 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer h-full flex flex-col"
				>
					<div className="h-48 md:h-56 lg:h-72 overflow-hidden relative">
						<Image
							src={image}
							alt={title}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							className="object-cover transition-transform duration-700 group-hover:scale-110"
						/>

						<div className="absolute top-4 right-4 md:top-5 md:right-5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1.5 shadow-sm text-gray-900">
							<MapPin size={14} className="text-amber-500 fill-amber-500" />
							{distance}
						</div>
					</div>

					<div className="p-5 md:p-6 lg:p-8 flex flex-col flex-grow">
						<h3 className="text-lg md:text-xl lg:text-2xl font-medium font-serif mb-2 md:mb-3 lg:mb-4 text-gray-900 group-hover:text-amber-700 transition-colors">
							{title}
						</h3>
						<p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6 lg:mb-8 leading-relaxed line-clamp-3 flex-grow">
							{stripHtml(description)}
						</p>

						<div className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors mt-auto">
							<span>{t("readMore")}</span>
							<ArrowUpRight
								size={16}
								className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 md:w-[18px] md:h-[18px]"
							/>
						</div>
					</div>
				</motion.div>
			</Link>
		</div>
	);
}
