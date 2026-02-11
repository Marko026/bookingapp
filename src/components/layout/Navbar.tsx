"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Home, List, MapPin, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/providers/LenisProvider"; // Import useLenis
import { Logo } from "@/components/ui/Logo";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
	const t = useTranslations("Navigation");
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const [isTop, setIsTop] = useState(true);
	const lastScrollY = useRef(0);
	const pathname = usePathname();
	const router = useRouter();
	const lenis = useLenis(); // Get Lenis instance

	const navLinks = [
		{ name: t("home"), path: "/#hero", id: "hero" },
		{ name: t("apartments"), path: "/#apartments", id: "apartments" },
		{ name: t("attractions"), path: "/#attractions", id: "attractions" },
	];

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			setIsTop(currentScrollY < 50);
			if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
				setIsVisible(false);
			} else {
				setIsVisible(true);
			}
			lastScrollY.current = currentScrollY;
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const toggleMenu = () => setIsOpen(!isOpen);

	const handleNavClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
		href: string,
	) => {
		setIsOpen(false);
		if (href.startsWith("/#") && lenis) {
			e.preventDefault(); // Prevent default Next.js Link behavior
			// We need to strip the current locale from the pathname to correctly identify the hash target
			const currentPath = pathname.endsWith("/")
				? pathname.slice(0, -1)
				: pathname; // Remove trailing slash if present
			const targetId = href.split("#")[1]; // Get the ID from the hash, e.g., "apartments"
			const targetElement = document.getElementById(targetId);

			if (targetElement) {
				lenis.scrollTo(targetElement);
			}
		}
	};

	return (
		<>
			<motion.nav
				initial={{ y: 0 }}
				animate={{ y: isVisible ? 0 : -120 }}
				transition={{ duration: 0.3 }}
				className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
			>
				<div
					className={cn(
						"pointer-events-auto w-full px-6 py-2 transition-all duration-500 flex items-center justify-between h-20", // Standard height
						// Visual logic: Glass at top, Custom smooth shadow on scroll
						isTop
							? "bg-white/90 backdrop-blur-xl border-b border-white/20"
							: "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100",
					)}
				>
					{/* Logo Container - optimizing allows for larger visual logo */}
					<Link
						href="/#hero"
						scroll={false}
						onClick={(e) => handleNavClick(e, "/#hero")} // Pass event and href
						className="flex items-center group relative z-50 pointer-events-auto"
					>
						<Logo className="origin-left" />
					</Link>

					{/* Desktop Links - Aligned Right */}
					<div className="hidden md:flex items-center gap-1 ms-auto">
						{navLinks.map((link) => (
							<Link
								key={link.path + link.name}
								href={link.path as any}
								scroll={false}
								onClick={(e) => handleNavClick(e, link.path)} // Pass event and href
								className={cn(
									"px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
									"text-gray-600 hover:text-gray-900 hover:bg-white/50",
								)}
							>
								{link.name}
							</Link>
						))}
						<div className="ms-2 ps-2 border-s border-gray-100">
							<LanguageSwitcher />
						</div>
					</div>

					{/* Right Side: Mobile Toggle only + Switcher */}
					<div className="flex items-center gap-2 ms-auto md:ms-0">
						<div className="md:hidden">
							<LanguageSwitcher />
						</div>
						{/* Mobile Menu Toggle */}
						<button
							onClick={toggleMenu}
							className="md:hidden p-1.5 md:p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors pointer-events-auto"
						>
							{isOpen ? (
								<X size={20} className="md:w-6 md:h-6" />
							) : (
								<Menu size={20} className="md:w-6 md:h-6" />
							)}
						</button>
					</div>
				</div>
			</motion.nav>

			{/* Mobile Menu Overlay */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						className="fixed inset-0 z-40 bg-white md:hidden pt-28 px-6 flex flex-col h-screen overflow-y-auto"
					>
						<div className="flex flex-col space-y-3 pb-20">
							{navLinks.map((link) => (
								<Link
									key={link.path + link.name}
									href={link.path as any}
									scroll={false}
									onClick={(e) => handleNavClick(e, link.path)} // Pass event and href
									className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 text-xl font-serif text-gray-900 active:scale-95 transition-all"
								>
									<span>{link.name}</span>
									<div className="bg-white p-2 rounded-full shadow-sm">
										{link.id === "hero" && <Home size={20} />}
										{link.id === "apartments" && <List size={20} />}
										{link.id === "attractions" && <MapPin size={20} />}
									</div>
								</Link>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
