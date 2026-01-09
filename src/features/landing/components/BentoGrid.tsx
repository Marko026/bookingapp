"use client";

import { motion } from "framer-motion";
import {
	ArrowUpRight,
	CheckCircle2,
	House,
	MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import { CircularText } from "@/components/ui/CircularText";

export function BentoGrid() {
	return (
		<div className="relative w-full h-full min-h-[600px] lg:h-[600px] grid grid-cols-12 gap-4">
			{/* Main Tall Image */}
			<motion.div
				className="col-span-12 lg:col-span-5 row-span-6 relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl min-h-[400px] lg:min-h-0"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<Image
					src="/main-img.png"
					alt="Swiss Alps"
					fill
					className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
				<div className="absolute bottom-6 left-6 text-white z-10">
					<p className="text-xs font-medium uppercase tracking-wider text-amber-400 mb-1">
						Adventure
					</p>
					<h3 className="text-xl font-medium tracking-tight font-serif">
						Swiss Alps
					</h3>
				</div>
			</motion.div>

			{/* Right Side Grid */}
			<div className="col-span-12 lg:col-span-7 grid grid-cols-12 grid-rows-6 gap-4 h-full relative">
				{/* Top Right Wide Image */}
				<motion.div
					className="col-span-12 row-span-3 h-[250px] lg:h-full rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-2xl"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, delay: 0.4 }}
				>
					<Image
						src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop"
						alt="Lake Switzerland"
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
					/>
					<div className="absolute top-4 right-4 backdrop-blur-md border px-3 py-1.5 rounded-full flex items-center gap-2 bg-white/10 border-white/10 shadow-lg">
						<span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse relative">
							<span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
						</span>
						<span className="text-xs font-medium text-white">Popular</span>
					</div>
				</motion.div>

				{/* Bottom Right Image */}
				<motion.div
					className="col-span-12 row-span-3 h-full rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-2xl"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.6 }}
				>
					<Image
						src="/main-img1.png"
						alt="Kyoto Streets"
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
					/>
				</motion.div>

				{/* Interactive Circular Element */}
				<motion.div
					className="hidden lg:flex absolute -bottom-6 -right-6 z-20 items-center justify-center"
					initial={{ opacity: 0, scale: 0 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, delay: 1.0 }}
				>
					<div className="relative w-[160px] h-[160px] flex items-center justify-center">
						<CircularText
							text="• DISCOVER MORE • DISCOVER MORE "
							radius={70}
							fontSize="10px"
							letterSpacing="0.1em"
							color="#fbbf24" /* amber-400 */
							duration={15}
							className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
						/>
						<button className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-400/20 z-10">
							<ArrowUpRight className="w-6 h-6 text-black" strokeWidth={2} />
						</button>
					</div>
				</motion.div>

				{/* Floating UI Card (Trip Summary) */}
				<motion.div
					className="hidden lg:block absolute top-[40%] right-[-20px] w-64 bg-[#0F0F0F]/90 backdrop-blur-2xl border border-white/5 p-5 rounded-3xl shadow-2xl z-30 transform hover:-translate-y-2 transition-transform duration-300"
					initial={{ opacity: 0, x: 50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, delay: 0.8 }}
				>
					{/* Header */}
					<div className="flex items-center justify-between mb-4">
						<span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
							Trip Summary
						</span>
						<MoreHorizontal className="text-zinc-600 w-4 h-4" />
					</div>

					{/* Destination */}
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
							<House className="w-5 h-5 fill-current" />
						</div>
						<div>
							<p className="text-sm font-medium text-white">Kyoto, Japan</p>
							<p className="text-xs text-zinc-500">Oct 24 - Nov 02</p>
						</div>
					</div>

					{/* Price */}
					<div className="flex items-center justify-between p-3 rounded-xl border bg-white/[0.02] border-white/5 mb-4">
						<span className="text-xs text-zinc-500">Total Price</span>
						<span className="text-sm font-bold text-white">$3,420.00</span>
					</div>

					{/* Badge */}
					<div className="flex items-center gap-2 text-xs font-medium w-max px-2.5 py-1.5 rounded-full text-amber-400 bg-amber-500/10 border border-amber-500/20">
						<CheckCircle2 className="w-3.5 h-3.5" />
						Confirmed
					</div>
				</motion.div>
			</div>
		</div>
	);
}
