"use client";

import { motion } from "framer-motion";

interface CircularTextProps {
	text: string;
	radius?: number;
	fontSize?: string;
	letterSpacing?: string;
	color?: string;
	duration?: number;
	className?: string;
}

export function CircularText({
	text,
	radius = 60,
	fontSize = "12px",
	letterSpacing = "0.2em",
	color = "currentColor",
	duration = 20,
	className = "",
}: CircularTextProps) {
	const characters = text.split("");
	const degreeStep = 360 / characters.length;

	return (
		<div
			className={`relative flex items-center justify-center ${className}`}
			style={{ width: radius * 2, height: radius * 2 }}
		>
			<motion.div
				className="absolute w-full h-full"
				animate={{ rotate: 360 }}
				transition={{
					duration: duration,
					repeat: Infinity,
					ease: "linear",
				}}
			>
				{characters.map((char, i) => (
					<span
						key={i}
						className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom"
						style={{
							height: radius,
							fontSize: fontSize,
							letterSpacing: letterSpacing,
							color: color,
							transform: `translateX(-50%) rotate(${i * degreeStep}deg)`,
							fontWeight: 500,
							textTransform: "uppercase",
						}}
					>
						{char}
					</span>
				))}
			</motion.div>
		</div>
	);
}
