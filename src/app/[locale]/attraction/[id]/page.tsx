"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ExternalLink, MapPin } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAttractionBySlug } from "@/features/attractions/actions";
import { Link } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/localization";
import type { Attraction } from "@/types";

export default function AttractionDetailPage() {
	const t = useTranslations("AttractionDetail");
	const params = useParams();
	const _router = useRouter();
	const locale = useLocale();
	const slug = params?.id as string;
	const [attraction, setAttraction] = useState<Attraction | null>(null);

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (slug) {
			const fetchAttraction = async () => {
				setIsLoading(true);
				try {
					const data = await getAttractionBySlug(slug);
					setAttraction(data as unknown as Attraction);
				} catch (error) {
					console.error("Failed to fetch attraction:", error);
				} finally {
					setIsLoading(false);
				}
			};
			fetchAttraction();
		}
	}, [slug]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center pt-24 min-h-[60vh]">
				<div className="text-center animate-pulse">
					<div className="h-12 w-12 bg-amber-600 rounded-full mx-auto mb-4"></div>
					<h1 className="text-2xl font-serif text-gray-400">{t("loading")}</h1>
				</div>
			</div>
		);
	}

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

	const directionsUrl = attraction.coords
		? `https://www.google.com/maps/dir/?api=1&origin=Vinci,Golubac&destination=${encodeURIComponent(attraction.coords)}`
		: "#";

	return (
		<div className="pt-20  md:pt-28 pb-12 md:pb-20 bg-white">
			<div className="max-w-7xl mx-auto px-4 md:px-6">
				{/* Navigation & Breadcrumbs */}
				<div className="mb-6 md:mb-8 flex items-center gap-2">
					<Link href="/#location">
						<Button
							variant="ghost"
							className="pl-0 hover:bg-transparent hover:text-amber-600 transition-colors group"
						>
							<ArrowLeft
								size={20}
								className="mr-2 group-hover:-translate-x-1 transition-transform"
							/>
							<span className="text-gray-500 group-hover:text-amber-600">
								{t("back")}
							</span>
						</Button>
					</Link>
				</div>

				{/* Hero Image Section - Refined for "Contained" look */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="relative w-full max-w-7xl mx-auto aspect-[16/7] max-h-[600px] min-h-[400px] rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-12 md:mb-16 group shadow-2xl ring-1 ring-black/5"
				>
					<Image
						src={attraction.image || "/images/placeholder.jpg"}
						alt={attraction.title}
						fill
						priority
						quality={100}
						sizes="(max-width: 1280px) 100vw, 1280px"
						className="object-cover transition-transform duration-700 group-hover:scale-105"
					/>
					{/* Gradient Overlay for Depth - Softened */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-100" />

					{/* Hero Badge - Refined Style */}
					<div className="absolute top-6 left-6 md:top-8 md:left-8 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full flex items-center gap-2.5 border border-white/20 shadow-xl">
						<div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
						<span className="text-xs md:text-sm font-semibold text-white tracking-wide">
							{attraction.distance}
						</span>
					</div>

					{/* Subtle Bottom Content Overlay */}
					<div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
						<div className="hidden md:block">
							<p className="text-white/60 text-xs uppercase tracking-[0.2em] font-medium mb-1">
								{t("destination")}
							</p>
							<h2 className="text-white text-2xl font-serif drop-shadow-md">
								{getLocalizedField(attraction, "title", locale)}
							</h2>
						</div>
					</div>
				</motion.div>

				{/* Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
					{/* Main Content - Left Side */}
					<div className="lg:col-span-8">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							<h1 className="text-3xl md:text-7xl font-serif font-medium text-gray-900 mb-4 md:mb-6 leading-[1.1]">
								{getLocalizedField(attraction, "title", locale)}
							</h1>
							<p className="text-lg md:text-xl text-amber-600 font-medium mb-6 md:mb-8">
								{getLocalizedField(attraction, "description", locale)}
							</p>
							<div
								className="prose prose-stone prose-lg max-w-none text-gray-500 leading-7 md:leading-8 font-light mb-8 md:mb-12"
								dangerouslySetInnerHTML={{
									__html: getLocalizedField(
										attraction,
										"longDescription",
										locale,
									),
								}}
							/>

							{/* Gallery */}
							<div>
								<h2 className="text-2xl md:text-3xl font-serif font-medium mb-6 md:mb-8 text-gray-900">
									{t("gallery")}
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
									{attraction.gallery.map((img, index) => (
										<div
											key={img}
											className="relative h-56 md:h-64 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group cursor-pointer"
										>
											<Image
												src={img}
												alt={`${attraction.title} ${index + 1}`}
												fill
												sizes="(max-width: 768px) 100vw, 33vw"
												className="object-cover transition-transform duration-700 group-hover:scale-110"
											/>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					</div>

					{/* Sidebar - Right Side */}
					<div className="lg:col-span-4">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							// Updated Container: White, Floating Shadow, Border
							className="sticky top-32 bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-6 md:space-y-8"
						>
							<h3 className="text-xl md:text-2xl font-serif font-medium text-gray-900">
								{t("visitorInfo")}
							</h3>

							{/* Info Items */}
							<div className="space-y-5 md:space-y-6">
								<div className="flex items-start gap-4">
									<div className="p-2.5 md:p-3 bg-amber-50 text-amber-600 rounded-full shrink-0">
										<MapPin size={20} className="md:w-[24px] md:h-[24px]" />
									</div>
									<div>
										<span className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
											{t("location")}
										</span>
										<p className="text-base md:text-lg font-medium text-gray-900">
											{attraction.distance}
										</p>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="space-y-3 pt-4">
								<a
									href={directionsUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="block w-full"
								>
									<Button className="w-full !py-6 md:!py-7 text-base md:text-lg bg-amber-600 text-white hover:bg-amber-700 shadow-xl shadow-amber-600/20 rounded-xl md:rounded-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
										{t("getDirections")} <ExternalLink size={18} />
									</Button>
								</a>

								<Link href="/#apartments" className="block">
									<Button
										variant="outline"
										className="w-full !py-6 md:!py-7 text-base md:text-lg border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300 rounded-xl md:rounded-2xl flex items-center justify-center gap-2"
									>
										{t("bookNow")} <ArrowUpRight size={18} />
									</Button>
								</Link>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
