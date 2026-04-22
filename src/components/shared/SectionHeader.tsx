"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
	badge: string;
	title: string;
	subtitle?: string;
	centered?: boolean;
	titleClassName?: string;
	subtitleClassName?: string;
	className?: string;
}

export function SectionHeader({
	badge,
	title,
	subtitle,
	centered = true,
	titleClassName = "text-3xl md:text-6xl font-serif font-medium text-gray-900 mb-4 md:mb-6",
	subtitleClassName = "text-gray-500 text-lg md:text-xl max-w-2xl leading-relaxed",
	className = "mb-10 md:mb-16",
}: SectionHeaderProps) {
	return (
		<div
			className={cn(
				className,
				centered ? "text-center md:text-left" : "md:text-left",
			)}
		>
			<motion.p
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-amber-600 uppercase mb-2 md:mb-3"
			>
				{badge}
			</motion.p>
			<motion.h2
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				className={titleClassName}
			>
				{title}
			</motion.h2>
			{subtitle && (
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className={subtitleClassName}
				>
					{subtitle}
				</motion.p>
			)}
		</div>
	);
}
