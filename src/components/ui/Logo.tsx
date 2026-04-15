import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
	className?: string;
	variant?: "dark" | "light";
	noBackground?: boolean;
}

export function Logo({
	className,
	variant = "dark",
	noBackground = false,
}: LogoProps) {
	const [isMounted, setIsMounted] = useState(false);
	const textColor = variant === "dark" ? "text-gray-900" : "text-white";
	const subTextColor = variant === "dark" ? "text-gray-600" : "text-gray-300";

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const showBackground = isMounted && !noBackground;

	return (
		<div className={cn("flex items-center ", className)}>
			{showBackground && (
				<div className="relative flex items-center justify-center bg-white p-0.5 rounded-xl overflow-hidden">
					<Image
						src="/logo.png"
						alt="Apartmani Todorović Logo"
						width={500}
						height={150}
						className="h-14 w-auto object-contain"
						priority
					/>
				</div>
			)}
			{!showBackground && (
				<Image
					src="/logo.png"
					alt="Apartmani Todorović Logo"
					width={500}
					height={150}
					className="h-14 w-auto object-contain"
					priority
				/>
			)}
			<div className="flex flex-col items-start leading-[1.1] justify-center border-l border-gray-200/50 pl-3 md:pl-2">
				<span
					className={cn(
						"text-[9px] md:text-[11px] uppercase tracking-[0.25em] font-semibold opacity-90",
						subTextColor,
					)}
				>
					Apartmani
				</span>
				<span
					className={cn(
						"text-lg sm:text-xl md:text-2xl font-serif font-bold tracking-tight",
						textColor,
					)}
				>
					Todorović
				</span>
			</div>
		</div>
	);
}
