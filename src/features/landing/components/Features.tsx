"use client";

import { motion } from "framer-motion";
import { Car, Trees, Wifi } from "lucide-react";
import { useTranslations } from "next-intl";

export function Features() {
	const t = useTranslations("Features");

	return (
		<div className="relative bg-[#FFFDF9] px-4 md:px-6 mt-4 md:-mt-12 z-10 max-w-7xl mx-auto pointer-events-none">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.7, delay: 0.2 }}
				className="pointer-events-auto bg-[#FFFDF9] p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4"
			>
				<div className="flex items-center gap-3 md:gap-4 text-gray-800 w-full md:w-auto">
					<div className="p-1.5 md:p-3 bg-gray-100 rounded-full shrink-0">
						<Wifi size={16} className="md:w-6 md:h-6" />
					</div>
					<div>
						<h3 className="font-bold text-[10px] md:text-sm uppercase">
							{t("wifi")}
						</h3>
						<p className="text-[9px] md:text-xs text-gray-500">
							{t("wifiDesc")}
						</p>
					</div>
				</div>
				<div className="w-full h-px md:w-px md:h-12 bg-gray-100 block"></div>
				<div className="flex items-center gap-3 md:gap-4 text-gray-800 w-full md:w-auto">
					<div className="p-1.5 md:p-3 bg-gray-100 rounded-full shrink-0">
						<Car size={16} className="md:w-6 md:h-6" />
					</div>
					<div>
						<h3 className="font-bold text-[10px] md:text-sm uppercase">
							{t("parking")}
						</h3>
						<p className="text-[9px] md:text-xs text-gray-500">
							{t("parkingDesc")}
						</p>
					</div>
				</div>
				<div className="w-full h-px md:w-px md:h-12 bg-gray-100 block"></div>
				<div className="flex items-center gap-3 md:gap-4 text-gray-800 w-full md:w-auto">
					<div className="p-1.5 md:p-3 bg-gray-100 rounded-full shrink-0">
						<Trees size={16} className="md:w-6 md:h-6" />
					</div>
					<div>
						<h3 className="font-bold text-[10px] md:text-sm uppercase">
							{t("nature")}
						</h3>
						<p className="text-[9px] md:text-xs text-gray-500">
							{t("natureDesc")}
						</p>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
