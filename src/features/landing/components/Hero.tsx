"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, House, Map, Star } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Hero() {
	const t = useTranslations("Hero");
	const ts = useTranslations("Stats");

	return (
		<section
			id="hero"
			className="relative w-full min-h-screen overflow-hidden py-20 lg:py-24"
		>
			{/* Background Effects */}
			<div className="absolute inset-0 bg-[#FFFDF9]" />

			<div className="container mx-auto px-4 md:px-6">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center">
					{/* Left Column: Copy & Value Proposition */}

					<motion.div
						className="md:col-span-6 lg:col-span-5 flex flex-col gap-8 relative z-10"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
					>
						{/* Animated Badge */}

						<div className="inline-flex items-center gap-2 self-start glass-card px-3 py-1.5 rounded-full border border-amber-100 bg-amber-50/50 backdrop-blur-sm">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>

								<span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
							</span>

							<span className="text-xs font-medium text-amber-600 tracking-wide uppercase">
								{t("est")}
							</span>
						</div>

						{/* Headline */}

						<h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-neutral-900">
							{t("title_word_1")} <br />
							<span className="italic text-neutral-400 font-light pe-4">
								{t("title_word_2")}
							</span>
							{t("title_word_3")} <br />
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">
								{t("title_word_4")}
							</span>
						</h1>

						{/* MOBILE ONLY Visual Composition - Optimized LCP */}
						<div className="md:hidden absolute left-[55%] sm:left-[64%] top-[2%] w-[45%] sm:w-[30%] h-40 pointer-events-none overflow-visible z-20">
							{/* 1. Base Image - Priority LCP candidate on mobile */}
							<motion.div
								className="absolute top-0 right-2 w-[18vw] h-[18vw] max-w-[72px] max-h-[72px] sm:max-w-[80px] sm:max-h-[80px] rounded-full overflow-hidden border-[0.5px] border-amber-200 shadow-2xl z-10"
								initial={{ opacity: 0.8, scale: 0.9 }}
								animate={{
									opacity: 1,
									scale: 1,
									y: [0, -5, 0],
									x: [0, 3, 0],
								}}
								transition={{
									opacity: { duration: 0.3 },
									scale: { duration: 0.3 },
									y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
									x: { duration: 5, repeat: Infinity, ease: "easeInOut" },
								}}
							>
								<Image
									src="/main-img.png"
									alt="A1"
									fill
									className="object-cover"
									priority
									sizes="80px"
								/>
							</motion.div>

							{/* 2. Overlapping Leaf */}
							<motion.div
								className="absolute top-[15%] left-0 w-[15vw] h-[20vw] max-w-[64px] max-h-[80px] sm:max-w-[72px] sm:max-h-[90px] rounded-tl-[2.5rem] rounded-br-[2.5rem] overflow-hidden border-2 border-white shadow-2xl rotate-[-12deg] z-30"
								animate={{ y: [0, 8, 0], rotate: [-12, -5, -12] }}
								transition={{
									duration: 6,
									repeat: Infinity,
									ease: "easeInOut",
									delay: 0.2,
								}}
							>
								<Image
									src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=400&auto=format&fit=crop"
									alt="A2"
									fill
									className="object-cover"
									sizes="90px"
								/>
							</motion.div>

							{/* 3. Soft Square */}
							<motion.div
								className="absolute top-[45%] right-[5%] w-[12vw] h-[12vw] max-w-[56px] max-h-[56px] sm:max-w-[64px] sm:max-h-[64px] rounded-2xl overflow-hidden border-[0.5px] border-amber-100 shadow-xl z-20"
								animate={{ x: [0, -5, 0], scale: [1, 1.05, 1] }}
								transition={{
									duration: 7,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							>
								<Image
									src="/main-img1.png"
									alt="A3"
									fill
									className="object-cover"
									sizes="64px"
								/>
							</motion.div>

							{/* 4. Small Detail */}
							<motion.div
								className="absolute top-[65%] left-[20%] sm:left-[30%] w-[10vw] h-[10vw] max-w-[48px] max-h-[48px] sm:max-w-[56px] sm:max-h-[56px] rounded-full overflow-hidden border-2 border-white shadow-lg z-40"
								animate={{ y: [0, -10, 0] }}
								transition={{
									duration: 5,
									repeat: Infinity,
									ease: "easeInOut",
									delay: 0.4,
								}}
							>
								<Image
									src="/main-img.png"
									alt="A4"
									fill
									className="object-cover"
									sizes="56px"
								/>
							</motion.div>
						</div>

						{/* Description */}
						<p className="text-lg lg:text-xl font-light leading-relaxed max-w-lg text-neutral-500">
							{t("subtitle")}
						</p>

						{/* Buttons */}
						<div className="flex flex-col sm:flex-row gap-4 mt-2">
							<Link
								href="/#apartments"
								scroll={false}
								className="group relative overflow-hidden hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex text-base font-medium text-white bg-zinc-900 h-14 rounded-2xl px-8 shadow-[0_0_20px_rgba(0,0,0,0.1)] items-center justify-center w-full sm:w-auto"
							>
								<div className="flex items-center gap-2 transition-transform duration-300 group-hover:-translate-x-3">
									<Map className="w-5 h-5" strokeWidth={1.5} />
									<span>{t("explore")}</span>
								</div>
								<div className="absolute right-3 rtl:left-3 translate-x-4 rtl:-translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
									<ArrowRight
										className="w-5 h-5 text-amber-500"
										strokeWidth={2}
									/>
								</div>
							</Link>
						</div>

						{/* Trust Section */}
						<div className="pt-6 border-t flex items-center gap-6 mt-4 border-neutral-200">
							<div className="flex -space-x-3">
								{[
									"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&h=64",
									"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64",
									"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64",
								].map((src, i) => (
									<div
										key={i}
										className="relative w-10 h-10 rounded-full border-2 border-white bg-neutral-200 overflow-hidden"
									>
										<Image
											src={src}
											alt="User"
											fill
											className="object-cover"
											sizes="40px"
										/>
									</div>
								))}
								<div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium bg-neutral-100 text-neutral-900">
									+2k
								</div>
							</div>
							<div>
								<div className="flex items-center gap-1 text-amber-500">
									{[...Array(5)].map((_, i) => (
										<Star key={i} className="w-4 h-4 fill-current" />
									))}
								</div>
								<p className="text-sm text-neutral-500 mt-0.5">
									{t("happyClients")}
								</p>
							</div>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-3 gap-8 mt-4 pt-6 border-t border-neutral-200">
							<div>
								<h4 className="text-2xl md:text-3xl font-bold text-neutral-900">
									3<span className="text-lg text-amber-500 align-top">+</span>
								</h4>
								<p className="text-[10px] tracking-wider uppercase text-neutral-500 mt-1">
									{ts("properties")}
								</p>
							</div>
							<div>
								<h4 className="text-2xl md:text-3xl font-bold text-neutral-900">
									12
								</h4>
								<p className="text-[10px] tracking-wider uppercase text-neutral-500 mt-1">
									{ts("awards")}
								</p>
							</div>
							<div>
								<h4 className="text-2xl md:text-3xl font-bold text-neutral-900">
									99<span className="text-lg text-amber-500 align-top">%</span>
								</h4>
								<p className="text-[10px] tracking-wider uppercase text-neutral-500 mt-1">
									{ts("satisfaction")}
								</p>
							</div>
						</div>
					</motion.div>

					{/* Right Column: Visual Composition */}
					<motion.div
						className="md:col-span-6 lg:col-span-7 relative h-[400px] sm:h-[500px] md:h-[550px] lg:h-[600px] w-full"
						initial={{ opacity: 0, x: 20 }} // Reduced distance
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }} // Removed delay for LCP
					>
						<div className="grid grid-cols-2 lg:grid-cols-12 grid-rows-4 lg:grid-rows-6 gap-3 md:gap-4 h-full w-full">
							{/* Main Tall Image - LCP Candidate */}
							<div className="col-span-2 lg:col-span-5 row-span-2 lg:row-span-6 rounded-2xl md:rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-2xl">
								{/* Priority LCP Image */}
								<Image
									src="/main-img.png"
									alt="Mountain Landscape"
									fill
									className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
									priority
									sizes="(max-width: 768px) 100vw, 40vw"
								/>
								<div className="bg-gradient-to-t to-transparent from-black/60 absolute inset-0" />
								<div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white">
									<p className="text-[10px] md:text-xs font-medium uppercase tracking-wider text-amber-400 mb-0.5 md:mb-1">
										{t("showcase.adventure")}
									</p>
									<h3 className="text-lg md:text-xl font-medium tracking-tight">
										{t("showcase.serbianWoods")}
									</h3>
								</div>
							</div>

							{/* Top Right Wide Image */}
							<div className="col-span-1 lg:col-span-7 row-span-2 lg:row-span-3 rounded-2xl md:rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-2xl">
								<Image
									src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop"
									alt="Lake Switzerland"
									fill
									className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
									sizes="(max-width: 768px) 50vw, 40vw"
									loading="eager"
								/>
								<div className="absolute top-3 right-3 md:top-4 md:right-4 backdrop-blur-md border px-2 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5 md:gap-2 bg-white/10 border-white/10">
									<span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-400"></span>
									<span className="text-[10px] md:text-xs font-medium text-white">
										{t("showcase.popular")}
									</span>
								</div>
							</div>

							{/* Bottom Right Image */}
							<div className="col-span-1 lg:col-span-7 row-span-2 lg:row-span-3 rounded-2xl md:rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-2xl">
								<Image
									src="/main-img1.png"
									alt="Kyoto Streets"
									fill
									className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
									sizes="(max-width: 768px) 50vw, 40vw"
								/>
							</div>
						</div>

						{/* Floating UI Card */}
						<motion.div
							className="absolute top-[40%] right-[-20px] rtl:right-auto rtl:left-[-20px] bg-black/30 backdrop-blur-md border border-white/10 p-5 rounded-[2rem] w-72 shadow-2xl transform hover:-translate-y-2 transition-transform duration-300 hidden lg:block"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.8 }}
						>
							<div className="flex items-center justify-between mb-4 ">
								<span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
									{t("showcase.apartmentDetails")}
								</span>
								<Link
									href="/#apartments"
									scroll={false}
									className="text-xs font-medium uppercase tracking-wide text-zinc-400 flex items-center gap-1"
								>
									<ArrowRight className="w-4 h-4 fill-current" />
								</Link>
							</div>
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
									<House className="w-5 h-5 fill-current" />
								</div>
								<div>
									<p className="text-sm font-medium text-white">
										{t("showcase.apartmentsForRent")}
									</p>
									<p className="text-xs text-zinc-400">
										{t("showcase.capacity")}
									</p>
								</div>
							</div>
							<div className="flex items-center justify-between p-3 rounded-xl border bg-white/5 border-white/5">
								<span className="text-xs text-zinc-400">
									{t("showcase.nightlyRate")}
								</span>
								<span className="text-sm font-semibold text-amber-400">
									{t("showcase.price")}
								</span>
							</div>
							<div className="mt-3 flex items-center gap-2 text-xs font-medium w-max px-2 py-1 rounded-md text-emerald-400 bg-emerald-400/10">
								<CheckCircle2 className="w-3 h-3" />
								{t("showcase.available")}
							</div>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
