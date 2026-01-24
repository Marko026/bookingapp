"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BedDouble, Star, Users, Wifi } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/localization";
import { cn, stripHtml } from "@/lib/utils";
import type { Apartment } from "@/types";

interface ApartmentListProps {
	apartments: Apartment[];
}

export function ApartmentList({ apartments }: ApartmentListProps) {
	const t = useTranslations("Apartments");
	const locale = useLocale();

	return (
		<section
			id="apartments"
			className="pt-20 pb-12 md:py-24 px-4 md:px-6 bg-stone-50/50"
		>
			<div className="max-w-7xl mx-auto">
				{/* Header Section */}
				<div className="mb-10 md:mb-20 text-center md:text-left">
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
						className="text-3xl md:text-5xl lg:text-7xl font-serif font-medium text-gray-900 mb-4 md:mb-6"
					>
						{t("title")}
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-gray-500 text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed md:mx-0"
					>
						{t("subtitle")}
					</motion.p>
				</div>

				<div className="flex flex-col gap-12 md:gap-24 lg:gap-32">
					{apartments.map((apt, index) => (
						<Link
							href={`/apartment/${apt.id}` as any}
							key={apt.id}
							className="group block"
						>
							<motion.div
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-100px" }}
								transition={{ duration: 0.6 }}
								className={cn(
									"flex flex-col gap-6 md:gap-12 lg:gap-20 items-center",
									index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row",
								)}
							>
								{/* Image Side */}
								<div className="w-full md:w-1/2 relative group-hover:cursor-pointer">
									<div className="aspect-[4/3] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative">
										<div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
										<Image
											src={apt.images[0]}
											alt={getLocalizedField(apt, "name", locale)}
											fill
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 48vw, 40vw"
											className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
										/>

										{/* Rating Pill */}
										<div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-1.5 shadow-sm">
											<Star
												size={14}
												className="fill-amber-500 text-amber-500"
											/>
											<span className="text-xs md:text-sm font-bold text-gray-900">
												{apt.rating}
											</span>
											<span className="text-[10px] md:text-xs text-gray-500 font-medium ml-1">
												(42 {t("reviews")})
											</span>
										</div>
									</div>
								</div>

								{/* Text Side */}
								<div className="w-full md:w-1/2 px-1 md:px-2 lg:px-4 flex flex-col justify-center">
									{/* Icons Row */}
									<div className="flex items-center gap-3 md:gap-4 lg:gap-6 mb-3 md:mb-4 lg:mb-6 text-gray-500">
										<div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium">
											<Users
												size={14}
												className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]"
											/>
											<span className="text-[11px] md:text-xs lg:text-sm">
												2 {t("guests")}
											</span>
										</div>
										<div className="h-3 w-px bg-gray-300" />
										<div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium">
											<BedDouble
												size={14}
												className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]"
											/>
											<span className="text-[11px] md:text-xs lg:text-sm">
												{t("bed")}
											</span>
										</div>
										<div className="h-3 w-px bg-gray-300" />
										<div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium">
											<Wifi
												size={14}
												className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]"
											/>
											<span className="text-[11px] md:text-xs lg:text-sm">
												{t("wifi")}
											</span>
										</div>
									</div>

									<h3 className="text-2xl md:text-3xl lg:text-5xl font-serif font-medium mb-3 md:mb-4 lg:mb-6 text-gray-900 group-hover:text-amber-700 transition-colors">
										{getLocalizedField(apt, "name", locale)}
									</h3>

									<p className="text-gray-500 text-base md:text-lg leading-relaxed mb-4 md:mb-6 lg:mb-8 line-clamp-3">
										{stripHtml(getLocalizedField(apt, "description", locale))}
									</p>

									<div className="flex items-center justify-between border-t border-gray-200 pt-4 md:pt-6 lg:pt-8 mt-2">
										<div>
											<span className="block text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">
												{t("startingFrom")}
											</span>
											<span className="text-xl md:text-2xl lg:text-3xl font-serif font-medium text-gray-900">
												{apt.price}€
											</span>
										</div>

										<div className="flex items-center gap-2 md:gap-3">
											<span className="hidden lg:block text-sm font-bold text-black opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
												{t("viewDetails")}
											</span>
											<div className="w-11 h-11 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-600 transition-all duration-300 shadow-lg">
												<ArrowUpRight
													size={18}
													className="md:w-[24px] md:h-[24px] lg:w-[28px] lg:h-[28px]"
												/>
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
