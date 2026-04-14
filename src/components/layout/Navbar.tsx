"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Home, List, MapPin, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navbar() {
	const t = useTranslations("Navigation");
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const [isTop, setIsTop] = useState(true);
	const lastScrollY = useRef(0);
	const pathname = usePathname();

	const navLinks = [
		{ name: t("home"), path: "/", id: "hero" },
		{ name: t("apartments"), path: "/", id: "apartments" },
		{ name: t("attractions"), path: "/", id: "attractions" },
	];

	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
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
		targetId: string,
	) => {
		e.preventDefault();
		setIsOpen(false);
		const targetElement = document.getElementById(targetId);
		if (targetElement) {
			targetElement.scrollIntoView({ behavior: "smooth" });
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
						"pointer-events-auto w-full px-4 md:px-6 py-2 transition-all duration-500 flex items-center justify-between h-20",
						!isTop && "bg-white/80 backdrop-blur-md shadow-sm py-1",
					)}
				>
					<Link
						href="/"
						onClick={(e) => {
							if (pathname === "/" || !pathname) {
								e.preventDefault();
								window.scrollTo({ top: 0, behavior: "smooth" });
							}
							setIsOpen(false);
						}}
						className="flex items-center gap-2"
					>
						<Logo
							className="h-10 w-10 md:h-12 md:w-12"
							variant="dark"
							noBackground
						/>
					</Link>

					<div className="hidden md:flex items-center gap-1 ms-auto">
						{navLinks.map((link) => (
							<Link
								key={link.path + link.name}
								href={link.path as string}
								onClick={(e) => handleNavClick(e, link.id)}
								className={cn(
									"px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
									"text-gray-600 hover:text-gray-900 hover:bg-white/50",
								)}
							>
								{link.name}
							</Link>
						))}
						<div className="ms-2 ps-2 border-s border-gray-100">
							{isMounted && <LanguageSwitcher />}
						</div>
					</div>

					<div className="flex items-center gap-2 ms-auto md:ms-0">
						<div className="md:hidden">{isMounted && <LanguageSwitcher />}</div>
						<button
							type="button"
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

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-40 bg-white md:hidden pt-28 px-4 flex flex-col h-screen overflow-y-auto"
					>
						<div className="flex flex-col space-y-3 pb-20">
							{navLinks.map((link) => (
								<Link
									key={link.path + link.name}
									href={link.path as string}
									onClick={(e) => handleNavClick(e, link.id)}
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
